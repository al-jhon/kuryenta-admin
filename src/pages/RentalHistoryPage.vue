<!-- src\pages\RentalHistoryPage.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2">

    <div class="text-h5 text-weight-bold q-mb-md">
      <q-icon name="history" class="q-mr-sm" />
      Rental History
      <q-badge color="blue" class="q-ml-sm">{{ store.rentalHistoryList.length }}</q-badge>
    </div>

    <q-card v-if="store.rentalHistoryList.length === 0" class="q-pa-xl text-center">
      <q-icon name="history" size="80px" color="grey-4" />
      <div class="text-h6 text-grey q-mt-md">No Rental History Yet</div>
    </q-card>

    <q-card v-else>
      <q-table
        :rows="store.rentalHistoryList"
        :columns="columns"
        row-key="id"
        :filter="search"
        :rows-per-page-options="[10, 25, 50]"
        flat
      >
        <template v-slot:top-right>
          <q-input v-model="search" dense outlined placeholder="Search...">
            <template v-slot:prepend><q-icon name="search" /></template>
          </q-input>
        </template>

        <template v-slot:body-cell-photo="props">
          <q-td :props="props">
            <q-avatar size="36px">
              <img v-if="props.row.profilePictureUrl" :src="props.row.profilePictureUrl" />
              <q-icon v-else name="person" color="grey" />
            </q-avatar>
          </q-td>
        </template>

        <template v-slot:body-cell-wasOverdue="props">
          <q-td :props="props">
            <q-badge :color="props.value ? 'red' : 'green'">
              {{ props.value ? 'LATE' : 'On Time' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.value === 'returned' ? 'green' : 'orange'">
              {{ props.value }}
            </q-badge>
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
  { name: 'photo', label: '', field: 'profilePictureUrl', align: 'center', style: 'width: 50px' },
  { name: 'userName', label: 'User', field: 'userName', align: 'left', sortable: true },
  { name: 'userPhone', label: 'Phone', field: 'userPhone', align: 'left' },
  { name: 'stationId', label: 'Station', field: 'stationId', align: 'center' },
  { name: 'slotName', label: 'Slot', field: 'slotName', align: 'center' },
  { name: 'rentedAt', label: 'Rented At', field: 'rentedAt', align: 'center', sortable: true },
  { name: 'returnBy', label: 'Return By', field: 'returnBy', align: 'center' },
  { name: 'amountPaid', label: 'Paid', field: 'amountPaid', align: 'center',
    format: v => v ? `₱${v}` : '-' },
  { name: 'wasOverdue', label: 'Late?', field: 'wasOverdue', align: 'center', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center' }
]
</script>
