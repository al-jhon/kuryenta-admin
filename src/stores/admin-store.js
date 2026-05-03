// src\stores\admin-store.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { db } from 'src/boot/firebase'
import { ref as dbRef, onValue, update } from 'firebase/database'

export const useAdminStore = defineStore('admin', () => {
  // ════════════════════════════
  // STATE
  // ════════════════════════════
  const stations = ref({})
  const users = ref({})
  const locations = ref({})
  const rentalHistory = ref({})
  const smsLogs = ref({})
  const detachables = ref({})
  const isLoading = ref(true)
  const listenersInitialized = ref(false)
  // ── ADD THESE NEW REFS ──
  const offlineLogs = ref([]) // in-memory logs
  const _prevOnlineState = ref({}) // track previous online/offline state per slot/station

  // ════════════════════════════
  // GETTERS (computed)
  // ════════════════════════════
  // ════════════════════════════
  // OFFLINE HELPERS
  // ════════════════════════════

  function checkIsOffline(onlineCheckerValue) {
    if (!onlineCheckerValue) return true
    try {
      const lastSeen = new Date(onlineCheckerValue).getTime()
      return Date.now() - lastSeen > 10 * 60 * 1000
    } catch {
      return true
    }
  }

  // All stations as array
  const stationList = computed(() => {
    return Object.entries(stations.value).map(([id, data]) => ({
      id,
      ...data,
    }))
  })

  // Total station count
  const totalStations = computed(() => stationList.value.length)

  // All slots flattened
  const allSlots = computed(() => {
    const slots = []
    Object.entries(stations.value).forEach(([stationId, station]) => {
      const slotKeys = Object.keys(station).filter((k) => k.startsWith('slot'))
      slotKeys.forEach((slotKey) => {
        const slot = station[slotKey]
        if (slot && typeof slot === 'object') {
          slots.push({
            stationId,
            stationPlace: station.place || stationId,
            slotName: slotKey,
            ...slot,
          })
        }
      })
    })
    return slots
  })

  // Active rentals (status == "rented")
  const activeRentals = computed(() => {
    return allSlots.value
      .filter((s) => s.status === 'rented')
      .map((slot) => {
        // Get GPS location from locations node
        const locData = locations.value?.stations?.[slot.stationId]?.[slot.slotName]

        // Get user info
        const user = slot.rentedBy ? users.value[slot.rentedBy] : null

        // Calculate time info
        const now = new Date()
        const rentedAt = slot.rentedAt ? new Date(slot.rentedAt) : null
        const returnBy = slot.returnBy ? new Date(slot.returnBy) : null
        const elapsedMs = rentedAt ? now - rentedAt : 0
        const elapsedHours = elapsedMs / (1000 * 60 * 60)
        const remainingMs = returnBy ? returnBy - now : 0
        const remainingHours = remainingMs / (1000 * 60 * 60)
        const isOverdue = returnBy ? now > returnBy : false
        const overdueMinutes = isOverdue ? Math.abs(remainingMs) / (1000 * 60) : 0

        return {
          ...slot,
          latitude: locData?.Latitude || null,
          longitude: locData?.Longitude || null,
          lastGpsUpdate: locData?.lastUpdated || null,
          userPhoto: user?.profilePictureUrl || null,
          elapsedHours: Math.round(elapsedHours * 10) / 10,
          remainingHours: Math.round(remainingHours * 10) / 10,
          isOverdue,
          overdueMinutes: Math.round(overdueMinutes),
          urgency: isOverdue ? 'overdue' : remainingHours < 2 ? 'warning' : 'ok',
        }
      })
  })

  // Overdue rentals
  const overdueRentals = computed(() => {
    return activeRentals.value.filter((r) => r.isOverdue)
  })

  // Available slots
  const availableSlots = computed(() => {
    return allSlots.value.filter(
      (s) => (s.status === 'available' || s.status === 'charging') && s.isPresent,
    )
  })

  // All users as array
  const userList = computed(() => {
    return Object.entries(users.value).map(([id, data]) => ({
      id,
      ...data,
      fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
    }))
  })

  const totalUsers = computed(() => userList.value.length)
  const bannedUsers = computed(() => userList.value.filter((u) => u.isBanned).length)

  // Rental history as array (sorted newest first)
  const rentalHistoryList = computed(() => {
    return Object.entries(rentalHistory.value)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => new Date(b.rentedAt) - new Date(a.rentedAt))
  })

  // SMS logs as array (sorted newest first)
  const smsLogList = computed(() => {
    return Object.entries(smsLogs.value)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  })

  // Map markers for all rented detachables
  const mapMarkers = computed(() => {
    const markers = []

    // Station markers (fixed position)
    Object.entries(locations.value?.stations || {}).forEach(([stationId, stationData]) => {
      if (stationData.stationLat && stationData.stationLng) {
        markers.push({
          type: 'station',
          stationId,
          place: stationData.place || stationId,
          lat: parseFloat(stationData.stationLat),
          lng: parseFloat(stationData.stationLng),
        })
      }

      // Slot markers (GPS from rented detachables)
      Object.entries(stationData).forEach(([key, slotData]) => {
        if (key.startsWith('slot') && slotData?.Latitude && slotData?.Longitude) {
          const stationInfo = stations.value[stationId]
          const slotInfo = stationInfo?.[key]

          markers.push({
            type: slotData.status === 'overdue' ? 'overdue' : 'rented',
            stationId,
            slotName: key,
            place: stationData.place || stationId,
            lat: parseFloat(slotData.Latitude),
            lng: parseFloat(slotData.Longitude),
            battery: slotData.batteryPercent || slotInfo?.batteryPercent || 0,
            status: slotData.status || slotInfo?.status || 'unknown',
            renterName: slotData.renterName || slotInfo?.rentedByName || 'Unknown',
            renterPhone: slotData.renterPhone || slotInfo?.rentedByPhone || '',
            lastUpdated: slotData.lastUpdated || '',
          })
        }
      })
    })

    return markers
  })

  const offlineSlots = computed(() => {
    const result = []
    Object.entries(stations.value).forEach(([stationId, station]) => {
      const slotKeys = Object.keys(station).filter((k) => k.startsWith('slot'))
      slotKeys.forEach((slotKey) => {
        const slot = station[slotKey]
        if (!slot || typeof slot !== 'object') return
        if (checkIsOffline(slot.onlineChecker)) {
          result.push({
            stationId,
            stationPlace: station.place || stationId,
            slotName: slotKey,
            batteryPercent: slot.batteryPercent ?? 0,
            status: slot.status || 'unknown',
            onlineChecker: slot.onlineChecker || null,
            lastSeen: slot.onlineChecker
              ? new Date(slot.onlineChecker).toLocaleString('en-PH', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })
              : 'Never',
          })
        }
      })
    })
    return result
  })

  const offlineStations = computed(() => {
    return Object.entries(stations.value)
      .filter(([, station]) => checkIsOffline(station.onlineChecker))
      .map(([stationId, station]) => ({
        stationId,
        place: station.place || stationId,
        onlineChecker: station.onlineChecker || null,
        lastSeen: station.onlineChecker
          ? new Date(station.onlineChecker).toLocaleString('en-PH', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })
          : 'Never',
      }))
  })

  const onlineStations = computed(() => {
    return Object.entries(stations.value)
      .filter(([, station]) => !checkIsOffline(station.onlineChecker))
      .map(([stationId, station]) => ({
        stationId,
        place: station.place || stationId,
        onlineChecker: station.onlineChecker || null,
      }))
  })

  // ════════════════════════════
  // ACTIONS
  // ════════════════════════════

  function initListeners() {
    if (listenersInitialized.value) return
    listenersInitialized.value = true
    isLoading.value = true

    let loadCount = 0
    const totalListeners = 5
    const checkDone = () => {
      loadCount++
      if (loadCount >= totalListeners) isLoading.value = false
    }

    // Listen to stations
    onValue(dbRef(db, 'stations'), (snapshot) => {
      stations.value = snapshot.val() || {}
      checkDone()
    })

    // Listen to users
    onValue(dbRef(db, 'users'), (snapshot) => {
      users.value = snapshot.val() || {}
      checkDone()
    })

    // Listen to locations (GPS data from SMS gateway)
    onValue(dbRef(db, 'locations'), (snapshot) => {
      locations.value = snapshot.val() || {}
      checkDone()
    })

    // Listen to rental history
    onValue(dbRef(db, 'rentalHistory'), (snapshot) => {
      rentalHistory.value = snapshot.val() || {}
      checkDone()
    })

    // Listen to SMS logs
    onValue(dbRef(db, 'smsLogs'), (snapshot) => {
      smsLogs.value = snapshot.val() || {}
      checkDone()
    })
    watch(
      stations,
      (newStations) => {
        Object.entries(newStations).forEach(([stationId, station]) => {
          const stationKey = `station_${stationId}`
          const stationOffline = checkIsOffline(station.onlineChecker)
          const prevStationOffline = _prevOnlineState.value[stationKey]

          if (prevStationOffline !== undefined && prevStationOffline !== stationOffline) {
            offlineLogs.value.unshift({
              id: `${Date.now()}_${stationKey}`,
              type: 'station',
              stationId,
              place: station.place || stationId,
              slotName: null,
              event: stationOffline ? 'offline' : 'online',
              time: new Date().toISOString(),
              lastSeen: station.onlineChecker || null,
            })
          }
          _prevOnlineState.value[stationKey] = stationOffline

          Object.keys(station)
            .filter((k) => k.startsWith('slot'))
            .forEach((slotKey) => {
              const slot = station[slotKey]
              if (!slot || typeof slot !== 'object') return
              const key = `${stationId}_${slotKey}`
              const isOffline = checkIsOffline(slot.onlineChecker)
              const prevOffline = _prevOnlineState.value[key]

              if (prevOffline !== undefined && prevOffline !== isOffline) {
                offlineLogs.value.unshift({
                  id: `${Date.now()}_${key}`,
                  type: 'slot',
                  stationId,
                  place: station.place || stationId,
                  slotName: slotKey,
                  event: isOffline ? 'offline' : 'online',
                  time: new Date().toISOString(),
                  lastSeen: slot.onlineChecker || null,
                })
              }
              _prevOnlineState.value[key] = isOffline
            })
        })
      },
      { deep: true },
    )
    console.log('✅ All Firebase listeners initialized')
  }

  // Ban a user
  async function banUser(userId) {
    await update(dbRef(db, `users/${userId}`), {
      isBanned: true,
    })
  }

  // Unban a user
  async function unbanUser(userId) {
    await update(dbRef(db, `users/${userId}`), {
      isBanned: false,
    })
  }

  // Reset strikes
  async function resetStrikes(userId) {
    await update(dbRef(db, `users/${userId}`), {
      strikes: 0,
      isBanned: false,
    })
  }

  // Add strike
  async function addStrike(userId) {
    const user = users.value[userId]
    if (!user) return
    const newStrikes = (user.strikes || 0) + 1
    const updates = { strikes: newStrikes }
    if (newStrikes >= 3) updates.isBanned = true
    await update(dbRef(db, `users/${userId}`), updates)
  }

  return {
    // State
    stations,
    users,
    locations,
    rentalHistory,
    smsLogs,
    detachables,
    isLoading,

    // Getters
    stationList,
    totalStations,
    allSlots,
    activeRentals,
    overdueRentals,
    availableSlots,
    userList,
    totalUsers,
    bannedUsers,
    rentalHistoryList,
    smsLogList,
    mapMarkers,

    // Actions
    initListeners,
    banUser,
    unbanUser,
    resetStrikes,
    addStrike,
    // Offline monitoring
    offlineLogs,
    offlineSlots,
    offlineStations,
    onlineStations,
  }
})
