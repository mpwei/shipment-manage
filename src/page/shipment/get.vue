<template>
  <main class="q-py-lg">
    <div class="container-xs">
      <q-btn-toggle
          v-model="Mode"
          spread
          no-caps
          unelevated
          toggle-color="primary"
          color="white"
          text-color="primary"
          :options="[{label: '掃描模式', value: 'Scan'},{label: '輸入模式', value: 'Keyboard'}]"
          style="border: 1px solid #027be3"
          class="q-mb-md"
          @update:model-value="SwitchMode()"
      />
      <q-input stack-label v-model="Account" label="員工帳號" readonly />
      <q-input stack-label v-model="UserName" label="員工名稱" readonly />
      <q-input stack-label v-model="ShipmentNo" label="揀貨單號" placeholder="輸入揀貨單號或掃描揀貨單上條碼" clearable @update:model-value="Execute" />
      <q-card v-if="Object.keys(Data).length > 0" class="q-mt-lg">
        <q-card-section>
          <h4 class="text-h2 text-weight-bold text-red-10 text-center q-my-none">{{ Data.Location || Data.Message }}</h4>
        </q-card-section>
      </q-card>
    </div>
  </main>
</template>

<script>
import { onMounted, ref, watch } from 'vue'
import { getAuth, getIdToken } from 'firebase/auth'
import { useQuasar } from 'quasar'
import { InnerServerRequest } from '@/plugins/request'
import ErrorCode from '../../locales/error'

export default {
  name: 'ShipmentGet',
  setup () {
    const User = JSON.parse(localStorage.getItem('User'))
    const Account = ref(User.Account)
    const UserName = ref(User.Name)
    const $q = useQuasar()
    const Mode = ref('Scan')
    const TempInput = ref('')
    const ShipmentNo = ref('')
    const Data = ref({})
    const KeyIn = (event) => {
      switch (event.key) {
        case 'Shift':
          break
        case 'Enter':
          ShipmentNo.value = TempInput.value
          TempInput.value = ''
          break
        default:
          TempInput.value += event.key
          break
      }
      // console.log(event)
    }
    const SwitchMode = () => {
      if (Mode.value === 'Scan') {
        window.addEventListener('keydown', KeyIn, false)
      } else {
        window.removeEventListener('keydown', KeyIn, false)
      }
    }

    onMounted(() => {
      SwitchMode()
    })

    const Execute = (value) => {
      Data.value = {}
      if (value === '') {
        return Promise.resolve(true)
      }
      setTimeout(async () => {
        if (ShipmentNo.value === value) {
          $q.loadingBar.start()
          const Auth = getAuth()
          const Token = await getIdToken(Auth.currentUser)
          return InnerServerRequest.get('/shipment/get', {
            params: {
              ShipmentNo: ShipmentNo.value
            },
            headers: {
              'xx-csrf-token': Token
            }
          }).then(({ data }) => {
            $q.loadingBar.stop()
            Data.value = data.Data
            return InnerServerRequest.post('/shipment/update', {
              ShipmentNo: ShipmentNo.value,
              UpdateData: {
                Operator: User.Name
              }
            }, {
              headers: {
                'xx-csrf-token': Token
              }
            })
          }).catch((error) => {
            console.log(error)
            Data.value = {
              Message: ErrorCode[(error.code || error.Code)] || error.Message
            }
            $q.loadingBar.stop()
            $q.notify({
              type: 'negative',
              message: '錯誤',
              caption: ErrorCode[(error.code || error.Code)] || error.Message
            })
          })
        }
      }, 600)
      return Promise.resolve(true)
    }

    watch(ShipmentNo, (value) => {
      if (Mode.value === 'Scan') {
        Execute(value)
      }
    })

    return {
      Mode,
      SwitchMode,
      Account,
      UserName,
      ShipmentNo,
      Data,
      Execute
    }
  }
}
</script>

<style scoped>

</style>
