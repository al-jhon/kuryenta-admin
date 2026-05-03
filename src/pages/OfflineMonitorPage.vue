<!-- src/pages/OfflineMonitorPage.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="text-h5 text-weight-bold q-mb-md">
      <q-icon name="wifi_off" class="q-mr-sm" />
      Offline Monitor
      <q-badge v-if="totalOffline > 0" color="red" class="q-ml-sm">
        {{ totalOffline }} offline
      </q-badge>
      <q-badge v-else color="green" class="q-ml-sm">All Online</q-badge>
    </div>

    <!-- SUMMARY CARDS -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-6 col-md-3">
        <q-card class="stat-card bg-red-8 text-white">
          <q-card-section class="q-pa-md">
            <div class="text-caption opacity-80">Offline Stations</div>
            <div class="text-h4 text-weight-bold">{{ store.offlineStations.length }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="stat-card bg-orange-8 text-white">
          <q-card-section class="q-pa-md">
            <div class="text-caption opacity-80">Offline Slots</div>
            <div class="text-h4 text-weight-bold">{{ store.offlineSlots.length }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="stat-card bg-green-8 text-white">
          <q-card-section class="q-pa-md">
            <div class="text-caption opacity-80">Online Stations</div>
            <div class="text-h4 text-weight-bold">{{ store.onlineStations.length }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="stat-card bg-blue-8 text-white">
          <q-card-section class="q-pa-md">
            <div class="text-caption opacity-80">Log Events</div>
            <div class="text-h4 text-weight-bold">{{ store.offlineLogs.length }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <!-- OFFLINE STATIONS LIST -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="bg-red-1">
            <div class="text-subtitle1 text-weight-bold text-red-8">
              <q-icon name="router" class="q-mr-xs" />
              Offline Stations
            </div>
            <div class="text-caption text-grey">No signal for more than 10 minutes</div>
          </q-card-section>

          <q-card-section v-if="store.offlineStations.length === 0" class="text-center q-py-lg">
            <q-icon name="check_circle" size="40px" color="green" />
            <div class="text-caption text-grey q-mt-sm">All stations are online!</div>
          </q-card-section>

          <q-list separator v-else>
            <q-item v-for="s in store.offlineStations" :key="s.stationId">
              <q-item-section avatar>
                <q-icon name="wifi_off" color="red" size="28px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  Station {{ s.stationId }}
                  <span v-if="s.place" class="text-grey text-caption q-ml-xs">
                    — {{ s.place }}
                  </span>
                </q-item-label>
                <q-item-label caption class="text-red-6">
                  Last seen: {{ s.lastSeen }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="red" label="OFFLINE" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- OFFLINE SLOTS LIST -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="bg-orange-1">
            <div class="text-subtitle1 text-weight-bold text-orange-8">
              <q-icon name="power_off" class="q-mr-xs" />
              Offline Slots
            </div>
            <div class="text-caption text-grey">
              Slot onlineChecker not updated for more than 10 minutes
            </div>
          </q-card-section>

          <q-card-section v-if="store.offlineSlots.length === 0" class="text-center q-py-lg">
            <q-icon name="check_circle" size="40px" color="green" />
            <div class="text-caption text-grey q-mt-sm">All slots are online!</div>
          </q-card-section>

          <q-list separator v-else>
            <q-item v-for="slot in store.offlineSlots" :key="`${slot.stationId}_${slot.slotName}`">
              <q-item-section avatar>
                <q-icon name="power_off" color="orange" size="28px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  Station {{ slot.stationId }} —
                  {{ slot.slotName.toUpperCase() }}
                  <span class="text-caption text-grey q-ml-xs">
                    {{ slot.stationPlace }}
                  </span>
                </q-item-label>
                <q-item-label caption>
                  Battery: {{ slot.batteryPercent }}% • Status: {{ slot.status }} • Last seen:
                  {{ slot.lastSeen }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="orange" label="OFFLINE" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>

    <!-- LOGS -->
    <q-card>
      <q-card-section class="bg-grey-3">
        <div class="row items-center">
          <div class="col">
            <div class="text-subtitle1 text-weight-bold">
              <q-icon name="receipt_long" class="q-mr-xs" />
              Connection Event Logs
            </div>
            <div class="text-caption text-grey">
              Tracked since this admin session started. Resets on page refresh.
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              dense
              size="sm"
              color="grey-7"
              icon="delete_sweep"
              label="Clear Logs"
              @click="clearLogs"
              :disable="store.offlineLogs.length === 0"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section v-if="store.offlineLogs.length === 0" class="text-center q-py-xl">
        <q-icon name="receipt_long" size="48px" color="grey-4" />
        <div class="text-h6 text-grey q-mt-md">No Events Yet</div>
        <div class="text-caption text-grey">
          Logs appear here when a slot or station switches online ↔ offline while you have this
          admin panel open.
        </div>
      </q-card-section>

      <q-list separator v-else>
        <q-item v-for="log in store.offlineLogs" :key="log.id">
          <q-item-section avatar>
            <q-icon
              :name="log.event === 'offline' ? 'wifi_off' : 'wifi'"
              :color="log.event === 'offline' ? 'red' : 'green'"
              size="24px"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <q-badge
                :color="log.type === 'station' ? 'blue' : 'purple'"
                :label="log.type === 'station' ? 'STATION' : 'SLOT'"
                class="q-mr-sm"
              />
              <strong>Station {{ log.stationId }}</strong>
              <span v-if="log.slotName"> — {{ log.slotName.toUpperCase() }} </span>
              <span v-if="log.place" class="text-grey text-caption q-ml-xs">
                ({{ log.place }})
              </span>
            </q-item-label>
            <q-item-label caption>
              <span :class="log.event === 'offline' ? 'text-red' : 'text-green'">
                {{ log.event === 'offline' ? '🔴 Went OFFLINE' : '🟢 Came ONLINE' }}
              </span>
              at {{ formatTime(log.time) }}
              <span v-if="log.lastSeen && log.event === 'offline'" class="text-grey">
                — last seen {{ formatTime(log.lastSeen) }}
              </span>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <span class="text-caption text-grey">{{ timeAgo(log.time) }}</span>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useAdminStore } from 'src/stores/admin-store'

const store = useAdminStore()

const totalOffline = computed(() => store.offlineStations.length + store.offlineSlots.length)

function clearLogs() {
  store.offlineLogs.splice(0)
}

function formatTime(isoStr) {
  if (!isoStr) return '—'
  try {
    return new Date(isoStr).toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  } catch {
    return isoStr
  }
}

function timeAgo(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
</script>

<style scoped>
.stat-card {
  border-radius: 10px;
}
</style>
