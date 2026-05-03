<!-- src\layouts\AdminLayout.vue -->
<template>
  <q-layout view="lHh LpR lff">
    <!-- TOP BAR -->
    <q-header class="bg-dark">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleDrawer" />
        <q-toolbar-title class="flex items-center">
          <q-icon name="solar_power" color="amber" size="28px" class="q-mr-sm" />
          <span class="text-amber text-weight-bold">KURYENTA</span>
          <span class="q-ml-sm text-grey-4">Admin</span>
        </q-toolbar-title>

        <!-- Overdue badge -->
        <q-btn flat round v-if="store.overdueRentals.length > 0">
          <q-icon name="warning" color="red" />
          <q-badge color="red" floating>{{ store.overdueRentals.length }}</q-badge>
        </q-btn>

        <q-btn flat round icon="refresh" @click="refreshData" />
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR -->
    <q-drawer v-model="drawerOpen" :width="250" :breakpoint="768" bordered class="bg-grey-10">
      <q-list class="text-grey-4">
        <!-- Logo area -->
        <q-item class="q-py-lg q-px-md">
          <q-item-section avatar>
            <q-icon name="solar_power" color="amber" size="36px" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-amber text-h6 text-weight-bold"> KURYENTA </q-item-label>
            <q-item-label caption class="text-grey-6"> Admin Panel </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator dark />

        <!-- Navigation -->
        <q-item
          v-for="nav in navItems"
          :key="nav.to"
          :to="nav.to"
          clickable
          v-ripple
          active-class="bg-grey-8 text-amber"
          class="q-my-xs q-mx-sm rounded-borders"
        >
          <q-item-section avatar>
            <q-icon :name="nav.icon" />
          </q-item-section>
          <q-item-section>{{ nav.label }}</q-item-section>

          <!-- Badge for overdue -->
          <q-item-section side v-if="nav.badge && nav.badge > 0">
            <q-badge :color="nav.badgeColor || 'red'" :label="nav.badge" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- MAIN CONTENT -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from 'src/stores/admin-store'

const store = useAdminStore()
const drawerOpen = ref(true)

const navItems = computed(() => [
  { label: 'Dashboard', icon: 'dashboard', to: '/' },
  { label: 'Live Map', icon: 'map', to: '/map' },
  {
    label: 'Active Rentals',
    icon: 'ev_station',
    to: '/rentals',
    badge: store.activeRentals.length,
    badgeColor: 'blue',
  },
  {
    label: 'Overdue Alerts',
    icon: 'warning',
    to: '/rentals',
    badge: store.overdueRentals.length,
    badgeColor: 'red',
  },
  { label: 'Rental History', icon: 'history', to: '/history' },
  {
    label: 'Users',
    icon: 'people',
    to: '/users',
    badge: store.bannedUsers,
    badgeColor: 'orange',
  },
  { label: 'Stations', icon: 'solar_power', to: '/stations' },
  {
    label: 'Offline Monitor',
    icon: 'wifi_off',
    to: '/offline',
    badge: store.offlineStations.length + store.offlineSlots.length || 0,
    badgeColor: 'red',
  },
])

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value
}

function refreshData() {
  window.location.reload()
}

onMounted(() => {
  store.initListeners()
})
</script>
