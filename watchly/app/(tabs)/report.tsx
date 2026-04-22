import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Switch, Alert, ActivityIndicator, Platform
} from 'react-native'
import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import * as Location from 'expo-location'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { COLORS, LOCATION_MASK_RADIUS_M } from '../../constants'

type Category = { id: string; name: string; icon: string; color: string }

const CATEGORY_EMOJI: Record<string, string> = {
  home: '🏠', car: '🚗', 'alert-triangle': '⚠️', 'dollar-sign': '💰',
  tool: '🔧', package: '📦', eye: '👁️', activity: '💊', 'more-horizontal': '📋',
}

export default function ReportScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [incidentType, setIncidentType] = useState<'committed' | 'attempted'>('committed')
  const [maskLocation, setMaskLocation] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [suburb, setSuburb] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [step, setStep] = useState(1)
  // Manual address mode
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('gps')
  const [manualAddress, setManualAddress] = useState('')
  const [manualSuburb, setManualSuburb] = useState('')
  const [geocoding, setGeocoding] = useState(false)

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('crime_categories').select('*').order('name')
    if (data) setCategories(data)
  }

  const getGPSLocation = async () => {
    setLocationLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is needed to pin the incident.')
        return
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude })
      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      })
      if (geocode[0]) {
        setSuburb(geocode[0].district || geocode[0].subregion || geocode[0].city || '')
      }
      setStep(Math.max(step, 3))
    } catch (e) {
      Alert.alert('Location error', 'Could not get your location.')
    } finally {
      setLocationLoading(false)
    }
  }

  const geocodeManualAddress = async () => {
    if (!manualAddress.trim()) {
      Alert.alert('Required', 'Please enter a street address.')
      return
    }
    setGeocoding(true)
    try {
      const fullAddress = manualSuburb
        ? `${manualAddress}, ${manualSuburb}, Australia`
        : `${manualAddress}, Australia`
      const results = await Location.geocodeAsync(fullAddress)
      if (results.length > 0) {
        setLocation({ lat: results[0].latitude, lng: results[0].longitude })
        setSuburb(manualSuburb || manualAddress)
        setStep(Math.max(step, 3))
        Alert.alert('Address found ✅', `Pinned at: ${manualAddress}`)
      } else {
        Alert.alert('Address not found', 'Try adding a suburb or state to help narrow it down.')
      }
    } catch (e) {
      Alert.alert('Error', 'Could not look up that address. Check your connection and try again.')
    } finally {
      setGeocoding(false)
    }
  }

  const maskCoordinates = (lat: number, lng: number) => {
    const earthRadius = 6371000
    const offsetLat = (Math.random() - 0.5) * 2 * (LOCATION_MASK_RADIUS_M / earthRadius) * (180 / Math.PI)
    const offsetLng = (Math.random() - 0.5) * 2 * (LOCATION_MASK_RADIUS_M / earthRadius) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180)
    return { lat: lat + offsetLat, lng: lng + offsetLng }
  }

  const handleSubmit = async () => {
    if (!selectedCategory) return Alert.alert('Required', 'Please select a crime category.')
    if (!title.trim()) return Alert.alert('Required', 'Please enter a title for the report.')
    if (!location) return Alert.alert('Required', 'Please set the location of the incident.')
    setSubmitting(true)
    try {
      // Rate limit check — max 5 reports per 24 hours
      const { data: rateOk } = await supabase.rpc('check_report_rate_limit', { user_uuid: user?.id })
      if (!rateOk) {
        setSubmitting(false)
        return Alert.alert('Limit reached', 'You can submit up to 5 reports per day. Please try again tomorrow.')
      }
      const displayLocation = maskLocation ? maskCoordinates(location.lat, location.lng) : location
      const { error } = await supabase.from('crime_reports').insert({
        user_id: user?.id,
        category_id: selectedCategory,
        location: `POINT(${displayLocation.lng} ${displayLocation.lat})`,
        location_masked: maskLocation ? `POINT(${displayLocation.lng} ${displayLocation.lat})` : null,
        is_location_masked: maskLocation,
        address_suburb: suburb || null,
        title: title.trim(),
        description: description.trim() || null,
        incident_type: incidentType,
        incident_date: new Date().toISOString().split('T')[0],
      })
      if (error) throw error
      Alert.alert('Report submitted ✅', 'Thank you for keeping your community safe.', [
        { text: 'View Map', onPress: () => router.push('/(tabs)/map') },
      ])
      setSelectedCategory(null); setTitle(''); setDescription('')
      setLocation(null); setSuburb(''); setStep(1)
      setManualAddress(''); setManualSuburb(''); setLocationMode('gps')
    } catch (err: any) {
      Alert.alert('Submission failed', err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>REPORT INCIDENT</Text>
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map(s => (
            <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]} />
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* STEP 1: Category */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>01 — CRIME TYPE</Text>
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.id && styles.categoryButtonSelected,
                  selectedCategory === cat.id && { borderColor: cat.color },
                ]}
                onPress={() => { setSelectedCategory(cat.id); setStep(Math.max(step, 2)) }}
              >
                <Text style={styles.categoryEmoji}>{CATEGORY_EMOJI[cat.icon] || '📋'}</Text>
                <Text style={[styles.categoryText, selectedCategory === cat.id && { color: cat.color }]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {step >= 2 && (
          <>
            {/* STEP 2: Details */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>02 — INCIDENT DETAILS</Text>
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[styles.typeButton, incidentType === 'committed' && styles.typeButtonActive]}
                  onPress={() => setIncidentType('committed')}
                >
                  <Text style={[styles.typeButtonText, incidentType === 'committed' && styles.typeButtonTextActive]}>
                    COMMITTED
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, incidentType === 'attempted' && styles.typeButtonActiveWarning]}
                  onPress={() => setIncidentType('attempted')}
                >
                  <Text style={[styles.typeButtonText, incidentType === 'attempted' && styles.typeButtonTextActive]}>
                    ATTEMPTED
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Brief title (e.g. Car window smashed)"
                placeholderTextColor={COLORS.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={80}
              />
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Additional details (optional)..."
                placeholderTextColor={COLORS.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            {/* STEP 3: Location */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>03 — LOCATION</Text>

              {/* Mode toggle */}
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeButton, locationMode === 'gps' && styles.modeButtonActive]}
                  onPress={() => setLocationMode('gps')}
                >
                  <Text style={[styles.modeButtonText, locationMode === 'gps' && styles.modeButtonTextActive]}>
                    📍 Use GPS
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeButton, locationMode === 'manual' && styles.modeButtonActive]}
                  onPress={() => setLocationMode('manual')}
                >
                  <Text style={[styles.modeButtonText, locationMode === 'manual' && styles.modeButtonTextActive]}>
                    ⌨️ Enter Address
                  </Text>
                </TouchableOpacity>
              </View>

              {locationMode === 'gps' ? (
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={getGPSLocation}
                  disabled={locationLoading}
                >
                  {locationLoading
                    ? <ActivityIndicator color={COLORS.primary} size="small" />
                    : <>
                        <Text style={styles.locationIcon}>{location ? '✅' : '📍'}</Text>
                        <Text style={styles.locationText}>
                          {location
                            ? `Pinned${suburb ? ` — ${suburb}` : ''}`
                            : 'Use my current GPS location'}
                        </Text>
                      </>
                  }
                </TouchableOpacity>
              ) : (
                <View style={styles.manualSection}>
                  <TextInput
                    style={styles.input}
                    placeholder="Street address (e.g. 12 Main Street)"
                    placeholderTextColor={COLORS.textMuted}
                    value={manualAddress}
                    onChangeText={setManualAddress}
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Suburb (e.g. Braddon, ACT)"
                    placeholderTextColor={COLORS.textMuted}
                    value={manualSuburb}
                    onChangeText={setManualSuburb}
                    autoCapitalize="words"
                  />
                  <TouchableOpacity
                    style={[styles.geocodeButton, geocoding && { opacity: 0.6 }]}
                    onPress={geocodeManualAddress}
                    disabled={geocoding}
                  >
                    {geocoding
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={styles.geocodeButtonText}>
                          {location ? '✅ Address Pinned — Update' : 'PIN THIS ADDRESS'}
                        </Text>
                    }
                  </TouchableOpacity>
                </View>
              )}

              {/* Privacy mask toggle */}
              <View style={styles.maskRow}>
                <View style={styles.maskTextGroup}>
                  <Text style={styles.maskTitle}>Mask exact location</Text>
                  <Text style={styles.maskSub}>Offsets pin by ~75m for privacy</Text>
                </View>
                <Switch
                  value={maskLocation}
                  onValueChange={setMaskLocation}
                  trackColor={{ false: COLORS.bgInput, true: COLORS.primaryDark }}
                  thumbColor={maskLocation ? COLORS.primary : COLORS.textMuted}
                />
              </View>
            </View>

            {/* Submit */}
            {step >= 2 && location && (
              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.submitText}>SUBMIT REPORT</Text>
                }
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: '#2d3148',
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 3 },
  stepIndicator: { flexDirection: 'row', gap: 6 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.bgInput },
  stepDotActive: { backgroundColor: COLORS.primary },
  scroll: { flex: 1 },
  section: { padding: 24, gap: 14, borderBottomWidth: 1, borderBottomColor: '#1e2130' },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 2 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.bgCard, borderWidth: 1.5, borderColor: '#2d3148',
  },
  categoryButtonSelected: { backgroundColor: 'rgba(229,62,62,0.1)' },
  categoryEmoji: { fontSize: 14 },
  categoryText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  typeToggle: { flexDirection: 'row', backgroundColor: COLORS.bgInput, borderRadius: 10, padding: 3, gap: 3 },
  typeButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  typeButtonActive: { backgroundColor: COLORS.primary },
  typeButtonActiveWarning: { backgroundColor: '#744210' },
  typeButtonText: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  typeButtonTextActive: { color: '#fff' },
  input: {
    backgroundColor: COLORS.bgInput, borderRadius: 10, padding: 14,
    fontSize: 14, color: COLORS.textPrimary, borderWidth: 1, borderColor: '#2d3148',
  },
  inputMultiline: { height: 100, textAlignVertical: 'top' },
  modeToggle: { flexDirection: 'row', backgroundColor: COLORS.bgInput, borderRadius: 10, padding: 3, gap: 3 },
  modeButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  modeButtonActive: { backgroundColor: COLORS.primary },
  modeButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  modeButtonTextActive: { color: '#fff' },
  locationButton: {
    backgroundColor: COLORS.bgInput, borderRadius: 10, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#2d3148',
  },
  locationIcon: { fontSize: 20 },
  locationText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  manualSection: { gap: 10 },
  geocodeButton: {
    backgroundColor: COLORS.primary, borderRadius: 10, padding: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  geocodeButtonText: { fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  maskRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard, borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#2d3148',
  },
  maskTextGroup: { gap: 2 },
  maskTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  maskSub: { fontSize: 12, color: COLORS.textMuted },
  submitButton: {
    margin: 24, backgroundColor: COLORS.primary, borderRadius: 12,
    height: 54, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  submitText: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 2 },
})
