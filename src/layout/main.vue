<template>
  <q-layout view="hHh LpR fFf">

    <q-header reveal elevated class="bg-blue-10 text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <b>WebRTC</b> Camera
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
        show-if-above
        v-model="leftDrawerOpen"
        side="left"
        behavior="desktop"
        bordered
        :width="260"
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
        <q-item clickable v-ripple to="/record">
          <q-item-section avatar>
            <q-icon name="video_library" />
          </q-item-section>
          <q-item-section>
            錄影紀錄
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/create">
          <q-item-section avatar>
            <q-icon name="video_call" />
          </q-item-section>

          <q-item-section>
            建立紀錄
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/device">
          <q-item-section avatar >
            <q-icon name="videocam" />
          </q-item-section>

          <q-item-section>
            裝置管理
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/qrcode">
          <q-item-section avatar >
            <q-icon name="qr_code_2" />
          </q-item-section>

          <q-item-section>
            二維碼清單
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/settings">
          <q-item-section avatar >
            <q-icon name="settings" />
          </q-item-section>

          <q-item-section>
            設定
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

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getAuth, signOut } from 'firebase/auth'

export default {
  setup () {
    const $q = useQuasar()
    const $router = useRouter()
    const leftDrawerOpen = ref(false)
    const Logout = () => {
      const auth = getAuth()
      return signOut(auth).then(() => {
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

    return {
      Logout,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
}
</script>
