<template>
  <main class="q-pa-lg">
    <h1 class="text-h4 text-weight-bold q-mt-none q-mb-md">貨件管理</h1>
    <q-tabs active-color="primary" indicator-color="primary" align="left">
      <q-route-tab v-if="FeaturePermission.includes('list')" to="/shipment/list" exact label="貨件列表" />
      <q-route-tab v-if="FeaturePermission.includes('get')" to="/shipment/get" exact label="現場作業" />
    </q-tabs>
    <q-separator />
    <router-view />
  </main>
</template>

<script>
import { useRouter } from 'vue-router'
export default {
  name: 'ShipmentIndex',
  setup () {
    const Permission = JSON.parse(localStorage.getItem('User'))?.Permission || {}
    const FeaturePermission = Permission.Features?.shipment || []
    const $router = useRouter()
    if (FeaturePermission.includes('get') &&  FeaturePermission.length === 1) {
      $router.replace('/shipment/get')
    }
    return {
      FeaturePermission
    }
  }
}
</script>

<style scoped>

</style>
