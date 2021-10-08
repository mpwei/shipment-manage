<template>
  <main>
    <video id="myVideo" class="video-js vjs-default-skin" playsinline />
    <div>
      <q-btn unelevated color="light-green-8" class="q-mb-sm block" label="錄影" @click="player.record().start()" />
      <q-btn unelevated color="light-green-8" class="q-mb-sm block" label="停止錄影" @click="player.record().stop()" />
    </div>
    <div class="q-pa-md">
      <div class="q-gutter-y-md column" style="max-width: 400px">
        <q-input stack-label v-model="ShipmentID" label="揀貨單號" placeholder="輸入揀貨單號" hint="請輸入揀貨單號或掃描揀貨單上條碼" />
        <q-field label="開始錄影" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline q-mt-md" tabindex="0">
              <img alt="Vue logo" src="../assets/start.svg">
            </div>
          </template>
        </q-field>
        <q-field label="停止錄影" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline q-mt-md" tabindex="0">
              <img alt="Vue logo" src="../assets/end.svg">
            </div>
          </template>
        </q-field>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import 'video.js/dist/video-js.css'
import 'videojs-record/dist/css/videojs.record.css'
import videojs from 'video.js'

import 'webrtc-adapter'
import RecordRTC from 'recordrtc'

import 'videojs-record/dist/videojs.record.js'

export default {
  name: 'VideoRecord',
  setup () {
    const ShipmentID = ref('')
    const player = ref('')
    const options = {
      controls: true,
      autoplay: false,
      fluid: false,
      loop: false,
      width: 320,
      height: 240,
      bigPlayButton: false,
      controlBar: {
        volumePanel: false
      },
      plugins: {
        // configure videojs-record plugin
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

    onMounted(() => {
      player.value = videojs('#myVideo', options, () => {
        // print version information at startup
        var msg = 'Using video.js ' + videojs.VERSION +
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
        console.log('finished recording: ', player.value.recordedData)
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
      ShipmentID,
      player
    }
  }
}
</script>

<style scoped>

</style>

<style>
/* change player background color */
#myVideo {
  background-color: #95DDF5;
}
</style>
