import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { COLORS } from '../constants'

export default function TermsScreen() {
  const router = useRouter()
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{String.fromCodePoint(0x2190)} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TERMS OF SERVICE</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: April 2026</Text>
        <Text style={styles.section}>1. Acceptance of Terms</Text>
        <Text style={styles.body}>By using Watchly, you agree to these Terms of Service. If you do not agree, please do not use the app.</Text>
        <Text style={styles.section}>2. Responsible Reporting</Text>
        <Text style={styles.body}>You agree to submit only accurate, truthful crime reports based on real incidents. Submitting false or misleading reports is prohibited and may result in account termination.</Text>
        <Text style={styles.section}>3. Community Guidelines</Text>
        <Text style={styles.body}>Reports must not target specific individuals, contain personal identifying information of third parties, include hate speech, or be used for harassment. We reserve the right to remove violating content.</Text>
        <Text style={styles.section}>4. Not a Police Service</Text>
        <Text style={styles.body}>Watchly is a community awareness tool, not a replacement for emergency services. For emergencies, always call 000. For non-emergency matters, contact your local police station.</Text>
        <Text style={styles.section}>5. Rate Limits</Text>
        <Text style={styles.body}>Users are limited to 5 report submissions per 24-hour period. Abuse of the reporting system may result in account suspension.</Text>
        <Text style={styles.section}>6. Moderation</Text>
        <Text style={styles.body}>All reports are subject to review before public display. We reserve the right to reject or remove any report at our discretion.</Text>
        <Text style={styles.section}>7. Disclaimer</Text>
        <Text style={styles.body}>Watchly provides community-submitted information on an as-is basis. We make no guarantees about accuracy. Do not rely solely on Watchly for safety decisions.</Text>
        <Text style={styles.section}>8. Contact</Text>
        <Text style={styles.body}>For questions, contact us at emailwatchly@gmail.com.</Text>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: '#2d3148' },
  backBtn: { width: 60 },
  backText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  headerTitle: { fontSize: 13, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 3 },
  scroll: { flex: 1, padding: 24 },
  updated: { fontSize: 12, color: COLORS.textMuted, marginBottom: 24 },
  section: { fontSize: 14, fontWeight: '800', color: COLORS.primary, letterSpacing: 1, marginTop: 24, marginBottom: 8 },
  body: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
})
