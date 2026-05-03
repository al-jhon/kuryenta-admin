<!-- src\pages\LiveMapPage.vue -->
<template>
  <q-page class="full-map-page">

    <!-- MAP CONTAINER -->
    <div id="admin-map" style="width: 100%; height: calc(100vh - 50px)"></div>

    <!-- FLOATING LEGEND -->
    <q-card class="map-legend">
      <q-card-section class="q-pa-sm">
        <div class="text-subtitle2 text-weight-bold q-mb-xs">Legend</div>
        <div class="flex items-center q-mb-xs">
          <div class="legend-dot bg-blue"></div>
          <span class="q-ml-sm text-caption">Station</span>
        </div>
        <div class="flex items-center q-mb-xs">
          <div class="legend-dot bg-green"></div>
          <span class="q-ml-sm text-caption">Rented (On Time)</span>
        </div>
        <div class="flex items-center q-mb-xs">
          <div class="legend-dot bg-orange"></div>
          <span class="q-ml-sm text-caption">Warning (&lt;2h left)</span>
        </div>
        <div class="flex items-center">
          <div class="legend-dot bg-red"></div>
          <span class="q-ml-sm text-caption">Overdue</span>
        </div>
      </q-card-section>
    </q-card>

    <!-- FLOATING INFO PANEL -->
    <q-card class="map-info-panel" v-if="selectedMarker">
      <q-card-section>
        <div class="flex justify-between items-center">
          <div class="text-subtitle1 text-weight-bold">{{ selectedMarker.renterName }}</div>
          <q-btn flat round size="sm" icon="close" @click="selectedMarker = null" />
        </div>
        <q-separator class="q-my-sm" />
        <div class="text-caption">
          <div><strong>Phone:</strong> {{ selectedMarker.renterPhone }}</div>
          <div><strong>Station:</strong> {{ selectedMarker.stationId }} ({{ selectedMarker.place }})</div>
          <div><strong>Slot:</strong> {{ selectedMarker.slotName }}</div>
          <div><strong>Battery:</strong> {{ selectedMarker.battery }}%</div>
          <div><strong>Status:</strong>
            <q-badge :color="selectedMarker.type === 'overdue' ? 'red' : 'green'">
              {{ selectedMarker.status }}
            </q-badge>
          </div>
          <div><strong>GPS:</strong> {{ selectedMarker.lat }}, {{ selectedMarker.lng }}</div>
          <div><strong>Last Update:</strong> {{ selectedMarker.lastUpdated || 'N/A' }}</div>
        </div>
      </q-card-section>
    </q-card>

  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAdminStore } from 'src/stores/admin-store'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const store = useAdminStore()
const selectedMarker = ref(null)

let map = null
let markerLayer = null

// 🏝️ DEFAULT CENTER: Camiguin Island, Philippines
// ✅ Updated to Mambajao, Camiguin
const DEFAULT_CENTER = [9.2497, 124.7294]  // Mambajao center
const DEFAULT_ZOOM = 12  // Closer zoom for town level

function createMarkerIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px; height: 24px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16]
  })
}

function createStationIcon() {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px; height: 32px;
      background: #1976D2;
      border: 3px solid white;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 16px;
    ">⚡</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20]
  })
}

function getMarkerColor(marker) {
  if (marker.type === 'station') return '#1976D2'
  if (marker.type === 'overdue') return '#D32F2F'

  // Check rental urgency from active rentals
  const rental = store.activeRentals.find(
    r => r.stationId === marker.stationId && r.slotName === marker.slotName
  )
  if (rental?.urgency === 'overdue') return '#D32F2F'
  if (rental?.urgency === 'warning') return '#F57C00'
  return '#388E3C'
}

function updateMarkers() {
  if (!map || !markerLayer) return

  markerLayer.clearLayers()

  store.mapMarkers.forEach(m => {
    if (!m.lat || !m.lng || isNaN(m.lat) || isNaN(m.lng)) return

    const icon = m.type === 'station'
      ? createStationIcon()
      : createMarkerIcon(getMarkerColor(m))

    const marker = L.marker([m.lat, m.lng], { icon })

    // Popup content
    let popupHtml = ''
    if (m.type === 'station') {
      popupHtml = `
        <strong>⚡ Station ${m.stationId}</strong><br/>
        ${m.place}
      `
    } else {
      popupHtml = `
        <strong>${m.renterName}</strong><br/>
        Station ${m.stationId} • ${m.slotName}<br/>
        Battery: ${m.battery}% • ${m.status}<br/>
        <small>${m.lastUpdated || ''}</small>
      `
    }
    marker.bindPopup(popupHtml)

    marker.on('click', () => {
      if (m.type !== 'station') {
        selectedMarker.value = m
      }
    })

    markerLayer.addLayer(marker)
  })

  // Auto-fit bounds if there are markers
  if (store.mapMarkers.length > 0) {
    const bounds = markerLayer.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    }
  }
}

function initMap() {
  map = L.map('admin-map').setView(DEFAULT_CENTER, DEFAULT_ZOOM)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)

  markerLayer = L.layerGroup().addTo(map)

  updateMarkers()
}

// Watch for data changes and update markers
watch(() => store.mapMarkers, () => {
  updateMarkers()
}, { deep: true })

onMounted(() => {
  setTimeout(() => {
    initMap()
  }, 100)
})
</script>

<style lang="scss" scoped>
.full-map-page {
  position: relative;
  padding: 0;
}

.map-legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
  min-width: 160px;

  .legend-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
}

.map-info-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  min-width: 280px;
  max-width: 350px;
}
</style>
