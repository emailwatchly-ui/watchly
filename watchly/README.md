# Watchly 👁

**Community Crime Awareness App** — iOS, Android & Web

A community-powered crime reporting and awareness platform built with Expo, Supabase and Google Maps.

---

## Tech Stack

- **Frontend:** Expo (React Native) + TypeScript
- **Navigation:** Expo Router (file-based)
- **Backend:** Supabase (PostgreSQL + PostGIS + Auth)
- **Maps:** react-native-maps (Google Maps)
- **Auth:** Supabase Auth with Google OAuth

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Google Maps API key

In `app.json`, replace the placeholder values:
```json
"googleMapsApiKey": "YOUR_GOOGLE_MAPS_IOS_API_KEY"
"apiKey": "YOUR_GOOGLE_MAPS_ANDROID_API_KEY"
```

For web, add your Maps JavaScript API key to a `.env` file:
```
EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY=your_key_here
```

### 3. Run the app

```bash
# Start dev server
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

---

## Project Structure

```
watchly/
├── app/
│   ├── _layout.tsx          # Root layout with AuthProvider
│   ├── index.tsx            # Auth redirect
│   ├── (auth)/
│   │   └── login.tsx        # Google sign-in screen
│   └── (tabs)/
│       ├── map.tsx          # Main map view (core feature)
│       ├── report.tsx       # Submit incident report
│       └── profile.tsx      # User profile & history
├── components/              # Shared UI components
├── hooks/
│   └── useAuth.tsx          # Auth context & Google sign-in
├── lib/
│   └── supabase.ts          # Supabase client
├── constants/
│   └── index.ts             # Theme, colours, config
└── app.json                 # Expo config
```

---

## Supabase Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup) |
| `crime_reports` | Core incident reports with PostGIS location |
| `crime_categories` | 9 pre-seeded crime types |
| `report_votes` | Community upvoting |
| `report_flags` | Moderation flagging |

---

## Key Features

- 📍 **Pin-drop reporting** with optional location masking (~75m radius)
- 🗺️ **Dark map overlay** with colour-coded crime markers
- 🕐 **Time filter** — 1W / 1M / 3M / 1Y / ALL
- 🔐 **Google OAuth** sign-in
- ✅ **Row Level Security** on all tables
- 🌏 **PostGIS** for geospatial queries

---

## Environment

- Supabase Project: `epjusywewvbjhqvoulmy` (Sydney, ap-southeast-2)
- Region: Oceania (Sydney) 🇦🇺
