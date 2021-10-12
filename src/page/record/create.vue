<template>
  <main class="q-py-lg">
    <div class="container-xs">
      <audio :src="NotifyAudio[CurrentAudioType]" hidden controls="controls" ref="NotifyAudioComponent" />
      <div class="row">
        <div class="col-12">
          <div class="q-mb-md">
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
                @update:model-value="SwitchMode()"
            />
            <div class="q-gutter-y-md column" style="max-width: 400px">
              <q-input stack-label v-model="Account" label="員工帳號" readonly />
              <q-input stack-label v-model="UserName" label="員工名稱" readonly />
              <q-input stack-label v-model="ShipmentNo" label="揀貨單號" placeholder="輸入揀貨單號或掃描揀貨單上條碼" clearable />
            </div>
          </div>
        </div>
        <div class="col-12">
          <video id="myVideo" class="video-js vjs-default-skin" playsinline />
          <div class=" q-mt-md">
            <q-btn unelevated color="light-green-8" class="q-mb-sm q-mr-sm" label="開啟鏡頭" @click="OpenCamera()" />
            <q-btn unelevated color="light-green-8" class="q-mb-sm q-mr-sm" label="關閉鏡頭" @click="CloseCamera()" />
            <q-btn unelevated color="light-green-8" class="q-mb-sm q-mr-sm" label="開始錄影" @click="StartRecord()" :disable="!EnableRecord" />
            <q-btn unelevated color="light-green-8" class="q-mb-sm" label="停止錄影" @click="EndRecord()" :disable="!EnableRecord" />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import dayjs from 'dayjs'
import 'video.js/dist/video-js.css'
import 'videojs-record/dist/css/videojs.record.css'
import videojs from 'video.js'
import 'webrtc-adapter'
import RecordRTC from 'recordrtc'
import 'videojs-record/dist/videojs.record.js'
import { InnerServerRequest } from '../../plugins/request'
import ErrorCode from "../../locales/error";

