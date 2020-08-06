import Globals from '@/js/Globals'
import Datasource from '@/js/Datasource'
window.globals = new Globals()
window.datasource = new Datasource()
window.globals.init()

import Vue from 'vue'
import App from './App.vue'
import getRouter from './js/router'
import store from './js/store'

import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios)

import VueI18n from 'vue-i18n'
Vue.use(VueI18n)

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

Vue.config.productionTip = false

let i18n = null
const startCreateApp = async () => {
    await datasource.getInitialData().then(data => {
        i18n = new VueI18n({
            fallbackLocale: data.setup.fallbackLocale || 'en',
            locale: data.setup.locale || 'en',
            messages: data.translations || {},
            silentTranslationWarn: true
        })
        globals.registerI18n(i18n)
        createApp(data)
    })
}

const createApp = data => {
    const app = new Vue({
        store,
        router: getRouter(data.router),
        i18n,
        render: h => h(App)
    }).$mount('#app')
    globals.registerStore(app.$store)
}
startCreateApp()
