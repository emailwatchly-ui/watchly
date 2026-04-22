import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

const supabaseUrl = 'https://epjusywewvbjhqvoulmy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwanVzeXdld3Ziamhxdm91bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODcyNDEsImV4cCI6MjA5MjE2MzI0MX0.izuvW0jLfTbRcQFJiqCPrtfE2l0k4P7N4nNBBrDiLMw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage to persist PKCE flow state across browser redirects
    storage: Platform.OS !== 'web' ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
})
