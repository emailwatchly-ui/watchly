import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native'
import { useRouter } from 'expo-router'
import * as AppleAuthentication from 'expo-apple-authentication'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { COLORS } from '../../constants'

function GoogleGLogo() {
  return (
    <View style={gStyles.container}>
      <Text style={gStyles.gBlue}>G</Text>
      <View style={gStyles.colourBar}>
        <View style={[gStyles.barSegment, { backgroundColor: '#4285F4' }]} />
        <View style={[gStyles.barSegment, { backgroundColor: '#EA4335' }]} />
        <View style={[gStyles.barSegment, { backgroundColor: '#FBBC05' }]} />
        <View style={[gStyles.barSegment, { backgroundColor: '#34A853' }]} />
      </View>
    </View>
  )
}

const gStyles = {
  container: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', gap: 2 },
  gBlue: { fontSize: 16, fontWeight: '800', color: '#4285F4', lineHeight: 18, fontFamily: 'System', letterSpacing: -0.5 },
  colourBar: { flexDirection: 'row', width: 16, height: 2.5, borderRadius: 1.25, overflow: 'hidden' },
  barSegment: { flex: 1 },
}

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
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

  const handleGoogle = async () => {
    try {
      setGLoading(true)
      await signInWithGoogle()
    } catch (err: any) {
      Alert.alert('Sign in failed', err.message || 'Something went wrong.')
    } finally {
      setGLoading(false)
    }
  }

  const handleApple = async () => {
    try {
      setAppleLoading(true)
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      })
      if (error) throw error
    } catch (err: any) {
      if (err.code === 'ERR_REQUEST_CANCELED') return
      Alert.alert('Sign in failed', err.message || 'Something went wrong.')
    } finally {
      setAppleLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.accentBar} />
        <View style={styles.logoBlock}>
          <View style={styles.logoIconWrap}>
            <Text style={styles.logoIconText}>{"🛡️"}</Text>
          </View>
          <View>
            <Text style={styles.appName}>WATCHLY</Text>
            <Text style={styles.tagline}>COMMUNITY SAFETY AWARENESS</Text>
          </View>
        </View>
        <View style={styles.pillRow}>
          {[
            { icon: "📍", label: 'Pin reports' },
            { icon: "🗺", label: 'Live map' },
            { icon: "🕒", label: 'History' },
            { icon: "🔒", label: 'Privacy' },
          ].map((p, i) => (
            <View key={i} style={styles.pill}>
              <Text style={styles.pillIcon}>{p.icon}</Text>
              <Text style={styles.pillLabel}>{p.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardHeading}>
            {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </Text>

          {/* Sign in with Apple */}
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={styles.appleBtn}
            onPress={handleApple}
          />

          {/* Google button */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogle}
            disabled={gLoading}
            activeOpacity={0.85}
          >
            {gLoading
              ? <ActivityIndicator color="#1a1d27" size="small" />
              : <>
                  <GoogleGLogo />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </>
            }
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder={isSignUp ? 'Min. 6 characters' : 'Your password'}
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleEmailAuth}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.primaryBtnText}>
                  {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
                </Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.toggleText}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={styles.toggleTextHighlight}>
                {isSignUp ? 'Sign in' : 'Create one'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.legalRow}>
          <TouchableOpacity onPress={() => router.push('/terms')}>
            <Text style={styles.legalLink}>Terms</Text>
          </TouchableOpacity>
          <Text style={styles.legalSep}>{"·"}</Text>
          <TouchableOpacity onPress={() => router.push('/privacy')}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>WATCHLY v1.0 {"·"} AU</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  accentBar: { height: 3, width: '35%', backgroundColor: COLORS.primary, marginTop: 64, marginBottom: 40, borderRadius: 2 },
  logoBlock: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32 },
  logoIconWrap: { width: 60, height: 60, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8 },
  logoIconText: { fontSize: 28 },
  appName: { fontSize: 32, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 6, lineHeight: 36 },
  tagline: { fontSize: 9, color: COLORS.textMuted, letterSpacing: 2.5, marginTop: 2 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: '#2d3148', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  pillIcon: { fontSize: 13 },
  pillLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 0.5 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: 20, borderWidth: 1, borderColor: '#2d3148', padding: 24, gap: 16 },
  cardHeading: { fontSize: 11, fontWeight: '800', color: COLORS.primary, letterSpacing: 2.5, marginBottom: 4 },
  appleBtn: { width: '100%', height: 52 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, height: 52, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 3 },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', letterSpacing: 0.2 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2d3148' },
  dividerText: { fontSize: 11, color: COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  inputWrap: { gap: 6 },
  inputLabel: { fontSize: 9, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 2 },
  input: { backgroundColor: COLORS.bgInput, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: COLORS.textPrimary, borderWidth: 1, borderColor: '#2d3148' },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8, marginTop: 4 },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 2.5 },
  toggleBtn: { alignItems: 'center', paddingVertical: 4 },
  toggleText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
  toggleTextHighlight: { color: COLORS.primary, fontWeight: '700' },
  legalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  legalLink: { fontSize: 12, color: COLORS.textMuted, textDecorationLine: 'underline' },
  legalSep: { fontSize: 12, color: COLORS.textMuted },
  version: { fontSize: 9, color: '#2d3148', textAlign: 'center', letterSpacing: 3, marginTop: 16 },
})
