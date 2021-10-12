<template>
  <main class="q-pa-lg">
    <h1 class="text-h4 text-weight-bold q-mt-none q-mb-md">揀貨錄影</h1>
    <q-tabs active-color="primary" indicator-color="primary" align="left">
      <q-route-tab v-if="FeaturePermission.includes('create')" to="/record/create" exact label="現場作業" />
      <q-route-tab v-if="FeaturePermission.includes('list')" to="/record/list" exact label="歷史紀錄" />
    </q-tabs>
    <q-separator />
    <router-view />
  </main>
</template>

<script>
import { useRouter } from 'vue-router'
export default {
  name: 'RecordIndex',
  setup () {
    const Permission = JSON.parse(localStorage.getItem('User')).Permission || {}
    const FeaturePermission = Permission.Features?.record || []
    const $router = useRouter()
    if (FeaturePermission.includes('list')) {
      $router.replace('/record/list')
    } else {
      $router.replace('/record/create')
    }
    return {
      FeaturePermission
    }
  }
}
</script>

<style scoped>

</style>
