<!-- src\pages\DashboardPage.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2">

    <!-- PAGE TITLE -->
    <div class="text-h5 text-weight-bold q-mb-md">
      <q-icon name="dashboard" class="q-mr-sm" />
      Dashboard Overview
    </div>

    <!-- LOADING -->
    <div v-if="store.isLoading" class="flex flex-center" style="min-height: 300px">
      <q-spinner-dots size="50px" color="amber" />
      <span class="q-ml-md text-grey">Loading data from Firebase...</span>
    </div>

    <template v-else>

      <!-- STATS CARDS ROW -->
      <div class="row q-col-gutter-md q-mb-md">

        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <q-card class="stat-card bg-blue-9 text-white">
            <q-card-section>
              <div class="stat-icon"><q-icon name="solar_power" size="40px" /></div>
              <div class="stat-value">{{ store.totalStations }}</div>
              <div class="stat-label">Total Stations</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <q-card class="stat-card bg-green-8 text-white">
            <q-card-section>
              <div class="stat-icon"><q-icon name="check_circle" size="40px" /></div>
              <div class="stat-value">{{ store.availableSlots.length }}</div>
              <div class="stat-label">Available Slots</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <q-card class="stat-card bg-orange-8 text-white">
            <q-card-section>
              <div class="stat-icon"><q-icon name="ev_station" size="40px" /></div>
              <div class="stat-value">{{ store.activeRentals.length }}</div>
              <div class="stat-label">Active Rentals</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <q-card class="stat-card bg-red-8 text-white">
            <q-card-section>
              <div class="stat-icon"><q-icon name="warning" size="40px" /></div>
              <div class="stat-value">{{ store.overdueRentals.length }}</div>
              <div class="stat-label">Overdue</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <q-card class="stat-card bg-purple-8 text-white">
            <q-card-section>
              <div class="stat-icon"><q-icon name="people" size="40px" /></div>
              <div class="stat-value">{{ store.totalUsers }}</div>
              <div class="stat-label">Total Users</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <q-card class="stat-card bg-grey-8 text-white">
            <q-card-section>
              <div class="stat-icon"><q-icon name="block" size="40px" /></div>
              <div class="stat-value">{{ store.bannedUsers }}</div>
              <div class="stat-label">Banned Users</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- SECOND ROW: OVERDUE ALERTS + RECENT ACTIVITY -->
      <div class="row q-col-gutter-md q-mb-md">

        <!-- OVERDUE ALERTS -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section class="bg-red-1">
              <div class="text-h6 text-red-8">
                <q-icon name="warning" class="q-mr-sm" />
                Overdue Alerts
                <q-badge color="red" class="q-ml-sm">
                  {{ store.overdueRentals.length }}
                </q-badge>
              </div>
            </q-card-section>

            <q-card-section v-if="store.overdueRentals.length === 0">
              <div class="text-grey text-center q-py-lg">
                <q-icon name="check_circle" size="48px" color="green" />
                <div class="q-mt-sm">No overdue rentals! 🎉</div>
              </div>
            </q-card-section>

            <q-list separator v-else>
              <q-item v-for="rental in store.overdueRentals" :key="rental.stationId + rental.slotName">
                <q-item-section avatar>
                  <q-avatar>
                    <img v-if="rental.userPhoto" :src="rental.userPhoto" />
                    <q-icon v-else name="person" color="grey" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ rental.rentedByName || 'Unknown' }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ rental.rentedByPhone }} •
                    Station {{ rental.stationId }} {{ rental.slotName }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="red">
                    {{ rental.overdueMinutes }} min overdue
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <!-- RECENT RENTALS -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section class="bg-blue-1">
              <div class="text-h6 text-blue-8">
                <q-icon name="history" class="q-mr-sm" />
                Recent Rental History
              </div>
            </q-card-section>

            <q-card-section v-if="store.rentalHistoryList.length === 0">
              <div class="text-grey text-center q-py-lg">
                <q-icon name="inbox" size="48px" color="grey" />
                <div class="q-mt-sm">No rental history yet</div>
              </div>
            </q-card-section>

            <q-list separator v-else>
              <q-item v-for="r in store.rentalHistoryList.slice(0, 5)" :key="r.id">
                <q-item-section avatar>
                  <q-avatar>
                    <img v-if="r.profilePictureUrl" :src="r.profilePictureUrl" />
                    <q-icon v-else name="person" color="grey" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ r.userName || 'Unknown' }}</q-item-label>
                  <q-item-label caption>
                    Station {{ r.stationId }} • {{ r.slotName }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="r.wasOverdue ? 'red' : 'green'">
                    {{ r.status || 'returned' }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>

      <!-- ACTIVE RENTALS QUICK TABLE -->
      <q-card v-if="store.activeRentals.length > 0">
        <q-card-section class="bg-orange-1">
          <div class="text-h6 text-orange-8">
            <q-icon name="ev_station" class="q-mr-sm" />
            Current Active Rentals
          </div>
        </q-card-section>

        <q-table
          :rows="store.activeRentals"
          :columns="quickColumns"
          row-key="stationId"
          flat
          dense
        >
          <template v-slot:body-cell-photo="props">
            <q-td :props="props">
              <q-avatar size="32px">
                <img v-if="props.row.userPhoto" :src="props.row.userPhoto" />
                <q-icon v-else name="person" />
              </q-avatar>
            </q-td>
          </template>

          <template v-slot:body-cell-urgency="props">
            <q-td :props="props">
              <q-badge
                :color="props.value === 'overdue' ? 'red' : props.value === 'warning' ? 'orange' : 'green'"
              >
                {{ props.value === 'overdue' ? 'OVERDUE' : props.value === 'warning' ? 'WARNING' : 'OK' }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-battery="props">
            <q-td :props="props">
              <q-linear-progress
                :value="(props.value || 0) / 100"
                :color="props.value > 50 ? 'green' : props.value > 20 ? 'orange' : 'red'"
                style="width: 60px; height: 8px"
                rounded
              />
              <span class="text-caption q-ml-xs">{{ props.value }}%</span>
            </q-td>
          </template>
        </q-table>
      </q-card>

    </template>
  </q-page>
</template>

<script setup>
import { useAdminStore } from 'src/stores/admin-store'

const store = useAdminStore()

const quickColumns = [
  { name: 'photo', label: '', field: 'userPhoto', align: 'center', style: 'width: 50px' },
  { name: 'rentedByName', label: 'Renter', field: 'rentedByName', align: 'left' },
  { name: 'stationId', label: 'Station', field: 'stationId', align: 'center' },
  { name: 'slotName', label: 'Slot', field: 'slotName', align: 'center' },
  { name: 'battery', label: 'Battery', field: 'batteryPercent', align: 'center' },
  { name: 'elapsedHours', label: 'Hours', field: 'elapsedHours', align: 'center' },
  { name: 'urgency', label: 'Status', field: 'urgency', align: 'center' }
]
</script>

<style lang="scss" scoped>
.stat-card {
  border-radius: 12px;
  .stat-icon {
    opacity: 0.7;
    margin-bottom: 8px;
  }
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
  }
  .stat-label {
    font-size: 0.85rem;
    opacity: 0.8;
    margin-top: 4px;
  }
}
</style>
