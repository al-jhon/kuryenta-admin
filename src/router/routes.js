// src\router\routes.js
const routes = [
  {
    path: '/',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { title: 'Dashboard', icon: 'dashboard' },
      },
      {
        path: 'map',
        name: 'live-map',
        component: () => import('pages/LiveMapPage.vue'),
        meta: { title: 'Live Map', icon: 'map' },
      },
      {
        path: 'rentals',
        name: 'active-rentals',
        component: () => import('pages/ActiveRentalsPage.vue'),
        meta: { title: 'Active Rentals', icon: 'ev_station' },
      },
      {
        path: 'history',
        name: 'rental-history',
        component: () => import('pages/RentalHistoryPage.vue'),
        meta: { title: 'Rental History', icon: 'history' },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('pages/UserManagementPage.vue'),
        meta: { title: 'Users', icon: 'people' },
      },
      {
        path: 'stations',
        name: 'stations',
        component: () => import('pages/StationsPage.vue'),
        meta: { title: 'Stations', icon: 'solar_power' },
      },
      {
        path: 'offline',
        name: 'offline-monitor',
        component: () => import('pages/OfflineMonitorPage.vue'),
        meta: { title: 'Offline Monitor', icon: 'wifi_off' },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
