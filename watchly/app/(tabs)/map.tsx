import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Platform, Alert
} from 'react-native'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import * as Location from 'expo-location'
import { supabase } from '../../lib/supabase'
import { COLORS, CANBERRA_REGION } from '../../constants'

let MapView: any = null
let Marker: any = null
let Callout: any = null

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps')
  MapView = Maps.default
  Marker = Maps.Marker
  Callout = Maps.Callout
}

type Report = {
  id: string
  title: string
  incident_type: 'committed' | 'attempted'
  incident_date: string
  category_name: string
  category_color: string
  category_icon: string
  latitude: number
  longitude: number
  address_suburb: string | null
}

const FILTER_RANGES = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 3650 },
]

const ICON_MAP: Record<string, string> = {
  home: '🏠', car: '🚗', 'alert-triangle': '⚠️',
  'dollar-sign': '💰', tool: '🔧', package: '📦',
  eye: '👁', activity: '💊', 'more-horizontal': '📋',
}

export default function MapScreen() {
  const router = useRouter()
  const mapRef = useRef<any>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [locating, setLocating] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState(2)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  const fetchReports = async () => {
    setLoading(true)
    const days = FILTER_RANGES[selectedFilter].days
    const since = new Date()
    since.setDate(since.getDate() - days)

    const { data, error } = await supabase
      .from('crime_reports_with_category')
      .select('id, title, incident_type, incident_date, category_name, category_color, category_icon, address_suburb, latitude, longitude')
      .gte('incident_date', since.toISOString().split('T')[0])
      .order('incident_date', { ascending: false })
      .limit(500)

    if (!error && data) {
      const valid = data.filter((r: any) => r.latitude && r.longitude)
      setReports(valid)
    }
    setLoading(false)
  }

  // Get user location on mount and auto-centre map
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
        setUserLocation(coords)
        // Auto-centre map on user location
        setTimeout(() => {
          mapRef.current?.animateToRegion({
            ...coords,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 800)
        }, 500)
      }
    })()
  }, [])

  useEffect(() => { fetchReports() }, [selectedFilter])
  useFocusEffect(useCallback(() => { fetchReports() }, [selectedFilter]))

  const handleLocateMe = async () => {
    setLocating(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required to centre the map.')
        return
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
      setUserLocation(coords)
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }, 600)
    } catch (e) {
      Alert.alert('Error', 'Could not get your location.')
    } finally {
      setLocating(false)
    }
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>WATCHLY</Text>
          <Text style={styles.headerSub}>{reports.length} reports</Text>
        </View>
        <View style={styles.webFallback}>
          <Text style={styles.webFallbackIcon}>🗺️</Text>
          <Text style={styles.webFallbackText}>Map view requires the mobile app</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WATCHLY</Text>
        <Text style={styles.headerSub}>
          {loading ? 'Loading...' : `${reports.length} reports`}
        </Text>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={CANBERRA_REGION}
        customMapStyle={darkMapStyle}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{ latitude: report.latitude, longitude: report.longitude }}
            tracksViewChanges={false}
          >
            <View style={[
              styles.markerPin,
              { backgroundColor: report.category_color },
              report.incident_type === 'attempted' && styles.markerAttempted,
            ]}>
              <Text style={styles.markerText}>
                {ICON_MAP[report.category_icon] || '📍'}
              </Text>
            </View>
            <Callout tooltip>
              <View style={styles.callout}>
                <View style={[styles.calloutAccent, { backgroundColor: report.category_color }]} />
                <View style={styles.calloutBody}>
                  <View style={styles.calloutHeader}>
                    <Text style={styles.calloutCategory}>{report.category_name}</Text>
                    <View style={[
                      styles.calloutBadge,
                      report.incident_type === 'attempted' ? styles.badgeAttempted : styles.badgeCommitted
                    ]}>
                      <Text style={styles.calloutBadgeText}>
                        {report.incident_type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.calloutTitle}>{report.title}</Text>
                  <View style={styles.calloutMeta}>
                    {report.address_suburb && (
                      <Text style={styles.calloutMetaText}>📍 {report.address_suburb}</Text>
                    )}
                    <Text style={styles.calloutMetaText}>
                      🗓 {new Date(report.incident_date).toLocaleDateString('en-AU', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Filter bar */}
      <View style={styles.filterBar}>
        {FILTER_RANGES.map((f, i) => (
          <TouchableOpacity
            key={f.label}
            style={[styles.filterButton, selectedFilter === i && styles.filterButtonActive]}
            onPress={() => setSelectedFilter(i)}
          >
            <Text style={[styles.filterText, selectedFilter === i && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* GPS locate me button */}
      <TouchableOpacity
        style={styles.locateButton}
        onPress={handleLocateMe}
        activeOpacity={0.85}
      >
        {locating
          ? <ActivityIndicator color={COLORS.textPrimary} size="small" />
          : <Text style={styles.locateIcon}>◎</Text>
        }
      </TouchableOpacity>

      {/* FAB — add report */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/report')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={COLORS.primary} size="small" />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(15,17,23,0.9)',
    borderBottomWidth: 1, borderBottomColor: '#2d3148',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 4 },
  headerSub: { fontSize: 12, color: COLORS.textSecondary, letterSpacing: 1 },
  filterBar: {
    position: 'absolute', bottom: 88, left: 20, right: 20,
    flexDirection: 'row', backgroundColor: COLORS.bgCard,
    borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#2d3148', gap: 2,
  },
  filterButton: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  filterButtonActive: { backgroundColor: COLORS.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 0.5 },
  filterTextActive: { color: COLORS.textPrimary },
  markerPin: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5, shadowRadius: 4, elevation: 4,
  },
  markerAttempted: { borderStyle: 'dashed', opacity: 0.75 },
  markerText: { fontSize: 16 },
  callout: {
    flexDirection: 'row', backgroundColor: COLORS.bgCard,
    borderRadius: 12, overflow: 'hidden', width: 260,
    borderWidth: 1, borderColor: '#2d3148',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  calloutAccent: { width: 4 },
  calloutBody: { flex: 1, padding: 12, gap: 6 },
  calloutHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calloutCategory: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase' },
  calloutBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeCommitted: { backgroundColor: 'rgba(229,62,62,0.2)' },
  badgeAttempted: { backgroundColor: 'rgba(236,201,75,0.2)' },
  calloutBadgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 1, color: COLORS.textSecondary },
  calloutTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 20 },
  calloutMeta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  calloutMetaText: { fontSize: 11, color: COLORS.textSecondary },
  locateButton: {
    position: 'absolute', bottom: 220, right: 20,
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2d3148',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  locateIcon: { fontSize: 22, color: COLORS.textPrimary },
  fab: {
    position: 'absolute', bottom: 156, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  fabText: { fontSize: 28, fontWeight: '300', color: '#fff', lineHeight: 34 },
  loadingOverlay: { position: 'absolute', top: 110, right: 20 },
  webFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  webFallbackIcon: { fontSize: 64 },
  webFallbackText: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
})

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1d27' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d3148' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a4060' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f1117' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
]
