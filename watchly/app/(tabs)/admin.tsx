import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, RefreshControl
} from 'react-native'
import { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { COLORS } from '../../constants'

const TICK  = String.fromCodePoint(0x2705)
const CROSS = String.fromCodePoint(0x274C)
const CLOCK = String.fromCodePoint(0x23F3)

type Report = {
  id: string; title: string; description: string | null
  incident_type: string; incident_date: string; status: string
  address_suburb: string | null; created_at: string
  category_name: string; category_color: string; reporter_name: string | null
}

export default function AdminScreen() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'pending'|'approved'|'rejected'>('pending')
  const [isModerator, setIsModerator] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('is_moderator').eq('id', user.id).single()
      .then(({ data }) => setIsModerator(data?.is_moderator || false))
  }, [user])

  const fetchReports = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('moderation_queue').select('*')
      .eq('status', filter).order('created_at', { ascending: false }).limit(50)
    if (!error && data) setReports(data)
    setLoading(false); setRefreshing(false)
  }

  useFocusEffect(useCallback(() => { fetchReports() }, [filter]))
  useEffect(() => { fetchReports() }, [filter])

  const updateStatus = async (id: string, status: 'approved'|'rejected') => {
    Alert.alert(status === 'approved' ? 'Approve' : 'Reject', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: status === 'approved' ? 'Approve' : 'Reject',
        style: status === 'rejected' ? 'destructive' : 'default',
        onPress: async () => {
          const { error } = await supabase.from('crime_reports').update({ status }).eq('id', id)
          if (error) Alert.alert('Error', error.message)
          else setReports(prev => prev.filter(r => r.id !== id))
        }
      }
    ])
  }

  if (!isModerator) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>{String.fromCodePoint(0x1F512)}</Text>
        <Text style={styles.emptyText}>Moderator access required</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MODERATION</Text>
        <Text style={styles.headerSub}>{reports.length} {filter}</Text>
      </View>
      <View style={styles.filterRow}>
        {(['pending','approved','rejected'] as const).map(f => (
          <TouchableOpacity key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}>
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={COLORS.primary} size="large" /></View>
      ) : reports.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>{TICK}</Text>
          <Text style={styles.emptyText}>No {filter} reports</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchReports() }}
            tintColor={COLORS.primary} />}>
          {reports.map(report => (
            <View key={report.id} style={styles.card}>
              <View style={[styles.cardAccent, { backgroundColor: report.category_color }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.category, { color: report.category_color }]}>
                    {report.category_name}
                  </Text>
                  <View style={[styles.badge,
                    report.incident_type === 'attempted' ? styles.badgeAttempted : styles.badgeCommitted]}>
                    <Text style={styles.badgeText}>{report.incident_type.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.title}>{report.title}</Text>
                {report.description && (
                  <Text style={styles.description} numberOfLines={3}>{report.description}</Text>
                )}
                <View style={styles.meta}>
                  {report.address_suburb && (
                    <Text style={styles.metaText}>{String.fromCodePoint(0x1F4CD)} {report.address_suburb}</Text>
                  )}
                  <Text style={styles.metaText}>
                    {String.fromCodePoint(0x1F5D3)} {new Date(report.incident_date).toLocaleDateString('en-AU')}
                  </Text>
                  <Text style={styles.metaText}>
                    {String.fromCodePoint(0x1F464)} {report.reporter_name || 'Anonymous'}
                  </Text>
                  <Text style={styles.metaText}>
                    {CLOCK} {new Date(report.created_at).toLocaleString('en-AU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </Text>
                </View>
                {filter === 'pending' && (
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.approveBtn} onPress={() => updateStatus(report.id, 'approved')}>
                      <Text style={styles.approveBtnText}>{TICK} Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => updateStatus(report.id, 'rejected')}>
                      <Text style={styles.rejectBtnText}>{CROSS} Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: '#2d3148' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 3 },
  headerSub: { fontSize: 12, color: COLORS.textSecondary, letterSpacing: 1 },
  filterRow: { flexDirection: 'row', backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1, borderBottomColor: '#2d3148',
    paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterTab: { flex: 1, paddingVertical: 8, borderRadius: 8,
    alignItems: 'center', backgroundColor: COLORS.bgInput },
  filterTabActive: { backgroundColor: COLORS.primary },
  filterTabText: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  filterTabTextActive: { color: '#fff' },
  scroll: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },
  card: { flexDirection: 'row', backgroundColor: COLORS.bgCard,
    borderRadius: 12, marginBottom: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: '#2d3148' },
  cardAccent: { width: 4 },
  cardBody: { flex: 1, padding: 14, gap: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  category: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeCommitted: { backgroundColor: 'rgba(229,62,62,0.2)' },
  badgeAttempted: { backgroundColor: 'rgba(236,201,75,0.2)' },
  badgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 1, color: COLORS.textSecondary },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 20 },
  description: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaText: { fontSize: 11, color: COLORS.textMuted },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  approveBtn: { flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: 'rgba(72,187,120,0.15)', borderWidth: 1, borderColor: '#48bb78', alignItems: 'center' },
  approveBtnText: { fontSize: 13, fontWeight: '700', color: '#48bb78' },
  rejectBtn: { flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: 'rgba(229,62,62,0.15)', borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center' },
  rejectBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
})
