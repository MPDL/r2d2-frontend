import axios from 'axios'
import { _isString } from 'gsap/gsap-core'

function Datasource() {
    //

    // -----------------------------------
    // -----------------------------------

    const getPath = path => {
        if (path.substr(0, 1) === '/') {
            // this resolves a relative path on the own server
            path = path.substr(1)
            return `${window.location.pathname}${path}`
        }
        // this resolves a absolute path from a remote api
        return path
    }

    const initial = window.BASE_CONFIG ? window.BASE_CONFIG.initial : {}
    initial.structure = _.isString(initial.structure) ? initial.structure : '/config/structure.en.json'
    initial.translations = _.isString(initial.translations) ? initial.translations : '/config/translations.en.json'
    initial.defaultApi = _.isString(initial.defaultApi) ? initial.defaultApi : '/get'
    initial.defaultApi = _.isPlainObject(initial.defaultApi)
        ? initial.defaultApi
        : { target: initial.defaultApi, method: 'post' }

    console.log('DS:INIT window.BASE_CONFIG = ', window.BASE_CONFIG)

    const getDevApis = () => {
        const apis = {}
        const dp = _.isPlainObject(window.BASE_CONFIG.devApis) ? window.BASE_CONFIG.devApis : {}
        _.each(dp, (value, key) => {
            value = _.isString(value)
                ? {
                      target: value,
                      method: 'post'
                  }
                : value

            apis[key] = value

            console.log('DS:getDevApis value, key = ', value, key)
        })
        console.log('DS:getDevApis apis = ', apis)

        return apis
    }
    getDevApis()

    const config = {
        subpath: location.pathname,
        origin: location.origin,
        structureApi: initial.structure,
        translatinosApi: initial.translations,
        defaultApi: initial.defaultApi,
        devApis: window.BASE_CONFIG ? window.BASE_CONFIG.devApis : {},
        structure: null,
        sessionTimeoutMsec: 10000,
        translations: {},
        requests: {},
        results: {},
        setup: {}
    }

    const updateConfig = data => {
        console.log('DS:updateConfig config = ', { ...config })
        console.log('DS:updateConfig data = ', data)
        config.defaultApi = _.isPlainObject(data.defaultApi) ? data.defaultApi : config.defaultApi
    }

    const getFilteredConfig = () => {
        return globals.filterObjectByKeys(config, 'origin,subpath,structureApi,translatinosApi,defaultApi')
    }

    const getConfig = () => config
    this.getConfig = getConfig

    this.getRequests = () => config.requests
    this.getResults = () => config.results

    const getStructureApi = () => config.structureApi
    const getTranslationsApi = () => config.translatinosApi

    const post = async (api, data = {}, options = {}) => {
        return axios.create().post(getPath(api), data, options)
    }

    const get = async (api, dta = {}, options = {}) => {
        let data = {}
        const target = [getPath(api)]
        _.each(dta, (value, key) => {
            _.isString(value[0]) ? target.push(value[0]) : null
            _.isPlainObject(value[0]) ? (data = { ...data, ...value[0] }) : null
        })
        console.log('DS:get target = ', target)
        console.log('DS:get data = ', data)
        return axios.create().get(target.join('/'), options)
    }

    const getApi = api => {
        return globals.DEV_MODE && config.devApis[api.target] ? config.devApis[target] : api
    }

    this.request = async (key = null, api = null, rawData = {}) => {
        api = _.isPlainObject(api) ? getApi(api) : config.defaultApi
        console.log('DS:request key = ', key)
        console.log('DS:request api = ', api)
        console.log('DS:request rawData = ', rawData)
        let data = {}
        _.each(rawData, (item, key) => {
            if (key.split('--')[1]) {
                data[key.split('--')[1]] = item
            } else {
                data[key] = item
            }
        })
        console.log('DS:request data = ', { ...data })
        // schema '{*}' means the plain data object is send,
        // without the standard key-data structure
        // token is set to header (2Do)
        // TODO refactor the schema / schema parser thing
        const schema = _.isString(api.schema) ? api.schema.split(',') : []
        console.log('DS:request schema = ', schema)
        const options = {}

        if (_.includes(schema, 'data:{*}')) {
            if (_.includes(schema, 'header-set:{Authorization}')) {
                options.headers = {
                    Authorization: globals.getAdminToken()
                }
            }
        } else {
            // standard format
            data = { key, data }
            data.token = globals.getAdminToken()
        }

        const methods = {
            get,
            post
        }
        console.log('DS:request data 2 = ', { ...data })
        return methods[api.method](api.target, data, options)
            .then(res => {
                console.log('DS:post res = ', res)
                if (_.includes(schema, 'header-get:{authorization}')) {
                    globals.setAdminToken(res.headers.authorization)
                }
                updateRequests(res.data.requests)
                updateResults(res.data, key, api)
                globals.eventBus.$emit('onLoadResults', { error: null })
            })
            .catch(error => {
                try {
                    updateResults(JSON.stringify(error.response.data), key, api)
                } catch (error) {
                    updateResults(JSON.stringify(error), key, api)
                }
                globals.eventBus.$emit('onLoadResults', { error })
                console.log('DS:getTranslations ERROR error.message = ', error.message)
            })
    }

    const setTranslationFallbacks = (translations, lng, key, i18n) => {
        let strg = _.get(translations, `${lng}.${i18n}`)
        if (!_.isString(strg)) {
            strg = _.get(translations, `${lng}._global.${key}`)
            if (!_.isString(strg)) {
                strg = globals.cmsWrap(key)
            }
            _.set(translations, `${lng}.${i18n}`, strg)
        }
    }

    const addTranslations = trns => {
        _.each(trns, (tr, lng) => {
            _.each(config.structure.navigation, (main, key) => {
                setTranslationFallbacks(trns, lng, key, main.i18nKey)
                _.each(main.sub, (sub, subKey) => {
                    setTranslationFallbacks(trns, lng, subKey, sub.i18nKey)
                })
            })
        })
        config.translations = _.merge(config.translations, trns) // TODO check _.defaultsDeep
    }

    const getInitialData = () => {
        return getStructure().then(strc => {
            return getTranslations().then(trns => {
                addTranslations(trns)
                strc.translations = config.translations
                return strc
            })
        })
    }
    this.getInitialData = () => getInitialData()

    const updateRequests = requests => {
        const ordered = []
        _.each(requests, (request, key) => {
            request.key = key
            request.label = _.isString(request.label) ? request.label : key
            request.api =
                request.api && _.isString(request.api.target) ? request.api : { target: '/get', method: 'post' }
            request.api.method = request.api.method === 'get' ? 'get' : 'post'
            request.description = _.isString(request.description) ? request.description : key
            console.log('DS:updateRequests request.key = ', request.key)
            console.log('DS:updateRequests request.form = ', request.form)
            _.each(request.form, (item, itemKey) => {
                item.key = `${key}--${itemKey}`
                item.description = _.isString(item.description) ? item.description : null
                item.label = _.isString(item.label) ? item.label : itemKey
                if (item.type === 'dropdown') {
                    // selection by value
                    item.selected = _.isNil(item.selected) ? item.options[0] : item.selected
                    // selection by index
                    if (_.isNumber(item.selected) && _.isPlainObject(item.options[item.selected])) {
                        item.selected = item.options[item.selected].value
                    }
                }
                console.log('DS:updateRequests item.selected = ', item.selected)
            })
            ordered.push(request)
        })
        _.each(config.requests, request => ordered.push(request))
        config.requests = {}
        _.each(ordered, request => (config.requests[request.key] = request))

        console.log('DS:updateRequests config.requests = ', config.requests)
    }

    const removeRequestByKey = key => {
        delete config.requests[key]
        console.log('DS:removeRequestByKey key, config.requests = ', config.requests)
    }
    this.removeRequestByKey = removeRequestByKey

    const updateResults = (data, key, api) => {
        const ts = new Date().getTime()
        console.log('updateResults ts.toString() = ', ts.toString())

        config.results[ts.toString()] = {
            ts,
            data,
            key,
            api: api || '-'
        }

        console.log('DS:updateResults config.results = ', config.results)
    }

    const removeResultByTs = ts => {
        delete config.results[ts]
    }
    this.removeResultByTs = removeResultByTs

    const getStructure = () => {
        console.log('DS:getStructure config = ', { ...config })
        if (config.structure) {
            return config.structure
        }
        return post(getStructureApi())
            .then(res => {
                updateConfig(res.data)
                config.structure = generateStructure(res.data)
                updateRequests(res.data.requests)
                setInitialResults()
                return config.structure
            })
            .catch(error => console.log('DS:getStructure ERROR error.message = ', error.message))
    }
    this.getStructure = getStructure

    const setInitialResults = () => {
        updateResults(config.requests, 'initial-loaded', 'initial loaded structure')
        setTimeout(() => {
            updateResults(getFilteredConfig(), 'config', 'config')
            globals.eventBus.$emit('onLoadResults', { error: null })
        }, 100)
    }

    const getTranslations = () => {
        return post(getTranslationsApi())
            .then(res => {
                config.translations = res.data // TODO merge
                return res.data
            })
            .catch(error => console.log('DS:getTranslations ERROR error.message = ', error.message))
    }
    this.getTranslations = getTranslations

    const generateStructure = raw => {
        const navigation = {}
        const routes = []
        _.each(raw.structure, (item, key) => {
            // navigation
            const nav = (navigation[key] = { ...item })
            nav.i18nKey = `nav.${key}.label`
            nav.sub = {}
            // router
            const mainRoute = {
                path: key,
                // name: key,
                // alias: `${key}/*`,
                props: true,
                params: {
                    mainKey: key
                },
                meta: {
                    mainKey: key,
                    subKey: null
                    // i18nKey: `navigation.${key}`
                },
                children: []
            }
            routes.push(mainRoute)

            _.each(item.sub, (item, subKey) => {
                // navigation
                item = _.isPlainObject(item) ? item : {}
                item.i18nKey = item.i18n || `nav.${key}.sub.${subKey}.label`
                navigation[key].sub[subKey] = item
                // router
                mainRoute.children.push({
                    path: subKey,
                    // name: `${key}/${subKey}`,
                    props: true,
                    params: {
                        subKey
                    },
                    meta: {
                        mainKey: key,
                        subKey: subKey,
                        i18nKey: `navigation.${key}`
                    }
                })
            })
        })

        return {
            navigation,
            router: {
                root: raw.router,
                routes
            },
            setup: raw.setup
        }
    }
}

export default Datasource
