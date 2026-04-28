import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native'
import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import * as Location from 'expo-location'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { COLORS } from '../../constants'

type Category = { id: string; name: string; color: string; icon: string }

export default function ShareScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [suburb, setSuburb] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    supabase.from('incident_categories').select('*').order('name')
      .then(({ data }) => { if (data) setCategories(data) })
  }, [])

  const handleGPS = async () => {
    setLocating(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required to auto-fill your suburb.')
        return
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const [place] = await Location.reverseGeocodeAsync(loc.coords)
      if (place?.subregion || place?.city) {
        setSuburb(place.subregion || place.city || '')
      }
    } catch {
      Alert.alert('Error', 'Could not get location.')
    } finally {
      setLocating(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedCategory) return Alert.alert('Required', 'Please select a category.')
    if (!subject.trim()) return Alert.alert('Required', 'Please enter a subject.')
    if (!description.trim()) return Alert.alert('Required', 'Please describe what you observed.')
    if (description.trim().length < 10) return Alert.alert('Too short', 'Please provide a bit more detail.')

    setSubmitting(true)
    const { error } = await supabase.from('tips').insert({
      user_id: user?.id,
      category_id: selectedCategory,
      subject: subject.trim(),
      description: description.trim(),
      address_suburb: suburb.trim() || null,
      status: 'new',
    })
    setSubmitting(false)

    if (error) {
      Alert.alert('Error', 'Could not send your tip. Please try again.')
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>{'📬'}</Text>
          <Text style={styles.successTitle}>Tip Received!</Text>
          <Text style={styles.successBody}>
            Thanks for helping keep the community informed. Your tip has been sent to the community moderator for review.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => {
            setSubmitted(false)
            setSubject('')
            setDescription('')
            setSuburb('')
            setSelectedCategory(null)
          }}>
            <Text style={styles.doneBtnText}>SEND ANOTHER</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapBtn} onPress={() => router.push('/(tabs)/map')}>
            <Text style={styles.mapBtnText}>VIEW MAP</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SHARE A TIP</Text>
        <Text style={styles.headerSub}>Private — sent to moderator only</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>{'🔒'}</Text>
          <Text style={styles.infoText}>
            Your tip is private and will only be seen by the community moderator. It will never appear publicly without review.
          </Text>
        </View>

        {/* Category */}
        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryBtn, selectedCategory === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '18' }]}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryBtnText, selectedCategory === cat.id && { color: cat.color }]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subject */}
        <Text style={styles.label}>SUBJECT</Text>
        <TextInput
          style={styles.input}
          placeholder="Brief summary of what you observed"
          placeholderTextColor={COLORS.textMuted}
          value={subject}
          onChangeText={setSubject}
          maxLength={100}
          returnKeyType="next"
        />
        <Text style={styles.charCount}>{subject.length}/100</Text>

        {/* Description */}
        <Text style={styles.label}>DETAILS</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]}
          placeholder="Describe what you observed, when it happened, and any other relevant details..."
          placeholderTextColor={COLORS.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          maxLength={1000}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{description.length}/1000</Text>

        {/* Suburb */}
        <Text style={styles.label}>SUBURB (OPTIONAL)</Text>
        <View style={styles.suburbRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="e.g. Civic"
            placeholderTextColor={COLORS.textMuted}
            value={suburb}
            onChangeText={setSuburb}
            maxLength={50}
          />
          <TouchableOpacity style={styles.gpsBtn} onPress={handleGPS} disabled={locating}>
            {locating
              ? <ActivityIndicator color={COLORS.primary} size="small" />
              : <Text style={styles.gpsBtnText}>{'📍'} GPS</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.submitBtnText}>{'📬'} SEND TIP TO MODERATOR</Text>
          }
        </TouchableOpacity>

        <Text style={styles.footer}>
          Tips are reviewed by community moderators. Only approved awareness posts appear on the map.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#2d3148',
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 3 },
  headerSub: { fontSize: 11, color: COLORS.textMuted, letterSpacing: 1, marginTop: 4 },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  infoCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: 'rgba(66,153,225,0.08)',
    borderWidth: 1, borderColor: 'rgba(66,153,225,0.25)',
    borderRadius: 12, padding: 14, marginBottom: 24,
  },
  infoIcon: { fontSize: 18 },
  infoText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  label: { fontSize: 9, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 2, marginBottom: 10 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  categoryBtn: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#2d3148',
    backgroundColor: COLORS.bgCard,
  },
  categoryBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  input: {
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: '#2d3148',
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: COLORS.textPrimary, marginBottom: 4,
  },
  inputMulti: { height: 120, paddingTop: 14 },
  charCount: { fontSize: 10, color: COLORS.textMuted, textAlign: 'right', marginBottom: 20 },
  suburbRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  gpsBtn: {
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: '#2d3148',
    paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center',
  },
  gpsBtnText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14, height: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: 20,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 12, elevation: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  footer: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 16, lineHeight: 18 },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
  successIcon: { fontSize: 72 },
  successTitle: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary },
  successBody: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  doneBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 12, elevation: 8,
  },
  doneBtnText: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  mapBtn: {
    borderWidth: 1, borderColor: '#2d3148', borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40,
  },
  mapBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 2 },
})
