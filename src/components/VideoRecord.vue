<template>
  <video id="myVideo" class="video-js vjs-default-skin" playsinline />
 <div>
   <q-btn unelevated color="light-green-8" class="q-mb-sm block" label="錄影" @click="player.record().start()" />
   <q-btn unelevated color="light-green-8" class="q-mb-sm block" label="停止錄影" @click="player.record().stop()" />
 </div>
  <div>
    {{ currentDevice }}
  </div>
</template>

<script>
/* eslint-disable */
import 'video.js/dist/video-js.css'
import 'videojs-record/dist/css/videojs.record.css'
import videojs from 'video.js'

import 'webrtc-adapter'
import RecordRTC from 'recordrtc'

import 'videojs-record/dist/videojs.record.js'

export default {
  data() {
    return {
      player: '',
      options: {
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
      },
      currentDevice: []
    }
  },
  mounted() {
    /* eslint-disable no-console */
    this.player = videojs('#myVideo', this.options, () => {
      // print version information at startup
      var msg = 'Using video.js ' + videojs.VERSION +
          ' with videojs-record ' + videojs.getPluginVersion('record') +
          ' and recordrtc ' + RecordRTC.version
      videojs.log(msg)
      // this.player.record().getDevice()
    })

    // device is ready
    this.player.on('deviceReady', () => {
      console.log('device is ready!')
    })

    // user clicked the record button and started recording
    this.player.on('startRecord', () => {
      console.log('started recording!')
    })

    // user completed recording and stream is available
    this.player.on('finishRecord', () => {
      // the blob object contains the recorded data that
      // can be downloaded by the user, stored on server etc.
      console.log('finished recording: ', this.player.recordedData)
    })

    // error handling
    this.player.on('error', (element, error) => {
      console.warn(error)
    })

    this.player.on('deviceError', () => {
      console.error('device error:', this.player.deviceErrorCode)
    })
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose()
    }
  }
}
</script>
