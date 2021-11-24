<template>
  <q-layout view="hHh LpR fFf">

    <q-header elevated class="bg-blue-10 text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <b>Shipment</b> Management
        </q-toolbar-title>

        <q-space />

        <q-btn v-if="NavPermission.includes('record')" dense flat round icon="qr_code" @click="toggleRightDrawer" />
      </q-toolbar>

    </q-header>

    <q-drawer
        show-if-above
        v-model="leftDrawerOpen"
        side="left"
        behavior="default"
        bordered
        :width="240"
        :breakpoint="400"
        class="flex column justify-between"
    >
      <q-list class="full-width" padding>
        <q-item clickable v-ripple to="/dashboard">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            總覽
          </q-item-section>
        </q-item>
        <q-item v-if="NavPermission.includes('shipment')" clickable v-ripple to="/shipment">
          <q-item-section avatar>
            <q-icon name="local_shipping" />
          </q-item-section>
          <q-item-section>
            貨件管理
          </q-item-section>
        </q-item>
        <q-item v-if="NavPermission.includes('record')" clickable v-ripple to="/record">
          <q-item-section avatar>
            <q-icon name="videocam" />
          </q-item-section>
          <q-item-section>
            揀貨錄影
          </q-item-section>
        </q-item>
      </q-list>

      <q-list class="full-width">
        <q-item clickable v-ripple class="bg-red-9 text-white" @click="Logout()">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            登出
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-drawer
        :overlay="true"
        show-if-above
        :persistent="false"
        v-model="rightDrawerOpen"
        side="right"
        bordered
        :width="200"
        :breakpoint="1200"
    >
      <div class="q-pa-md">
<!--        <q-field label="開啟鏡頭" stack-label>-->
<!--          <template v-slot:control>-->
<!--            <div class="self-center full-width no-outline q-mt-md" tabindex="0">-->
<!--              <img src="../assets/open.svg" class="full-width">-->
<!--            </div>-->
<!--          </template>-->
<!--        </q-field>-->
        <q-field label="開始錄影" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline q-mt-md" tabindex="0">
              <img src="../assets/start.svg" class="full-width">
            </div>
          </template>
        </q-field>
        <q-field label="停止錄影" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline q-mt-md" tabindex="0">
              <img src="../assets/end.svg" class="full-width">
            </div>
          </template>
        </q-field>
<!--        <q-field label="關閉鏡頭" stack-label>-->
<!--          <template v-slot:control>-->
<!--            <div class="self-center full-width no-outline q-mt-md" tabindex="0">-->
<!--              <img src="../assets/close.svg" class="full-width">-->
<!--            </div>-->
<!--          </template>-->
<!--        </q-field>-->
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getAuth, signOut } from 'firebase/auth'

export default {
  setup () {
    const $q = useQuasar()
    const $router = useRouter()
    const Permission = JSON.parse(localStorage.getItem('User'))?.Permission || {}
    const FeaturePermission = Permission.Features?.shipment || []
    if (FeaturePermission.includes('get') && FeaturePermission.length === 1) {
      $router.replace('/shipment/get')
    }
    const NavPermission = Permission?.Navigation || []
    const leftDrawerOpen = ref(false)
    const rightDrawerOpen = ref(false)
    const Logout = () => {
      const auth = getAuth()
      return signOut(auth).then(() => {
        localStorage.removeItem('User')
        $router.replace('/login')
        $q.notify({
          type: 'positive',
          color: 'green-7',
          textColor: 'white',
          message: '成功',
          caption: '您已經登出系統'
        })
      })
    }

    onMounted(() => {
      rightDrawerOpen.value = false
    })

    return {
      Logout,
      leftDrawerOpen,
      rightDrawerOpen,
      NavPermission,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      toggleRightDrawer () {
        rightDrawerOpen.value = !rightDrawerOpen.value
      }
    }
  }
}
</script>
