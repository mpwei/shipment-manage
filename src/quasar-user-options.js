import { Notify, LoadingBar } from 'quasar'
import './styles/quasar.scss'
import iconSet from 'quasar/icon-set/fontawesome-v5.js'
import lang from 'quasar/lang/zh-TW.js'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'

export default {
  config: {
    notify: {
      position: 'top'
    },
    loadingBar: {
      color: 'warning'
    }
  },
  plugins: {
    Notify,
    LoadingBar
  },
  lang: lang,
  iconSet: iconSet
}
