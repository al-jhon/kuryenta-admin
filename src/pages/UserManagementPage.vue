<!-- src\pages\UserManagementPage.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2">

    <div class="text-h5 text-weight-bold q-mb-md">
      <q-icon name="people" class="q-mr-sm" />
      User Management
      <q-badge color="blue" class="q-ml-sm">{{ store.totalUsers }}</q-badge>
      <q-badge v-if="store.bannedUsers" color="red" class="q-ml-sm">
        {{ store.bannedUsers }} banned
      </q-badge>
    </div>

    <q-card v-if="store.userList.length === 0" class="q-pa-xl text-center">
      <q-icon name="people" size="80px" color="grey-4" />
      <div class="text-h6 text-grey q-mt-md">No Users Registered Yet</div>
    </q-card>

    <q-card v-else>
      <q-table
        :rows="store.userList"
        :columns="columns"
        row-key="id"
        :filter="search"
        :rows-per-page-options="[10, 25, 50]"
        flat
      >
        <template v-slot:top-right>
          <q-input v-model="search" dense outlined placeholder="Search user...">
            <template v-slot:prepend><q-icon name="search" /></template>
          </q-input>
        </template>

        <!-- Photo -->
        <template v-slot:body-cell-photo="props">
          <q-td :props="props">
            <q-avatar size="40px">
              <img v-if="props.row.profilePictureUrl" :src="props.row.profilePictureUrl" />
              <q-icon v-else name="person" size="24px" color="grey" />
            </q-avatar>
          </q-td>
        </template>

        <!-- Strikes -->
        <template v-slot:body-cell-strikes="props">
          <q-td :props="props">
            <q-badge
              :color="props.value >= 3 ? 'red' : props.value >= 1 ? 'orange' : 'green'"
            >
              {{ props.value || 0 }} / 3
            </q-badge>
          </q-td>
        </template>

        <!-- Status -->
        <template v-slot:body-cell-isBanned="props">
          <q-td :props="props">
            <q-badge :color="props.value ? 'red' : 'green'">
              {{ props.value ? '🚫 Banned' : '✅ Active' }}
            </q-badge>
          </q-td>
        </template>

        <!-- Active Rental -->
        <template v-slot:body-cell-activeRental="props">
          <q-td :props="props">
            <q-badge v-if="props.value" color="orange">
              Station {{ props.value.stationId }} • {{ props.value.slotName }}
            </q-badge>
            <span v-else class="text-grey text-caption">None</span>
          </q-td>
        </template>

        <!-- Actions -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              v-if="!props.row.isBanned"
              flat dense size="sm"
              color="red"
              icon="block"
              label="Ban"
              @click="confirmBan(props.row)"
            />
            <q-btn
              v-else
              flat dense size="sm"
              color="green"
              icon="check_circle"
              label="Unban"
              @click="confirmUnban(props.row)"
            />
            <q-btn
              flat dense size="sm"
              color="orange"
              icon="restart_alt"
              label="Reset"
              @click="confirmReset(props.row)"
              class="q-ml-xs"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAdminStore } from 'src/stores/admin-store'

const $q = useQuasar()
const store = useAdminStore()
const search = ref('')

const columns = [
  { name: 'photo', label: '', field: 'profilePictureUrl', align: 'center', style: 'width: 50px' },
  { name: 'fullName', label: 'Name', field: 'fullName', align: 'left', sortable: true },
  { name: 'phoneNumber', label: 'Phone', field: 'phoneNumber', align: 'left' },
  { name: 'barangay', label: 'Barangay', field: 'barangay', align: 'left' },
  { name: 'creditPoints', label: 'Credits', field: 'creditPoints', align: 'center', sortable: true },
  { name: 'strikes', label: 'Strikes', field: 'strikes', align: 'center', sortable: true },
  { name: 'isBanned', label: 'Status', field: 'isBanned', align: 'center', sortable: true },
  { name: 'activeRental', label: 'Rental', field: 'activeRental', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'id', align: 'center' }
]

function confirmBan(user) {
  $q.dialog({
    title: 'Ban User',
    message: `Are you sure you want to ban ${user.fullName}?`,
    cancel: true,
    persistent: true,
    color: 'red'
  }).onOk(async () => {
    await store.banUser(user.id)
    $q.notify({ type: 'negative', message: `${user.fullName} has been banned` })
  })
}

function confirmUnban(user) {
  $q.dialog({
    title: 'Unban User',
    message: `Unban ${user.fullName}?`,
    cancel: true,
    color: 'green'
  }).onOk(async () => {
    await store.unbanUser(user.id)
    $q.notify({ type: 'positive', message: `${user.fullName} has been unbanned` })
  })
}

function confirmReset(user) {
  $q.dialog({
    title: 'Reset Strikes',
    message: `Reset all strikes for ${user.fullName}? This will also unban them.`,
    cancel: true,
    color: 'orange'
  }).onOk(async () => {
    await store.resetStrikes(user.id)
    $q.notify({ type: 'info', message: `Strikes reset for ${user.fullName}` })
  })
}
</script>
