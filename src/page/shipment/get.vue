<template>
  <main class="q-py-lg">
    <div class="container-xs">
      <q-input stack-label v-model="Account" label="員工帳號" readonly />
      <q-input stack-label v-model="UserName" label="員工名稱" readonly />
      <q-input ref="ShipmentNoInput" stack-label v-model="ShipmentNo" label="揀貨單號" placeholder="輸入揀貨單號或掃描揀貨單上條碼" @blur="ShipmentNoInput.focus()" :autofocus="true" clearable @update:model-value="Execute" />
      <q-card v-if="Object.keys(Data).length > 0" class="q-mt-lg">
        <q-card-section>
          <p class="text-center"><b class="q-mr-sm">揀貨單號</b> {{ Data.ShipmentNo }}</p>
          <h4 class="text-h2 text-weight-bold text-red-10 text-center q-my-none">{{ Data.Location || Data.Message }}</h4>
        </q-card-section>
      </q-card>
    </div>
  </main>
</template>

<script>
import { onMounted, ref } from 'vue'
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
    const Mode = ref('Keyboard')
    const ShipmentNo = ref('')
    const ShipmentNoInput = ref(null)
    const Data = ref({})

    onMounted(() => {})

    const PlayVoiceMessage = (msg) => {
      const VoiceMessage = new SpeechSynthesisUtterance()
      VoiceMessage.text = msg
      VoiceMessage.lang = 'zh'
      VoiceMessage.volume = 50
      VoiceMessage.rate = 0.7
      VoiceMessage.pitch = 1.5
      speechSynthesis.speak(VoiceMessage)
    }

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
              ShipmentNo: value
            },
            headers: {
              'xx-csrf-token': Token
            }
          }).then(({ data }) => {
            $q.loadingBar.stop()
            Data.value = data.Data
            PlayVoiceMessage(Data.value.Location)
            ShipmentNo.value = ''
            return InnerServerRequest.post('/shipment/update', {
              ShipmentNo: value,
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
            PlayVoiceMessage(ErrorCode[(error.code || error.Code)] || ErrorCode['SH-005'])
            ShipmentNo.value = ''
            $q.loadingBar.stop()
            $q.notify({
              type: 'negative',
              message: '錯誤',
              caption: ErrorCode[(error.code || error.Code)] || error.Message
            })
          })
        }
      }, 250)
      return Promise.resolve(true)
    }

    return {
      Mode,
      Account,
      UserName,
      ShipmentNo,
      ShipmentNoInput,
      Data,
      Execute
    }
  }
}
</script>

<style scoped>

</style>
