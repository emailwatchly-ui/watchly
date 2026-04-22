import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, RefreshControl, TextInput
} from 'react-native'
import { useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { sendPushNotification } from '../../hooks/useNotifications'
import { COLORS } from '../../constants'

const TICK  = "✅"
const CROSS = "❌"
const CLOCK = "⏳"
const BELL  = "🔔"

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
  const [activeTab, setActiveTab] = useState<'reports'|'notify'|'feedback'>('reports')
  const [feedbackItems, setFeedbackItems] = useState<any[]>([])
  const [feedbackFilter, setFeedbackFilter] = useState<'new'|'reviewed'|'resolved'>('new')
  const [notifTitle, setNotifTitle] = useState('')
  const [notifBody, setNotifBody] = useState('')
  const [sending, setSending] = useState(false)

  useFocusEffect(useCallback(() => {
    if (!user) return
    supabase.from('profiles').select('is_moderator').eq('id', user.id).single()
      .then(({ data }) => setIsModerator(data?.is_moderator || false))
    fetchReports()
    fetchFeedback()
  }, [user, filter]))

  const fetchReports = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('moderation_queue').select('*')
      .eq('status', filter).order('created_at', { ascending: false }).limit(50)
    if (!error && data) setReports(data)
    setLoading(false); setRefreshing(false)
  }

  const fetchFeedback = async () => {
    const { data } = await supabase
      .from('feedback').select('*')
      .eq('status', feedbackFilter)
      .order('created_at', { ascending: false }).limit(50)
    if (data) setFeedbackItems(data)
  }

  const updateFeedbackStatus = async (id: string, status: 'reviewed'|'resolved') => {
    await supabase.from('feedback').update({ status }).eq('id', id)
    setFeedbackItems(prev => prev.filter(f => f.id !== id))
  }

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

  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      Alert.alert('Required', 'Please enter both a title and message.')
      return
    }
    Alert.alert(
      'Send Notification',
      'This will send a push notification to all users. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: async () => {
          setSending(true)
          const result = await sendPushNotification(notifTitle, notifBody)
          setSending(false)
          if (result.error) {
            Alert.alert('Error', result.error)
          } else {
            Alert.alert('Sent!', result.sent + ' notifications delivered.')
            setNotifTitle('')
            setNotifBody('')
          }
        }}
      ]
    )
  }

  if (!isModerator) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>{"🔒"}</Text>
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

      {/* Top tabs */}
      <View style={styles.topTabRow}>
        <TouchableOpacity
          style={[styles.topTab, activeTab === 'reports' && styles.topTabActive]}
          onPress={() => setActiveTab('reports')}>
          <Text style={[styles.topTabText, activeTab === 'reports' && styles.topTabTextActive]}>
            REPORTS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topTab, activeTab === 'notify' && styles.topTabActive]}
          onPress={() => setActiveTab('notify')}>
          <Text style={[styles.topTabText, activeTab === 'notify' && styles.topTabTextActive]}>
            {BELL} NOTIFY
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topTab, activeTab === 'feedback' && styles.topTabActive]}
          onPress={() => { setActiveTab('feedback'); fetchFeedback() }}>
          <Text style={[styles.topTabText, activeTab === 'feedback' && styles.topTabTextActive]}>
            {"💬"} INBOX
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'notify' ? (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.notifCard}>
            <Text style={styles.notifHeading}>SEND PUSH NOTIFICATION</Text>
            <Text style={styles.notifSubtext}>
              Sends to all registered devices
            </Text>

            <Text style={styles.inputLabel}>TITLE</Text>
            <TextInput
              style={styles.notifInput}
              placeholder="e.g. Safety Alert"
              placeholderTextColor={COLORS.textMuted}
              value={notifTitle}
              onChangeText={setNotifTitle}
              maxLength={60}
            />
            <Text style={styles.charCount}>{notifTitle.length}/60</Text>

            <Text style={styles.inputLabel}>MESSAGE</Text>
            <TextInput
              style={[styles.notifInput, styles.notifInputMulti]}
              placeholder="e.g. Increased police presence in Civic tonight."
              placeholderTextColor={COLORS.textMuted}
              value={notifBody}
              onChangeText={setNotifBody}
              multiline
              numberOfLines={4}
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{notifBody.length}/200</Text>

            <TouchableOpacity
              style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
              onPress={handleSendNotification}
              disabled={sending}
            >
              {sending
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.sendBtnText}>{BELL} SEND TO ALL USERS</Text>
              }
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : activeTab === 'feedback' ? (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {(['new','reviewed','resolved'] as const).map(f => (
              <TouchableOpacity key={f}
                style={[styles.filterTab, feedbackFilter === f && styles.filterTabActive]}
                onPress={() => { setFeedbackFilter(f); fetchFeedback() }}>
                <Text style={[styles.filterTabText, feedbackFilter === f && styles.filterTabTextActive]}>
                  {f.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {feedbackItems.length === 0 ? (
            <View style={[styles.center, { marginTop: 60 }]}>
              <Text style={styles.emptyIcon}>{"📬"}</Text>
              <Text style={styles.emptyText}>No {feedbackFilter} feedback</Text>
            </View>
          ) : (
            feedbackItems.map(item => (
              <View key={item.id} style={[styles.card, { marginHorizontal: 0 }]}>
                <View style={[styles.cardAccent, { backgroundColor: item.type === 'bug' ? COLORS.primary : item.type === 'feedback' ? '#48bb78' : '#4299e1' }]} />
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.category, { color: item.type === 'bug' ? COLORS.primary : item.type === 'feedback' ? '#48bb78' : '#4299e1' }]}>
                      {item.type.toUpperCase()}
                    </Text>
                    <Text style={styles.metaText}>
                      {new Date(item.created_at).toLocaleString('en-AU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </Text>
                  </View>
                  <Text style={styles.title}>{item.subject}</Text>
                  <Text style={styles.description}>{item.message}</Text>
                  {feedbackFilter === 'new' && (
                    <View style={styles.actions}>
                      <TouchableOpacity style={styles.approveBtn} onPress={() => updateFeedbackStatus(item.id, 'reviewed')}>
                        <Text style={styles.approveBtnText}>{"✅"} Mark Reviewed</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectBtn} onPress={() => updateFeedbackStatus(item.id, 'resolved')}>
                        <Text style={styles.rejectBtnText}>{"❌"} Resolve</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <>
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
                        <Text style={styles.metaText}>{"📍"} {report.address_suburb}</Text>
                      )}
                      <Text style={styles.metaText}>
                        {"🗓️"} {new Date(report.incident_date).toLocaleDateString('en-AU')}
                      </Text>
                      <Text style={styles.metaText}>
                        {"👤"} {report.reporter_name || 'Anonymous'}
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
        </>
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
  topTabRow: { flexDirection: 'row', backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1, borderBottomColor: '#2d3148', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  topTab: { flex: 1, paddingVertical: 8, borderRadius: 8,
    alignItems: 'center', backgroundColor: COLORS.bgInput },
  topTabActive: { backgroundColor: COLORS.primary },
  topTabText: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  topTabTextActive: { color: '#fff' },
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
  notifCard: { backgroundColor: COLORS.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: '#2d3148', padding: 20, gap: 12 },
  notifHeading: { fontSize: 12, fontWeight: '900', color: COLORS.primary, letterSpacing: 2 },
  notifSubtext: { fontSize: 13, color: COLORS.textSecondary, marginTop: -4 },
  inputLabel: { fontSize: 9, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 2 },
  notifInput: { backgroundColor: COLORS.bgInput, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: COLORS.textPrimary, borderWidth: 1, borderColor: '#2d3148' },
  notifInputMulti: { height: 100, paddingTop: 12 },
  charCount: { fontSize: 10, color: COLORS.textMuted, textAlign: 'right', marginTop: -8 },
  sendBtn: { backgroundColor: COLORS.primary, borderRadius: 12, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 12, elevation: 8 },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  card: { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: 12,
    marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#2d3148' },
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
