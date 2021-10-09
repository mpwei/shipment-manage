import { createStore } from 'vuex'

export default createStore({
  state: {
    User: {
      _v: 0
    },
    UserData: {
      _v: 0
    }
  },
  getters: {
    LoginStatus (state) {
      return !!state.User.uid
    }
  },
  mutations: {
    SetAuth(state, value) {
      state.User = Object.assign(state.User, value)
    }
  },
  actions: {
    CheckAuth({ commit }, user) {
      return new Promise((resolve, reject) => {
        if (user === null) {
          commit('SetAuth', null)
          reject({
            message: 'Login/Unauthorized'
          })
        } else {
          commit('SetAuth', user)
          resolve({
            message: 'Login/Success'
          })
        }
      })
    }
  }
})
