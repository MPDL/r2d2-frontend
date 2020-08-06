import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        preloadActive: false,
        loggedIn: false,
        userToken: null
    },
    actions: {
        setPreloadActiveState(context, yes) {
            this.state.preloadActive = yes
        },
        setLoginState(context, yes = false) {
            this.state.loggedIn = yes
        },
        setUserToken(context, token) {
            this.state.userToken = _.isString(token) ? token : null
        }
    }
})

export default store
