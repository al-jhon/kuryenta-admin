<!-- src\pages\ActiveRentalsPage.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2">

    <div class="text-h5 text-weight-bold q-mb-md">
      <q-icon name="ev_station" class="q-mr-sm" />
      Active Rentals
      <q-badge color="blue" class="q-ml-sm">{{ store.activeRentals.length }}</q-badge>
      <q-badge v-if="store.overdueRentals.length" color="red" class="q-ml-sm">
        {{ store.overdueRentals.length }} overdue
      </q-badge>
    </div>

    <!-- EMPTY STATE -->
    <q-card v-if="store.activeRentals.length === 0" class="q-pa-xl text-center">
      <q-icon name="ev_station" size="80px" color="grey-4" />
      <div class="text-h6 text-grey q-mt-md">No Active Rentals</div>
      <div class="text-caption text-grey">All detachable power sources are at the station</div>
    </q-card>

    <!-- RENTALS TABLE -->
    <q-card v-else>
      <q-table
        :rows="store.activeRentals"
        :columns="columns"
        row-key="slotName"
        :filter="search"
        :rows-per-page-options="[10, 20, 50]"
        flat
      >
        <!-- Search -->
        <template v-slot:top-right>
          <q-input v-model="search" dense outlined placeholder="Search renter...">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <!-- Photo column -->
        <template v-slot:body-cell-photo="props">
          <q-td :props="props">
            <q-avatar size="40px">
              <img v-if="props.row.userPhoto" :src="props.row.userPhoto" />
              <q-icon v-else name="person" size="24px" color="grey" />
            </q-avatar>
          </q-td>
        </template>

        <!-- Battery column -->
        <template v-slot:body-cell-batteryPercent="props">
          <q-td :props="props">
            <div class="flex items-center no-wrap">
              <q-linear-progress
                :value="(props.value || 0) / 100"
                :color="props.value > 50 ? 'green' : props.value > 20 ? 'orange' : 'red'"
                style="width: 60px; height: 10px"
                rounded
                class="q-mr-sm"
              />
              <span class="text-caption text-weight-medium">{{ props.value || 0 }}%</span>
            </div>
          </q-td>
        </template>

        <!-- Time remaining column -->
        <template v-slot:body-cell-remainingHours="props">
          <q-td :props="props">
            <span v-if="props.row.isOverdue" class="text-red text-weight-bold">
              -{{ props.row.overdueMinutes }} min
            </span>
            <span v-else-if="props.value < 2" class="text-orange text-weight-bold">
              {{ props.value }}h left
            </span>
            <span v-else class="text-green">
              {{ props.value }}h left
            </span>
          </q-td>
        </template>

        <!-- Status column -->
        <template v-slot:body-cell-urgency="props">
          <q-td :props="props">
            <q-badge
              :color="props.value === 'overdue' ? 'red' : props.value === 'warning' ? 'orange' : 'green'"
              :label="props.value === 'overdue' ? 'OVERDUE' : props.value === 'warning' ? 'WARNING' : 'ON TIME'"
            />
          </q-td>
        </template>

        <!-- GPS column -->
        <template v-slot:body-cell-gps="props">
          <q-td :props="props">
            <q-btn
              v-if="props.row.latitude && props.row.longitude"
              flat
              dense
              size="sm"
              color="primary"
              icon="location_on"
              :href="`https://maps.google.com/?q=${props.row.latitude},${props.row.longitude}`"
              target="_blank"
              label="View"
            />
            <span v-else class="text-grey text-caption">No GPS</span>
          </q-td>
        </template>

      </q-table>
    </q-card>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useAdminStore } from 'src/stores/admin-store'

const store = useAdminStore()
const search = ref('')

const columns = [
  { name: 'photo', label: '', field: 'userPhoto', align: 'center', style: 'width: 60px' },
  { name: 'rentedByName', label: 'Renter', field: 'rentedByName', align: 'left', sortable: true },
  { name: 'rentedByPhone', label: 'Phone', field: 'rentedByPhone', align: 'left' },
  { name: 'stationPlace', label: 'Station', field: 'stationPlace', align: 'center' },
  { name: 'slotName', label: 'Slot', field: 'slotName', align: 'center' },
  { name: 'batteryPercent', label: 'Battery', field: 'batteryPercent', align: 'center', sortable: true },
  { name: 'elapsedHours', label: 'Elapsed', field: 'elapsedHours', align: 'center', sortable: true },
  { name: 'remainingHours', label: 'Remaining', field: 'remainingHours', align: 'center', sortable: true },
  { name: 'urgency', label: 'Status', field: 'urgency', align: 'center', sortable: true },
  { name: 'gps', label: 'GPS', field: 'latitude', align: 'center' }
]
</script>
