import { Notify } from 'quasar'
import './styles/quasar.scss'
import iconSet from 'quasar/icon-set/fontawesome-v5.js'
import lang from 'quasar/lang/zh-TW.js'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'

// To be used on app.use(Quasar, { ... })
export default {
  config: {
    notify: {
      position: 'top'
    }
  },
  plugins: {
    Notify
  },
  lang: lang,
  iconSet: iconSet
}
