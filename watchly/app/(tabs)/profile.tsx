import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from 'react-native'
import { useState, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { COLORS } from '../../constants'

type Report = {
  id: string; title: string; status: string
  incident_type: string; incident_date: string
  category_name: string; category_color: string; address_suburb: string | null
}

type Stats = { total: number; approved: number; pending: number; rejected: number }

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0, rejected: 0 })
  const [profile, setProfile] = useState<{ display_name: string | null; is_moderator: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    const [profileRes, reportsRes] = await Promise.all([
      supabase.from('profiles').select('display_name, is_moderator').eq('id', user.id).single(),
      supabase.from('crime_reports')
        .select('id, title, status, incident_type, incident_date, address_suburb, category:crime_categories(name, color)')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
    ])
    if (profileRes.data) setProfile(profileRes.data)
    if (reportsRes.data) {
      const mapped = reportsRes.data.map((r: any) => ({
        ...r, category_name: r.category?.name || 'Unknown', category_color: r.category?.color || COLORS.primary,
      }))
      setReports(mapped)
      setStats({ total: mapped.length,
        approved: mapped.filter((r: any) => r.status === 'approved').length,
        pending: mapped.filter((r: any) => r.status === 'pending').length,
        rejected: mapped.filter((r: any) => r.status === 'rejected').length,
      })
    }
    setLoading(false)
  }

  useFocusEffect(useCallback(() => { fetchData() }, [user]))


  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut() } }
    ])
  }

  const statusColor = (s: string) => s === 'approved' ? '#48bb78' : s === 'pending' ? '#ecc94b' : s === 'rejected' ? COLORS.primary : COLORS.textMuted
  const PIN = "\uD83D\uDCCD"
  const CAL = "\uD83D\uDDD3\uFE0F"
  const SHIELD = "\uD83D\uDEE1\uFE0F"

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PROFILE</Text>
        {profile?.is_moderator && (
          <View style={styles.modBadge}><Text style={styles.modBadgeText}>{SHIELD} MOD</Text></View>
        )}
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={COLORS.primary} size="large" /></View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.email || 'U')[0].toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{profile?.display_name || user?.email?.split('@')[0] || 'Watchly User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            {[
              { label: 'Total', value: stats.total, color: COLORS.textPrimary },
              { label: 'Approved', value: stats.approved, color: '#48bb78' },
              { label: 'Pending', value: stats.pending, color: '#ecc94b' },
              { label: 'Rejected', value: stats.rejected, color: COLORS.primary },
            ].map(s => (
              <View key={s.label} style={styles.statItem}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
          {reports.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>MY REPORTS</Text>
              {reports.map(report => (
                <View key={report.id} style={styles.reportCard}>
                  <View style={[styles.reportAccent, { backgroundColor: report.category_color }]} />
                  <View style={styles.reportBody}>
                    <View style={styles.reportHeader}>
                      <Text style={[styles.reportCat, { color: report.category_color }]}>{report.category_name}</Text>
                      <View style={[styles.statusBadge, { borderColor: statusColor(report.status) }]}>
                        <Text style={[styles.statusText, { color: statusColor(report.status) }]}>{report.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.reportTitle} numberOfLines={2}>{report.title}</Text>
                    <View style={styles.reportMeta}>
                      {report.address_suburb && <Text style={styles.metaText}>{PIN} {report.address_suburb}</Text>}
                      <Text style={styles.metaText}>{CAL} {new Date(report.incident_date).toLocaleDateString('en-AU')}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyIcon}>{PIN}</Text>
              <Text style={styles.emptyText}>No reports yet</Text>
              <TouchableOpacity style={styles.reportBtn} onPress={() => router.push('/(tabs)/report')}>
                <Text style={styles.reportBtnText}>SUBMIT FIRST REPORT</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Feedback & Support */}
          <View style={styles.supportSection}>
            <Text style={styles.supportLabel}>SUPPORT</Text>
            <TouchableOpacity style={styles.supportBtn} onPress={() => router.push('/feedback')}>
              <View style={styles.supportBtnInner}>
                <Text style={styles.supportBtnIcon}>{"💬"}</Text>
                <View style={styles.supportBtnText}>
                  <Text style={styles.supportBtnTitle}>Send Feedback</Text>
                  <Text style={styles.supportBtnSub}>Help us improve Watchly</Text>
                </View>
                <Text style={styles.supportBtnArrow}>{"›"}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportBtn} onPress={() => router.push('/feedback')}>
              <View style={styles.supportBtnInner}>
                <Text style={styles.supportBtnIcon}>{"🐛"}</Text>
                <View style={styles.supportBtnText}>
                  <Text style={styles.supportBtnTitle}>Report a Bug</Text>
                  <Text style={styles.supportBtnSub}>Something not working right?</Text>
                </View>
                <Text style={styles.supportBtnArrow}>{"›"}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.legalRow}>
            <TouchableOpacity onPress={() => router.push('/privacy')}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalSep}>{"\u00B7"}</Text>
            <TouchableOpacity onPress={() => router.push('/terms')}>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutText}>SIGN OUT</Text>
          </TouchableOpacity>
          <Text style={styles.version}>WATCHLY v1.0 {"\u00B7"} AU</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: '#2d3148' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 3 },
  modBadge: { backgroundColor: 'rgba(229,62,62,0.15)', borderWidth: 1, borderColor: COLORS.primary,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  modBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 24,
    borderBottomWidth: 1, borderBottomColor: '#1e2130' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '900', color: '#fff' },
  userInfo: { flex: 1, gap: 4 },
  userName: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  userEmail: { fontSize: 13, color: COLORS.textSecondary },
  statsRow: { flexDirection: 'row', padding: 20, gap: 8, borderBottomWidth: 1, borderBottomColor: '#1e2130' },
  statItem: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 10, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: '#2d3148' },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },
  section: { padding: 20, gap: 10 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 2, marginBottom: 4 },
  reportCard: { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: 10,
    overflow: 'hidden', borderWidth: 1, borderColor: '#2d3148' },
  reportAccent: { width: 4 },
  reportBody: { flex: 1, padding: 12, gap: 6 },
  reportHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reportCat: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  statusBadge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  statusText: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  reportTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, lineHeight: 18 },
  reportMeta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metaText: { fontSize: 11, color: COLORS.textMuted },
  emptySection: { padding: 40, alignItems: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },
  reportBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
  reportBtnText: { fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  legalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingHorizontal: 24, marginTop: 16 },
  legalLink: { fontSize: 12, color: COLORS.textMuted, textDecorationLine: 'underline' },
  legalSep: { fontSize: 12, color: COLORS.textMuted },
  supportSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  supportLabel: {
    fontSize: 10, fontWeight: '800', color: COLORS.primary,
    letterSpacing: 2, marginBottom: 4,
  },
  supportBtn: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1, borderColor: '#2d3148',
  },
  supportBtnInner: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
  },
  supportBtnIcon: { fontSize: 22 },
  supportBtnText: { flex: 1, gap: 2 },
  supportBtnTitle: {
    fontSize: 15, fontWeight: '600', color: COLORS.textPrimary,
  },
  supportBtnSub: {
    fontSize: 12, color: COLORS.textMuted,
  },
  supportBtnArrow: {
    fontSize: 20, color: COLORS.textMuted, fontWeight: '300',
  },
  signOutBtn: { margin: 20, marginTop: 12, borderWidth: 1, borderColor: COLORS.primary,
    borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' },
  signOutText: { fontSize: 13, fontWeight: '800', color: COLORS.primary, letterSpacing: 2 },
  version: { fontSize: 9, color: '#2d3148', textAlign: 'center', letterSpacing: 3, marginBottom: 8 },
})
