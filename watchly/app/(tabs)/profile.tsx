import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from 'react-native'
import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { COLORS } from '../../constants'

type Profile = {
  display_name: string | null
  avatar_url: string | null
  suburb: string | null
  state: string | null
  reports_count: number
  created_at: string
}

type RecentReport = {
  id: string
  title: string
  category_name: string
  category_color: string
  incident_date: string
  incident_type: string
  status: string
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [reports, setReports] = useState<RecentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchMyReports()
    }
  }, [user])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single()
    if (data) setProfile(data)
    setLoading(false)
  }

  const fetchMyReports = async () => {
    const { data } = await supabase
      .from('crime_reports_with_category')
      .select('id, title, category_name, category_color, incident_date, incident_type, status')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setReports(data)
  }

  const handleSignOut = async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true)
          await signOut()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    )
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Watchly User'
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
    : ''

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PROFILE</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar & name */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {joinDate && <Text style={styles.joinDate}>Member since {joinDate}</Text>}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{reports.length}</Text>
            <Text style={styles.statLabel}>REPORTS</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMiddle]}>
            <Text style={styles.statNumber}>
              {reports.filter(r => r.incident_type === 'committed').length}
            </Text>
            <Text style={styles.statLabel}>COMMITTED</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {reports.filter(r => r.incident_type === 'attempted').length}
            </Text>
            <Text style={styles.statLabel}>ATTEMPTED</Text>
          </View>
        </View>

        {/* My recent reports */}
        {reports.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MY RECENT REPORTS</Text>
            {reports.map(report => (
              <View key={report.id} style={styles.reportRow}>
                <View style={[styles.reportDot, { backgroundColor: report.category_color }]} />
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
                  <Text style={styles.reportMeta}>
                    {report.category_name} · {new Date(report.incident_date).toLocaleDateString('en-AU', {
                      day: 'numeric', month: 'short'
                    })}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  report.status === 'approved' ? styles.statusApproved : styles.statusPending
                ]}>
                  <Text style={styles.statusText}>{report.status.toUpperCase()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {reports.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No reports yet</Text>
            <Text style={styles.emptySub}>Tap the map tab to report an incident</Text>
          </View>
        )}

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color={COLORS.danger} size="small" />
          ) : (
            <Text style={styles.signOutText}>Sign Out</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d3148',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 3,
  },
  profileSection: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2130',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  joinDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1e2130',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    gap: 4,
  },
  statCardMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#2d3148',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
  },
  section: {
    padding: 24,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2130',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1d27',
  },
  reportDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reportInfo: {
    flex: 1,
    gap: 2,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  reportMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  statusApproved: {
    backgroundColor: 'rgba(72,187,120,0.15)',
  },
  statusPending: {
    backgroundColor: 'rgba(236,201,75,0.15)',
  },
  statusText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  signOutButton: {
    margin: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
    letterSpacing: 0.5,
  },
})
