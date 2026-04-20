import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { COLORS } from '../../constants'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim()
        })
        if (error) throw error
        if (data.session) {
          router.replace('/(tabs)/map')
        } else {
          Alert.alert('Check your email', 'Please confirm your email to continue.')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        })
        if (error) throw error
        if (data.session) {
          router.replace('/(tabs)/map')
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.accentBar} />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>👁</Text>
          </View>
          <Text style={styles.appName}>WATCHLY</Text>
          <Text style={styles.tagline}>Community Crime Awareness</Text>
        </View>

        <View style={styles.features}>
          {[
            { icon: '📍', text: 'Pin-drop crime reporting' },
            { icon: '🗺️', text: 'Live community crime map' },
            { icon: '🕐', text: '3-month history timeline' },
            { icon: '🔒', text: 'Location privacy masking' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.authSection}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleEmailAuth}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.primaryButtonText}>
                  {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
                </Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.toggleText}>
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomAccent}>
        <Text style={styles.versionText}>WATCHLY v1.0 · AU</Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  accentBar: { height: 3, backgroundColor: COLORS.primary, width: '40%', marginTop: 60, marginLeft: 32 },
  content: { flex: 1, paddingHorizontal: 32, justifyContent: 'center', gap: 36 },
  logoContainer: { alignItems: 'flex-start', gap: 8 },
  logoIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  logoEmoji: { fontSize: 28 },
  appName: { fontSize: 42, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 6 },
  tagline: { fontSize: 13, color: COLORS.textSecondary, letterSpacing: 2, textTransform: 'uppercase' },
  features: { gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { fontSize: 18, width: 28 },
  featureText: { fontSize: 15, color: COLORS.textSecondary },
  authSection: { gap: 12 },
  input: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: '#2d3148',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  toggleButton: { paddingVertical: 8, alignItems: 'center' },
  toggleText: { fontSize: 13, color: COLORS.textSecondary },
  bottomAccent: { alignItems: 'center', paddingBottom: 40 },
  versionText: { fontSize: 10, color: COLORS.textMuted, letterSpacing: 3 },
})
