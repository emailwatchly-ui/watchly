import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { COLORS } from '../constants'

const TYPES = [
  { key: 'feedback', label: 'General Feedback', icon: '💬', desc: 'Share ideas or suggestions' },
  { key: 'bug',      label: 'Report a Bug',     icon: '🐛', desc: 'Something not working right?' },
  { key: 'other',    label: 'Other',             icon: '📬', desc: 'Anything else on your mind' },
]

export default function FeedbackScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [type, setType] = useState<'feedback'|'bug'|'other'>('feedback')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!subject.trim()) return Alert.alert('Required', 'Please enter a subject.')
    if (!message.trim()) return Alert.alert('Required', 'Please enter a message.')
    if (message.trim().length < 10) return Alert.alert('Too short', 'Please provide a bit more detail.')

    setSubmitting(true)
    const { error } = await supabase.from('feedback').insert({
      user_id: user?.id,
      type,
      subject: subject.trim(),
      message: message.trim(),
      app_version: '1.0.0',
    })
    setSubmitting(false)

    if (error) {
      Alert.alert('Error', 'Could not submit feedback. Please try again.')
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>{'←'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FEEDBACK</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>{'✅'}</Text>
          <Text style={styles.successTitle}>Thanks!</Text>
          <Text style={styles.successBody}>
            Your feedback has been submitted. We review all submissions and use them to improve Watchly.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>DONE</Text>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'←'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FEEDBACK</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type selector */}
        <Text style={styles.label}>TYPE</Text>
        <View style={styles.typeRow}>
          {TYPES.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeCard, type === t.key && styles.typeCardActive]}
              onPress={() => setType(t.key as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.typeIcon}>{t.icon}</Text>
              <Text style={[styles.typeLabel, type === t.key && styles.typeLabelActive]}>
                {t.label}
              </Text>
              <Text style={styles.typeDesc}>{t.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subject */}
        <Text style={styles.label}>SUBJECT</Text>
        <TextInput
          style={styles.input}
          placeholder="Brief summary of your feedback"
          placeholderTextColor={COLORS.textMuted}
          value={subject}
          onChangeText={setSubject}
          maxLength={100}
          returnKeyType="next"
        />
        <Text style={styles.charCount}>{subject.length}/100</Text>

        {/* Message */}
        <Text style={styles.label}>DETAILS</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]}
          placeholder={
            type === 'bug'
              ? 'Describe what happened, what you expected, and steps to reproduce...'
              : 'Tell us more...'
          }
          placeholderTextColor={COLORS.textMuted}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
          maxLength={1000}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{message.length}/1000</Text>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.submitBtnText}>SUBMIT</Text>
          }
        </TouchableOpacity>

        <Text style={styles.footer}>
          All feedback is reviewed by the Watchly team.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  label: { fontSize: 9, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 2, marginBottom: 10 },
  typeRow: { flexDirection: 'column', gap: 8, marginBottom: 24 },
  typeCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: '#2d3148',
    padding: 14, gap: 2,
  },
  typeCardActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(229,62,62,0.08)' },
  typeIcon: { fontSize: 22, marginBottom: 4 },
  typeLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
  typeLabelActive: { color: COLORS.primary },
  typeDesc: { fontSize: 12, color: COLORS.textMuted },
  input: {
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: '#2d3148',
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: COLORS.textPrimary,
    marginBottom: 4,
  },
  inputMulti: { height: 140, paddingTop: 14 },
  charCount: { fontSize: 10, color: COLORS.textMuted, textAlign: 'right', marginBottom: 20 },
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14, height: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 12, elevation: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 2.5 },
  footer: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 16 },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
  successIcon: { fontSize: 64 },
  successTitle: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary },
  successBody: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  doneBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14, height: 56,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, marginTop: 8,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 12, elevation: 8,
  },
  doneBtnText: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 2.5 },
})
