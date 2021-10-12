import { createApp } from 'vue'
import App from './App.vue'
import { Quasar, Notify, LoadingBar } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import Router from './router'
import { auth } from './plugins/firebase'
import Store from './store'

createApp(App).use(Router).use(Store).use(Quasar, quasarUserOptions).mount('#app')

auth.onAuthStateChanged((user) => {
    LoadingBar.start()
    return Store.dispatch('CheckAuth', user).then(() => {
        LoadingBar.stop()
        if (Store.getters.LoginStatus === true) {
            if (Router.currentRoute.value.path === '/login') {
                Router.replace('/').then()
            }
        }
    }).catch((error) => {
        LoadingBar.stop()
        if (error.message === 'Login/Unauthorized' && Router.currentRoute.value.path !== '/login') {
            Router.replace( '/login').then(() => {
                Notify.create({
                    type: 'warning',
                    message: '警告',
                    caption: '憑證已過期，請重新登入'
                })
            })
        }
    })
})
