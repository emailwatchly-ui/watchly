import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const supabaseUrl = 'https://epjusywewvbjhqvoulmy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwanVzeXdld3Ziamhxdm91bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODcyNDEsImV4cCI6MjA5MjE2MzI0MX0.izuvW0jLfTbRcQFJiqCPrtfE2l0k4P7N4nNBBrDiLMw'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') return Promise.resolve(localStorage.getItem(key))
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return Promise.resolve() }
    return SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return Promise.resolve() }
    return SecureStore.deleteItemAsync(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
})
