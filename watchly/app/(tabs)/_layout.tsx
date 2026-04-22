import { Tabs } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { COLORS } from '../../constants'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, color }}>{icon}</Text>
    </View>
  )
}

export default function TabsLayout() {
  const { user } = useAuth()
  const [isModerator, setIsModerator] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('is_moderator').eq('id', user.id).single()
      .then(({ data }) => setIsModerator(data?.is_moderator || false))
  }, [user])

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: '#2d3148',
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.5,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen name="map" options={{
        title: 'Map',
        tabBarIcon: ({ color }) => <TabIcon icon={String.fromCodePoint(0x1F5FA)} color={color} />,
      }} />
      <Tabs.Screen name="report" options={{
        title: 'Report',
        tabBarIcon: ({ color }) => <TabIcon icon={String.fromCodePoint(0x1F4CB)} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <TabIcon icon={String.fromCodePoint(0x1F464)} color={color} />,
      }} />
      <Tabs.Screen name="admin" options={{
        title: 'Admin',
        href: isModerator ? undefined : null,
        tabBarIcon: ({ color }) => <TabIcon icon={String.fromCodePoint(0x1F6E1)} color={color} />,
      }} />
    </Tabs>
  )
}
