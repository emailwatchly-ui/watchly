import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, ActivityIndicator, Alert, Platform
} from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'
import { COLORS } from '../../constants'

const { width, height } = Dimensions.get('window')

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
    } catch (err: any) {
      Alert.alert('Sign in failed', err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Background grid pattern */}
      <View style={styles.gridOverlay} />

      {/* Top accent bar */}
      <View style={styles.accentBar} />

      <View style={styles.content}>
        {/* Logo area */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>👁</Text>
          </View>
          <Text style={styles.appName}>WATCHLY</Text>
          <Text style={styles.tagline}>Community Crime Awareness</Text>
        </View>

        {/* Feature bullets */}
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

        {/* Sign in button */}
        <View style={styles.authSection}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#1a1d27" size="small" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing, you agree to report crimes responsibly.{'\n'}
            False reports may be removed by moderators.
          </Text>
        </View>
      </View>

      {/* Bottom accent */}
      <View style={styles.bottomAccent}>
        <Text style={styles.versionText}>WATCHLY v1.0 · AU</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    // Grid effect via background
  },
  accentBar: {
    height: 3,
    backgroundColor: COLORS.primary,
    width: '40%',
    marginTop: 60,
    marginLeft: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    gap: 48,
  },
  logoContainer: {
    alignItems: 'flex-start',
    gap: 8,
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoEmoji: {
    fontSize: 28,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 6,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  features: {
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    fontSize: 18,
    width: 28,
  },
  featureText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  authSection: {
    gap: 20,
  },
  googleButton: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1d27',
    letterSpacing: 0.3,
  },
  disclaimer: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 17,
  },
  bottomAccent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 3,
  },
})
