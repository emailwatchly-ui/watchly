import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Platform, Alert
} from 'react-native'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import * as Location from 'expo-location'
import { supabase } from '../../lib/supabase'
import { COLORS, CANBERRA_REGION } from '../../constants'

let MapView: any = null
let Marker: any = null
let Callout: any = null
let Circle: any = null

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps')
  MapView = Maps.default
  Marker = Maps.Marker
  Callout = Maps.Callout
  Circle = Maps.Circle
}

type Report = {
  id: string
  title: string
  incident_type: 'committed' | 'attempted'
  incident_date: string
  category_name: string
  category_color: string
  category_icon: string
  latitude: number
  longitude: number
  address_suburb: string | null
}

const FILTER_RANGES = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 3650 },
]

// Emoji map using String.fromCodePoint to avoid encoding issues
const ICON_MAP: Record<string, string> = {
  home:             String.fromCodePoint(0x1F3E0), // house
  car:              String.fromCodePoint(0x1F697), // car
  'alert-triangle': String.fromCodePoint(0x26A0),  // warning
  'dollar-sign':    String.fromCodePoint(0x1F4B0), // money bag
  tool:             String.fromCodePoint(0x1F527), // wrench
  package:          String.fromCodePoint(0x1F4E6), // package
  eye:              String.fromCodePoint(0x1F441), // eye
  activity:         String.fromCodePoint(0x1F48A), // pill
  'more-horizontal':String.fromCodePoint(0x1F4CB), // clipboard
}

const FIRE_EMOJI    = String.fromCodePoint(0x1F525) // fire
const PIN_EMOJI     = String.fromCodePoint(0x1F4CD) // pin
const CAL_EMOJI     = String.fromCodePoint(0x1F5D3) // calendar
const CIRCLE_EMOJI  = String.fromCodePoint(0x25CE)  // target circle (locate button)

// Cluster nearby reports and calculate density
function buildHeatClusters(reports: Report[]) {
  const CLUSTE_RADIUS = 0.002 // ~200m in degrees
  const clusters: { lat: number; lng: number; count: number; weight: number }[] = []

  reports.forEach(report => {
    const weight = report.incident_type === 'committed' ? 1.0 : 0.5
    const existing = clusters.find(c =>
      Math.abs(c.lat - report.latitude) < CLUSTER_RADIUS &&
      Math.abs(c.lng - report.longitude) < CLUSTE_RADIUS
    )
    if (existing) {
      existing.count++
      existing.weight += weight
      existing.lat = (existing.lat + report.latitude) / 2
      existing.lng = (existing.lng + report.longitude) / 2
    } else {
      clusters.push({ lat: report.latitude, lng: report.longitude, count: 1, weight })
    }
  })
  return clusters
}

// Absolute thresholds — only turns red with serious crime density
function weightToColor(weight: number): string {
  if (weight < 5)  return '#00C800' // green  — 1-4 reports
  if (weight < 10) return '#FFFF00' // yellow — 5-9 reports
  if (weight < 20) return '#FF7E00' // orange — 10-19 reports
  if (weight < 35) return '#FF0000' // red    — 20-34 reports
  return '#8B0000'                   // dark red — 35+ reports
}