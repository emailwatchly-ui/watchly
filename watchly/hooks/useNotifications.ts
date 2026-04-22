import { useEffect, useRef } from 'react'
import { Platform, Alert } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export function useNotifications() {
  const { user } = useAuth()
  const notifListener = useRef<any>()
  const responseListener = useRef<any>()

  useEffect(() => {
    if (!user) return

    registerForPushNotifications(user.id)

    // Listen for notifications received while app is open
    notifListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification)
    })

    // Listen for user tapping a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data
      console.log('Notification tapped:', data)
    })

    return () => {
      if (notifListener.current) Notifications.removeNotificationSubscription(notifListener.current)
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [user])
}

export async function registerForPushNotifications(userId: string) {
  if (!Device.isDevice) return null

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  try {
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
      projectId: '760a7834-2c24-4c92-9f3f-5fcd4cc44480',
    })

    console.log('[Notifications] Got push token:', expoPushToken)
    if (expoPushToken) {
      // Upsert token to Supabase
      // Delete old token for this user first, then insert fresh
      await supabase.from('push_tokens').delete().eq('user_id', userId)
      await supabase.from('push_tokens').insert({
        user_id: userId,
        token: expoPushToken,
        platform: Platform.OS,
        updated_at: new Date().toISOString()
      })
    }

    console.log('[Notifications] Token saved to Supabase')
    return expoPushToken
  } catch (err) {
    console.error('[Notifications] Push token error:', err)
    return null
  }
}

export async function sendPushNotification(
  title: string,
  body: string,
  data: Record<string, any> = {}
) {
  // Fetch all tokens from Supabase
  const { data: tokens, error } = await supabase
    .from('push_tokens')
    .select('token')

  if (error || !tokens?.length) return { sent: 0, error: error?.message }

  // Send via Expo Push API
  const messages = tokens.map(({ token }) => ({
    to: token,
    title,
    body,
    data,
    sound: 'default',
    badge: 1,
  }))

  // Batch in chunks of 100 (Expo limit)
  const chunks = []
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100))
  }

  let totalSent = 0
  for (const chunk of chunks) {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(chunk),
    })
    if (res.ok) totalSent += chunk.length
  }

  // Log to Supabase
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    await supabase.from('notifications').insert({
      sent_by: session.user.id,
      title,
      body,
      data,
      recipient_count: totalSent,
    })
  }

  return { sent: totalSent }
}
