import axios from 'axios'

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
    initial.defaultApi = _.isString(initial.defaultApi) ? initial.defaultApi : 'get'

    const config = {
        subpath: location.pathname,
        origin: location.origin,
        structureApi: initial.structure,
        translatinosApi: initial.translations,
        defaultApi: initial.defaultApi,
        devPaths: window.BASE_CONFIG ? window.BASE_CONFIG.paths : {},
        structure: null,
        sessionTimeoutMsec: 10000,
        translations: {},
        requests: {},
        results: {}
    }

    const updateConfig = data => {
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
        data.token = globals.getAdminToken()
        return axios.create().post(getPath(api), data, options)
    }

    const getApi = api => {
        return globals.DEV_MODE && config.devPaths[api] ? config.devPaths[api] : api
    }

    this.request = async (key = null, api = null, rawData = {}) => {
        api = _.isString(api) ? getApi(api) : config.defaultApi
        if (key) {
            const data = {}
            _.each(rawData, (item, key) => {
                data[key.split('--')[1]] = item
            })
            return post(api, {
                key,
                data
            })
                .then(res => {
                    updateRequests(res.data.requests)
                    updateResults(res.data, key, api)
                    globals.eventBus.$emit('onLoadResults', { error: null })
                })
                .catch(error => {
                    globals.eventBus.$emit('onLoadResults', { error })
                    console.log('DS:getTranslations ERROR error.message = ', error.message)
                })
        } else {
            return null
        }
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
            request.api = request.api && _.isString(request.api.target) ? request.api : { target: '/get' }
            request.description = _.isString(request.description) ? request.description : key

            _.each(request.form, (item, itemKey) => {
                item.key = `${key}--${itemKey}`
                item.description = _.isString(item.description) ? item.description : null
                item.label = _.isString(item.label) ? item.label : itemKey
            })
            ordered.push(request)
        })
        _.each(config.requests, request => ordered.push(request))
        config.requests = {}
        _.each(ordered, request => (config.requests[request.key] = request))
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
    }

    const removeResultByTs = ts => {
        delete config.results[ts]
    }
    this.removeResultByTs = removeResultByTs

    const getStructure = () => {
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
