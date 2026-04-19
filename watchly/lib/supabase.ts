import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const supabaseUrl = 'https://epjusywewvbjhqvoulmy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwanVzeXdld3Ziamhxdm91bG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODcyNDEsImV4cCI6MjA5MjE2MzI0MX0.izuvW0jLfTbRcQFJiqCPrtfE2l0k4P7N4nNBBrDiLMw'

// Secure storage adapter for mobile (falls back to localStorage on web)
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(localStorage.getItem(key))
    }
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value)
      return Promise.resolve()
    }
    return SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key)
      return Promise.resolve()
    }
    return SecureStore.deleteItemAsync(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
})

// Type helpers
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          suburb: string | null
          state: string | null
          country: string
          is_verified: boolean
          is_moderator: boolean
          reports_count: number
          created_at: string
          updated_at: string
        }
      }
      crime_reports: {
        Row: {
          id: string
          user_id: string | null
          category_id: string | null
          address_suburb: string | null
          address_state: string | null
          address_postcode: string | null
          is_location_masked: boolean
          title: string
          description: string | null
          incident_type: 'committed' | 'attempted'
          incident_date: string
          incident_time: string | null
          status: 'pending' | 'approved' | 'rejected' | 'flagged'
          upvotes: number
          views: number
          created_at: string
          updated_at: string
        }
      }
      crime_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string
          created_at: string
        }
      }
    }
  }
}
