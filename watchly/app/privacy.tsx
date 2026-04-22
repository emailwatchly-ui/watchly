import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { COLORS } from '../constants'

const BACK = String.fromCodePoint(0x2190)

export default function PrivacyScreen() {
  const router = useRouter()
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{BACK} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PRIVACY POLICY</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: April 2026</Text>

        <Text style={styles.section}>1. Information We Collect</Text>
        <Text style={styles.body}>
          We collect information you provide when creating an account (email address), submitting crime reports (location, incident details, category), and using the app (device information, usage patterns).
        </Text>

        <Text style={styles.section}>2. How We Use Your Information</Text>
        <Text style={styles.body}>
          Your information is used to display crime reports on the community map, improve the app experience, moderate submitted content, and communicate important updates. We do not sell your personal information to third parties.
        </Text>

        <Text style={styles.section}>3. Location Data</Text>
        <Text style={styles.body}>
          Location is only accessed when you submit a report or use the map. You may enable location masking to offset your reported pin by approximately 75 metres for privacy. We do not track your location continuously.
        </Text>

        <Text style={styles.section}>4. Data Storage</Text>
        <Text style={styles.body}>
          Your data is stored securely using Supabase infrastructure hosted in Sydney, Australia. We implement industry-standard security measures including row-level security and encrypted connections.
        </Text>

        <Text style={styles.section}>5. Report Moderation</Text>
        <Text style={styles.body}>
          All submitted reports are reviewed by moderators before appearing publicly on the map. Moderators may reject reports that are inaccurate, inappropriate, or violate our community guidelines.
        </Text>

        <Text style={styles.section}>6. Your Rights</Text>
        <Text style={styles.body}>
          You may request deletion of your account and associated data at any time by contacting us at emailwatchly@gmail.com. You may also edit or delete your own reports within the app.
        </Text>

        <Text style={styles.section}>7. Contact</Text>
        <Text style={styles.body}>
          For privacy-related questions, contact us at emailwatchly@gmail.com.
        </Text>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: '#2d3148',
  },
  backBtn: { width: 60 },
  backText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  headerTitle: { fontSize: 13, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 3 },
  scroll: { flex: 1, padding: 24 },
  updated: { fontSize: 12, color: COLORS.textMuted, marginBottom: 24 },
  section: { fontSize: 14, fontWeight: '800', color: COLORS.primary, letterSpacing: 1, marginTop: 24, marginBottom: 8 },
  body: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
})
