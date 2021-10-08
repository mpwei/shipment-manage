import { createApp } from 'vue'
import App from './App.vue'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import Router from './router'
import { auth } from './plugins/firebase'

createApp(App).use(Router).use(Quasar, quasarUserOptions).mount('#app')

auth.onAuthStateChanged((user) => {
    console.log(user)
})
