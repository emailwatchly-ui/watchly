import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS } from '../../constants'

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🗺️" label="Map" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="+" label="Report" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.bgCard,
    borderTopColor: '#2d3148',
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIcon: {
    alignItems: 'center',
    gap: 3,
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.4,
  },
  tabEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
})
