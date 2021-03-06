import Vue from 'vue'
import R2D2DataHandler from '@/js/R2D2DataHandler'


function Globals() {
    console.log('GLB: window.BASE_CONFIG = ', window.BASE_CONFIG)

    const DEV_MODE = window.BASE_CONFIG && window.BASE_CONFIG.devmode === true
    this.DEV_MODE = DEV_MODE

    //
    let router = null

    const registerRouter = $router => {
        router = $router
    }
    this.registerRouter = registerRouter
    this.getRouter = () => router

    let i18n = null

    const registerI18n = $i18n => {
        i18n = $i18n
    }
    this.registerI18n = registerI18n
    this.getLocale = () => i18n.locale
    this.getI18n = () => i18n

    //
    const eventBus = new Vue()
    this.eventBus = eventBus

    //
    const r2 = new R2D2DataHandler()
    this.getDataHandler = () => r2

    // route handling

    const getCurrentRouterPath = () => {
        if (router) {
            return {
                raw: router.history.current.path,
                keys: router.history.current.path.split('/').filter(el => el.length > 0)
            }
        }
        return { raw: null, keys: [] }
    }
    this.getCurrentRouterPath = getCurrentRouterPath

    // constants definitions
    //
    // set the corresponding css values in App.vue and/or in the theming!
    this.CONTENT_TRANSITION_FADE_OUT_MSEC = 100
    this.CONTENT_TRANSITION_FADE_IN_MSEC = 400

    this.MODAL_FULLSCREEN = 'modal-fullscreen'

    const CP = {
        DEFAULT: 'default'
    }

    // ++++++++++++++++++++++++++++++++++++++++
    // +++++  helpaz you will love :-)
    // ++++++++++++++++++++++++++++++++++++++++

    const getAttrFromCssContent = selector => {
        let str = $(selector).css('content')
        let data = {}
        if (typeof str === 'string' && str.substring(1, 2) === '{') {
            str = str.replace(/'/g, '"').slice(1, -1)
            str = str.split('\\').join('')
            data = JSON.parse(str)
        } else {
            console.warn('Something goes wrong in getAttrFromCssContent, selector & result is : ', selector, str)
        }
        return data
    }

    const parseSvgAttributes = attr => {
        var res = {}
        for (var i in (attr = attr.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*,?)+\))+/g))) {
            var c = attr[i].match(/[\w\.\-]+/g)
            res[c.shift()] = c
        }
        return res
    }
    this.parseSvgAttributes = parseSvgAttributes

    const filterObjectByKeys = (obj = {}, keys) => {
        keys = _.isString(keys) ? keys.split(',') : keys
        keys = _.isArray(keys) ? keys : []
        const res = {}
        _.each(keys, key => (res[key] = obj[key]))
        return res
    }
    this.filterObjectByKeys = filterObjectByKeys

    // ++++++++++++++++++++++++++++++++++++++++
    // +++++ CMS handling
    // ++++++++++++++++++++++++++++++++++++++++

    let isCmsEditorActive = false
    let adminToken = null
    let adminTouched = false // TEST ON

    this.isCmsActive = () => isCmsEditorActive || false

    this.cmsWrap = str => `<p>${str}</p>`

    this.getAdminToken = () => {
        // console.log('GLB:getAdminToken adminToken = ', adminToken)
        return adminToken || null
        // return 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0dXNlckBtcGRsLm1wZy5kZSIsInVzZXJfaWQiOiIyZDBkZDg1MC1lYWJiLTQzZmUtOGI4Zi0xYTFiNTQwMTg3MzgiLCJleHAiOjE1OTEyNTY3NjZ9._xWPbAMgMB8FZgf-FjWd8aM0UrCZ1CG0J-rIU7vJ49Q5_q8Wzxu1hv_9rwZil2aHeEWgeZSUNEQ6H8WoMIuFCQ'
    }

    this.setAdminToken = (token = null) => {
        adminToken = token
        console.log('GLB:setAdminToken token = ', token)
        // if (adminToken) {
        //     loadCms()
        // }
    }

    const onCmsEvent = (key, data = null) => {
        // console.log('GLB:onCmsEvent key, data = ', key, data)
        // switch (key) {
        //     case 'editor-started':
        //         isCmsEditorActive = true
        //         break
        //     case 'editor-stopped':
        //         isCmsEditorActive = false
        //         break
        // }
        // eventBus.$emit('cmsEvent', {
        //     key,
        //     data
        // })
    }
    this.onCmsEvent = onCmsEvent

    const touchedAdmin = () => {
        if (!adminToken) {
            // eventBus.$emit('requestAuthentication')
        }
        adminTouched = true
    }
    this.touchedAdmin = touchedAdmin

    const defaultPageReady = () => {
        // datasource.loadAdminSession(true)
        if (adminTouched) {
            // eventBus.$emit('requestAuthentication')
        }
        if (DEV_MODE) {
            // const auth = () => eventBus.$emit('requestAuthentication')
            // document.onkeydown = e => {
            //     if (e.key.toLocaleUpperCase() === 'A') {
            //         document.addEventListener('mouseup', auth)
            //     }
            // }
            // document.onkeyup = () => document.removeEventListener('mouseup', auth)
        }
    }
    this.defaultPageReady = defaultPageReady

    const loadCms = () => {
        const cTools = [...datasource.getConfig().cTools]
        let scr = document.createElement('script')
        scr.setAttribute('src', cTools.pop())
        document.head.appendChild(scr)
        scr.onload = () => {
            const scr = document.createElement('script')
            scr.setAttribute('src', cTools.pop())
            document.head.appendChild(scr)
        }
    }

    // +++++++++++++ INIT

    const init = () => {
        // datasource.loadAdminSession(true)
    }
    this.init = init

    // ++++++++++++++++++++++++++++++++++++++++

    let uidCnt = 0
    const getUid = () => `uid-${++uidCnt}`

    this.getUid = getUid
    this.getAttrFromCssContent = getAttrFromCssContent
}
export default Globals