export default {
  name: 'VideoRecord',
  setup () {
    const User = JSON.parse(localStorage.getItem('User'))
    const Account = ref(User.Account)
    const UserName = ref(User.Name)
    const $q = useQuasar()
    const NotifyAudioComponent = ref(null)
    const Mode = ref('Scan')
    const Keying = ref(false)
    const TempTerminalData = ref('')
    const EnableExecute = ref(false)
    const ShipmentNo = ref('')
    const TerminalData = ref('')
    const player = ref('')
    const EnableRecord = ref(false)
    const CurrentAudioType = ref('Start')
    const options = {
      controls: true,
      autoplay: false,
      fluid: false,
      loop: false,
      width: 320,
      height: 320,
      bigPlayButton: false,
      controlBar: {
        volumePanel: false
      },
      plugins: {
        record: {
          audio: false,
          video: true,
          debug: true,
          autoMuteDevice: false,
          maxLength: 300,
          displayMilliseconds: false
        }
      }
    }

    const OpenCamera = () => {
      player.value.record().getDevice()
      EnableRecord.value = true
      CurrentAudioType.value = 'Open'
      return nextTick(() => {
        NotifyAudioComponent.value.currentTime = 0
        NotifyAudioComponent.value.play()
      })
    }

    const CloseCamera = () => {
      player.value.record().stopDevice()
      EnableRecord.value = false
    }

    const StartRecord = () => {
      if (EnableRecord.value === false) {
        CurrentAudioType.value = 'Error'
        return nextTick(() => {
          $q.notify({
            type: 'negative',
            message: '錯誤',
            caption: '請開啟鏡頭'
          })
          NotifyAudioComponent.value.currentTime = 0
          NotifyAudioComponent.value.play()
          return false
        })
      }
      if (ShipmentNo.value === '') {
        CurrentAudioType.value = 'Error'
        return nextTick(() => {
          $q.notify({
            type: 'warning',
            message: '警告',
            caption: '請輸入揀貨單號後以繼續錄影'
          })
          NotifyAudioComponent.value.currentTime = 0
          NotifyAudioComponent.value.play()
          return false
        })
      }
      CurrentAudioType.value = 'Start'
      player.value.record().start()
      return nextTick(() => {
        NotifyAudioComponent.value.currentTime = 0
        NotifyAudioComponent.value.play()
      })
    }

    const EndRecord = () => {
      CurrentAudioType.value = 'End'
      player.value.record().stop()
      return nextTick(() => {
        NotifyAudioComponent.value.currentTime = 0
        NotifyAudioComponent.value.play()
      })
    }

    const FunctionRelate = {
      'o': OpenCamera,
      'c': CloseCamera,
      's': StartRecord,
      'e': EndRecord
    }

    const TempInput = ref('')
    const KeyIn = (event) => {
      switch (event.key) {
        case 'Shift':
          break
        case '!':
          EnableExecute.value = true
          break
        case 'Enter':
          if (EnableExecute.value === true) {
            EnableExecute.value = false
          } else {
            ShipmentNo.value = TempInput.value
            TempInput.value = ''
          }
          break
        case 'o':
        case 'c':
        case 's':
        case 'e':
          if (EnableExecute.value === true) {
            FunctionRelate[event.key]()
          } else {
            TempInput.value += event.key
          }
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

      player.value = videojs('#myVideo', options, () => {
        // print version information at startup
        const msg = 'Using video.js ' + videojs.VERSION +
            ' with videojs-record ' + videojs.getPluginVersion('record') +
            ' and recordrtc ' + RecordRTC.version
        videojs.log(msg)
        // player.value.record().getDevice()
      })

      // device is ready
      player.value.on('deviceReady', () => {
        console.log('device is ready!')
      })

      // user clicked the record button and started recording
      player.value.on('startRecord', () => {
        console.log('started recording!')
      })

      // user completed recording and stream is available
      player.value.on('finishRecord', () => {
        // the blob object contains the recorded data that
        // can be downloaded by the user, stored on server etc.
        console.log('finished recording:')
        console.log(player.value.recordedData)
        // player.value.record().saveAs({'video': 'my-video-file-name.webm'})

        const data = new FormData()
        // data.append('name', 'A0001-0001.mp4')
        data.append('name', `${ShipmentNo.value}-${Account.value}-${dayjs().format('YYYYMMDDHHmmss')}.mp4`)
        data.append('file', player.value.recordedData)

        $q.loadingBar.start()
        InnerServerRequest.post('/upload/local', data, {
          header : {
            'Content-Type' : 'multipart/form-data'
          }
        }).then(response => {
          $q.loadingBar.stop()
          console.log('response', response)
          ShipmentNo.value = ''
          $q.notify({
            type: 'positive',
            color: 'green-7',
            textColor: 'white',
            message: '成功',
            caption: '已成功存至硬碟'
          })
        }).catch(error => {
          $q.loadingBar.stop()
          console.log('error', error)
          $q.notify({
            type: 'negative',
            message: '錯誤',
            caption: error.Message || ErrorCode[error.code]
          })
        })
      })

      // error handling
      player.value.on('error', (element, error) => {
        console.warn(error)
      })

      player.value.on('deviceError', () => {
        console.error('device error:', player.value.deviceErrorCode)
      })

    })

    onBeforeUnmount(() => {
      if (player.value) {
        player.value.dispose()
      }
    })

    return {
      Mode,
      NotifyAudioComponent,
      ShipmentNo,
      Account,
      UserName,
      player,
      CurrentAudioType,
      EnableRecord,
      NotifyAudio: {
        // Open: 'https://firebasestorage.googleapis.com/v0/b/mpwei-logistics-system.appspot.com/o/end2.wav?alt=media&token=a0fa5ca8-6f2d-47dc-852d-2e6df2252ade',
        // Start: 'https://firebasestorage.googleapis.com/v0/b/mpwei-logistics-system.appspot.com/o/start.wav?alt=media&token=4c51d35a-bae9-4156-ae1f-69a896dea756',
        // End: 'https://firebasestorage.googleapis.com/v0/b/mpwei-logistics-system.appspot.com/o/end2.wav?alt=media&token=a0fa5ca8-6f2d-47dc-852d-2e6df2252ade',
        // Error: 'https://firebasestorage.googleapis.com/v0/b/mpwei-logistics-system.appspot.com/o/error.wav?alt=media&token=12f9190d-7137-464a-86ca-cc71efbbefc7',
        Open: '../audio/end2.wav',
        Start: '../audio/start.wav',
        End: '../audio/end.wav',
        Error: '../audio/error.wav'
      },
      SwitchMode,
      OpenCamera,
      CloseCamera,
      StartRecord,
      EndRecord,
      Execute (value) {
        Keying.value = true
        TempTerminalData.value = value
        setTimeout(() => {
          TerminalData.value = ''
          if (TempTerminalData.value === value) {
            value = value.replace(/\n/g, '')
            if (value === '@enop_abcemw' || value === '@open_webcam') {
              OpenCamera()
              return true
            }
            if (value === '@celos_abcemw' || value === '@close_webcam') {
              CloseCamera()
              return true
            }
            if (value === '@ars_cdeo' || value === '@start_record') {
              StartRecord()
              return true
            }
            if (value === '@den_cdeo' || value === '@end_record') {
              EndRecord()
              return true
            }
            ShipmentNo.value = value
          }
        }, 1000)
      }
    }
  }
}
</script>

<style scoped>

</style>

<style>
#myVideo {
  background-color: var(--q-dark-page);
  width: 100%;
}
</style>
