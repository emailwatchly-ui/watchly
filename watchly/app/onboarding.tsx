import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { COLORS } from '../constants'

const SLIDES = [
  { icon: "\uD83D\uDEE1\uFE0F", title: 'Welcome to Watchly', subtitle: 'COMMUNITY SAFETY AWARENESS', body: 'Help keep your community safe by reporting and tracking crime incidents in your area.' },
  { icon: "\uD83D\uDDFA", title: 'Live Safety Map', subtitle: "SEE WHAT'S HAPPENING NEARBY", body: 'Browse an interactive map showing recent safety incident reports. Switch to heat map view to spot patterns instantly.' },
  { icon: "\uD83D\uDCCD", title: 'Report Incidents', subtitle: 'QUICK AND EASY REPORTING', body: 'Submit reports in seconds. Choose a category, describe what happened, and pin the location with optional privacy masking.' },
  { icon: "\uD83D\uDD12", title: 'Your Privacy Matters', subtitle: 'REPORT SAFELY', body: 'Enable location masking to offset your pin by ~75m. All reports are reviewed before appearing on the map.' },
]

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0)
  const router = useRouter()
  const isLast = current === SLIDES.length - 1
  const slide = SLIDES[current]

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true')
    router.replace('/(auth)/login')
  }

  const next = () => {
    if (isLast) {
      finish()
    } else {
      setCurrent(current + 1)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.accentBar} />
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={finish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
      <View style={styles.content}>
        <View style={styles.iconWrap}><Text style={styles.icon}>{slide.icon}</Text></View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (<View key={i} style={[styles.dot, i === current && styles.dotActive]} />))}
      </View>
      <TouchableOpacity style={styles.btn} onPress={next} activeOpacity={0.85}>
        <Text style={styles.btnText}>{isLast ? 'GET STARTED' : 'NEXT'}</Text>
      </TouchableOpacity>
      <View style={{ height: 48 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 32 },
  accentBar: { height: 3, width: '35%', backgroundColor: COLORS.primary, marginTop: 64, marginBottom: 8, borderRadius: 2 },
  skipBtn: { alignSelf: 'flex-end', paddingVertical: 8 },
  skipText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },
  content: { flex: 1, justifyContent: 'center', gap: 20 },
  iconWrap: { width: 96, height: 96, borderRadius: 28, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: '#2d3148', alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  icon: { fontSize: 48 },
  title: { fontSize: 30, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 0.5, lineHeight: 36 },
  subtitle: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 2.5 },
  body: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 26 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.bgInput },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8 },
  btnText: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 2.5 },
})
