import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { COLORS } from '../constants'

const FEATURES = [
  { icon: '🗺️', title: 'Community Safety Map', body: 'Browse an interactive map of community-submitted safety awareness posts from your neighbourhood.' },
  { icon: '📌', title: 'Share Awareness', body: 'Share safety awareness with your neighbours. All posts are reviewed by community moderators before appearing.' },
  { icon: '🔔', title: 'Stay Informed', body: 'Receive notifications about safety awareness activity in your local area.' },
  { icon: '🛡️', title: 'Privacy First', body: 'Enable location masking to offset your pin by ~75m. Your exact location is never revealed.' },
  { icon: '👥', title: 'Community Moderated', body: 'Every post is reviewed by a community moderator before appearing publicly.' },
]

export default function AboutScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'←'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ABOUT WATCHLY</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerIcon}>{'🚨'}</Text>
          <Text style={styles.disclaimerText}>
            Watchly is a community awareness tool only. It has no affiliation with any government or emergency services agency. For emergencies, always contact your local emergency services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WHAT IS WATCHLY?</Text>
          <Text style={styles.sectionBody}>
            Watchly is a digital community noticeboard. Residents share local safety awareness information with each other to help keep the community informed.
          </Text>
          <Text style={styles.sectionBody}>
            Think of it as a neighbourhood watch group presented on a map. No information is ever sent to any authority or emergency service.
          </Text>
        </View>

        <Text style={styles.featuresTitle}>FEATURES</Text>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureCard}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureBody}>{f.body}</Text>
            </View>
          </View>
        ))}

        <View style={styles.notAffiliatedCard}>
          <Text style={styles.notAffiliatedTitle}>NOT AFFILIATED WITH EMERGENCY SERVICES</Text>
          <Text style={styles.notAffiliatedBody}>
            Watchly does not contact, notify, or work with any emergency service or government agency. Posts are community awareness information only. For emergencies, always call your local emergency services.
          </Text>
        </View>
        <View style={{ height: 40 }} />
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
  scroll: { flex: 1, padding: 20 },
  disclaimer: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: 'rgba(229,62,62,0.08)',
    borderWidth: 1, borderColor: 'rgba(229,62,62,0.3)',
    borderRadius: 12, padding: 16, marginBottom: 24,
  },
  disclaimerIcon: { fontSize: 22 },
  disclaimerText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 2, marginBottom: 12 },
  sectionBody: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 8 },
  featuresTitle: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 2, marginBottom: 12 },
  featureCard: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: '#2d3148',
    padding: 14, marginBottom: 10,
  },
  featureIcon: { fontSize: 28 },
  featureText: { flex: 1, gap: 4 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  featureBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  notAffiliatedCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: '#2d3148',
    padding: 20, marginTop: 8, gap: 8,
  },
  notAffiliatedTitle: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 1.5 },
  notAffiliatedBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
})
