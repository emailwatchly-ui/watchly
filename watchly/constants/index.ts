export const COLORS = {
  // Brand
  primary: '#E53E3E',
  primaryDark: '#C53030',
  primaryLight: '#FC8181',

  // Backgrounds
  bg: '#0f1117',
  bgCard: '#1a1d27',
  bgInput: '#242736',

  // Text
  textPrimary: '#F7FAFC',
  textSecondary: '#A0AEC0',
  textMuted: '#4A5568',

  // Status
  success: '#48BB78',
  warning: '#ECC94B',
  danger: '#FC8181',

  // Map overlay
  mapOverlay: 'rgba(15, 17, 23, 0.85)',

  // Crime category colours (match DB seed)
  categories: {
    'Break & Enter': '#E53E3E',
    'Vehicle Theft': '#DD6B20',
    'Assault': '#D53F8C',
    'Robbery': '#805AD5',
    'Vandalism': '#2B6CB0',
    'Theft': '#2C7A7B',
    'Suspicious Activity': '#744210',
    'Drug Activity': '#22543D',
    'Other': '#718096',
  },
}

export const SUPABASE_URL = 'https://epjusywewvbjhqvoulmy.supabase.co'

export const GOOGLE_CLIENT_ID = '128071343253-8ibt959omp4n15sugom9ru67j1ur0rql.apps.googleusercontent.com'

// Default map region - Australia
export const DEFAULT_REGION = {
  latitude: -25.2744,
  longitude: 133.7751,
  latitudeDelta: 30,
  longitudeDelta: 30,
}

// Canberra default (your location)
export const CANBERRA_REGION = {
  latitude: -35.2809,
  longitude: 149.1300,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
}

// Location masking offset in metres (~2-3 house radius)
export const LOCATION_MASK_RADIUS_M = 75
