<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center bg-blue-10">
        <div class="column q-pa-md">
          <h5 class="text-h4 text-white q-my-md text-center"><b>Shipment</b> Management</h5>
          <div class="row">
            <q-card square bordered flat class="q-pa-lg shadow-1">
              <q-card-section>
                <q-form class="q-gutter-md">
                  <q-input stack-label square filled clearable v-model="Project" type="text" label="公司代碼" placeholder="輸入公司代碼" />
                  <q-input stack-label square filled clearable v-model="Account" type="text" label="員工帳號" placeholder="輸入員工帳號" />
                  <q-input stack-label square filled clearable v-model="Password" type="password" label="密碼" placeholder="請輸入密碼" />
                </q-form>
              </q-card-section>
              <q-card-actions class="q-px-md">
                <q-btn unelevated color="light-green-8" class="full-width" label="登入" @click="DoLogin()" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { FunctionServerRequest } from '../plugins/request'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import ErrorCode from '../locales/error'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup () {
    const $q = useQuasar()
    const $router = useRouter()
    const Project = ref('')
    const Account = ref('')
    const Password = ref('')
    const DoLogin = () => {
      $q.loadingBar.start()
      return FunctionServerRequest.post('/DoLogin', {
        Project: Project.value,
        Account: Account.value
      }).then(({ data }) => {
        const auth = getAuth()
        return signInWithEmailAndPassword(auth, data.UserData.Email, Password.value).then(() => {
          $q.loadingBar.stop()
          localStorage.setItem('User', JSON.stringify({
            Project: Project.value,
            Account: Account.value,
            Email: data.UserData.Email,
            Name: data.UserData.Name,
            Permission: data.UserData.Permission
          }))
          $router.push('/dashboard')
          $q.notify({
            type: 'positive',
            color: 'green-7',
            textColor: 'white',
            message: '成功',
            caption: '您已成功登入系統'
          })
        }).catch((error) => {
          throw error
        })
      }).catch((error) => {
        console.log(error.message)
        $q.loadingBar.stop()
        $q.notify({
          type: 'negative',
          message: '錯誤',
          caption: error.Message || ErrorCode[error.code]
        })
      })
    }
    return {
      Project,
      Account,
      Password,
      DoLogin
    }
  }
}
</script>

<style>
.q-card {
  width: 100%;
  max-width: 420px;
}
</style>
