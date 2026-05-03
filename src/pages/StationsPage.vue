<!-- src\pages\StationsPage.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2">

    <div class="text-h5 text-weight-bold q-mb-md">
      <q-icon name="solar_power" class="q-mr-sm" />
      Stations
      <q-badge color="blue" class="q-ml-sm">{{ store.totalStations }}</q-badge>
    </div>

    <div v-if="store.stationList.length === 0" class="text-center q-pa-xl">
      <q-icon name="solar_power" size="80px" color="grey-4" />
      <div class="text-h6 text-grey q-mt-md">No Stations Yet</div>
      <div class="text-caption text-grey">Stations appear when ESP32 sends data to Firebase</div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="station in store.stationList" :key="station.id" class="col-12 col-md-6">
        <q-card>
          <!-- Station Header -->
          <q-card-section class="bg-blue-9 text-white">
            <div class="text-h6">
              <q-icon name="solar_power" class="q-mr-sm" />
              Station {{ station.id }}
              <span v-if="station.place"> — {{ station.place }}</span>
            </div>
          </q-card-section>

          <!-- Slots -->
          <q-card-section>
            <div v-for="slotKey in getSlotKeys(station)" :key="slotKey" class="q-mb-md">
              <div class="row items-center q-mb-xs">
                <div class="text-subtitle2 text-weight-bold q-mr-md">
                  {{ slotKey.toUpperCase() }}
                </div>
                <q-badge
                  :color="getStatusColor(station[slotKey]?.status)"
                  :label="station[slotKey]?.status || 'unknown'"
                />
                <q-space />
                <q-icon
                  :name="station[slotKey]?.isPresent ? 'check_circle' : 'cancel'"
                  :color="station[slotKey]?.isPresent ? 'green' : 'red'"
                  size="20px"
                />
                <span class="text-caption q-ml-xs">
                  {{ station[slotKey]?.isPresent ? 'Present' : 'Away' }}
                </span>
              </div>

              <!-- Battery bar -->
              <div class="flex items-center q-mb-xs">
                <q-icon name="battery_std" size="20px" class="q-mr-sm" />
                <q-linear-progress
                  :value="(station[slotKey]?.batteryPercent || 0) / 100"
                  :color="station[slotKey]?.batteryPercent > 50 ? 'green' : station[slotKey]?.batteryPercent > 20 ? 'orange' : 'red'"
                  style="flex: 1; height: 12px"
                  rounded
                />
                <span class="text-caption text-weight-bold q-ml-sm">
                  {{ station[slotKey]?.batteryPercent || 0 }}%
                </span>
              </div>

              <!-- Renter info (if rented) -->
              <div v-if="station[slotKey]?.status === 'rented'" class="q-pl-md">
                <div class="text-caption">
                  <q-icon name="person" size="14px" class="q-mr-xs" />
                  {{ station[slotKey]?.rentedByName || 'Unknown' }}
                </div>
                <div class="text-caption">
                  <q-icon name="phone" size="14px" class="q-mr-xs" />
                  {{ station[slotKey]?.rentedByPhone || '-' }}
                </div>
                <div class="text-caption">
                  <q-icon name="schedule" size="14px" class="q-mr-xs" />
                  Since: {{ formatDate(station[slotKey]?.rentedAt) }}
                </div>
                <div class="text-caption">
                  <q-icon name="event" size="14px" class="q-mr-xs" />
                  Return by: {{ formatDate(station[slotKey]?.returnBy) }}
                </div>
              </div>

              <!-- Price -->
              <div class="text-caption text-grey q-mt-xs">
                <q-icon name="payments" size="14px" class="q-mr-xs" />
                Price: ₱{{ station[slotKey]?.price || 0 }}
              </div>

              <q-separator v-if="slotKey !== getSlotKeys(station).slice(-1)[0]" class="q-mt-md" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { useAdminStore } from 'src/stores/admin-store'

const store = useAdminStore()

function getSlotKeys(station) {
  return Object.keys(station).filter(k => k.startsWith('slot')).sort()
}

function getStatusColor(status) {
  const colors = {
    available: 'green',
    rented: 'orange',
    charging: 'blue',
    maintenance: 'grey'
  }
  return colors[status] || 'grey'
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleString('en-PH', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
      hour12: true
    })
  } catch {
    return dateStr
  }
}
</script>
