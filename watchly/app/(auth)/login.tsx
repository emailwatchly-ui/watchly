import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { COLORS } from '../../constants'

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Please enter your email and password.')
      return
    }
    try {
      setLoading(true)
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        Alert.alert('Account created!', 'Welcome to Watchly.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      await signInWithGoogle()
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Google sign in failed.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const GOOGLE_ICON = String.fromCodePoint(0x1F310)
  const SHIELD_ICON = String.fromCodePoint(0x1F6E1)

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.accentBar} />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>{SHIELD_ICON}</Text>
          </View>
          <Text style={styles.appName}>WATCHLY</Text>
          <Text style={styles.tagline}>Community Crime Awareness</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: String.fromCodePoint(0x1F4CD), text: 'Pin-drop crime reporting' },
            { icon: String.fromCodePoint(0x1F5FA), text: 'Live community crime map' },
            { icon: String.fromCodePoint(0x1F552), text: '3-month history timeline' },
            { icon: String.fromCodePoint(0x1F512), text: 'Location privacy masking' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Auth section */}
        <View style={styles.authSection}>

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            activeOpacity={0.85}
          >
            {googleLoading
              ? <ActivityIndicator color="#333" size="small" />
              : <>
                  <Text style={styles.googleIcon}>{GOOGLE_ICON}</Text>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email/Password */}
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.primaryButton}
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

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.toggleText}>
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing, you agree to report crimes responsibly.
          </Text>
        </View>
      </View>

      <View style={styles.bottomAccent}>
        <Text style={styles.versionText}>WATCHLY v1.0 {String.fromCodePoint(0x00B7)} AU</Text>
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
  featureText: { fontSize: 15, color: COLORS.textSecondary, letterSpacing: 0.3 },
  authSection: { gap: 12 },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  googleIcon: { fontSize: 20 },
  googleButtonText: { fontSize: 15, fontWeight: '600', color: '#333' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2d3148' },
  dividerText: { fontSize: 12, color: COLORS.textMuted, letterSpacing: 1 },
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
  primaryButtonText: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  toggleText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: 4 },
  disclaimer: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center' },
  bottomAccent: { alignItems: 'center', paddingBottom: 40 },
  versionText: { fontSize: 10, color: COLORS.textMuted, letterSpacing: 3 },
})
