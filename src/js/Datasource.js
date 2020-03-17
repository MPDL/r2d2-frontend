import axios from 'axios'

function Datasource() {
    //

    // -----------------------------------
    // -----------------------------------

    // const srv = 'http://localhost:8081/'
    const srv = 'https://127.0.0.1:3000/'

    const config = {
        root: window.baseConfig.root === '{ENV}' ? '' : window.baseConfig.root,
        apiBase: window.baseConfig.apiBase,
        structureApi: '/heidi/structure.en.json',
        translatinosApi: '/heidi/translations.en.json',
        defaultApi: 'get',
        devPaths: {
            get: '/heidi/requests/get.json',
            'get-second': '/heidi/requests/get-second.json'
        },
        structure: null,
        sessionTimeoutMsec: 10000,
        translations: {},
        requests: {},
        results: []
    }

    const updateConfig = data => {
        config.defaultApi = _.isPlainObject(data.defaultApi) ? data.defaultApi : config.defaultApi
    }

    const getFilteredConfig = () => {
        const keys = 'root,apiBase,structureApi,translatinosApi,defaultApi'.split(',')
        const res = {}
        _.each(keys, key => (res[key] = config[key]))
        return res
    }

    const getConfig = () => config

    this.getRequests = () => config.requests
    this.getResults = () => config.results

    const getStructureApi = () => `${config.root}${config.structureApi}`
    const getTranslationsApi = () => `${config.root}${config.translatinosApi}`

    const post = async (api, data = {}, options = {}) => {
        // data.token = globals.getAdminToken()
        console.log('DS:post api, data = ', api, data)
        return axios.create().post(api, data, options)
    }

    const getApi = api => {
        console.log('DS:getApi api, config.devPaths = ', api, config.devPaths)
        return globals.DEV_MODE ? config.devPaths[api] : api
    }

    this.request = async (key = null, api = null, rawData = {}) => {
        api = _.isString(api) ? getApi(api) : config.defaultApi
        console.log('DS:send key, api, rawData = ', key, api, rawData)
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
                    console.log('DS:send res = ', res)
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

    const updateRequests = requests => {
        const ordered = []
        _.each(requests, (request, key) => {
            request.key = key
            request.label = _.isString(request.label) ? request.label : key
            request.api = request.api && _.isString(request.api.target) ? request.api : { target: 'get' }
            console.log('DS:updateRequests key, request.api = ', key, request.api)
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

    const updateResults = (data, key, api) => {
        console.log('DS:updateResults data, key, api = ', data, key, api)
        console.log('DS:updateResults config.results BF = ', config.results)

        config.results.unshift({
            data,
            key,
            api
        })
        console.log('DS:updateResults config.results = ', config.results)
    }

    const removeRequestByKey = key => {
        delete config.requests[key]
        console.log('DS:removeRequestByKey key, config.requests = ', config.requests)
    }
    this.removeRequestByKey = removeRequestByKey

    const getStructure = () => {
        if (config.structure) {
            return config.structure
        }
        return post(getStructureApi())
            .then(res => {
                updateConfig(res.data)
                config.structure = generateStructure(res.data)
                updateRequests(res.data.requests)
                updateResults(getFilteredConfig(), 'config', null)
                globals.eventBus.$emit('onLoadResults', { error: null })
                return config.structure
            })
            .catch(error => console.log('DS:getStructure ERROR error.message = ', error.message))
    }
    this.getStructure = getStructure

    const getTranslations = () => {
        return post(getTranslationsApi())
            .then(res => {
                config.translations = res.data // TODO merge
                return res.data
            })
            .catch(error => console.log('DS:getTranslations ERROR error.message = ', error.message))
    }

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

        console.log('DS:generateStructure routes = ', routes)

        return {
            navigation,
            router: {
                root: raw.router,
                routes
            },
            setup: raw.setup
        }
    }

    // publix

    this.getConfig = getConfig
    this.getTranslations = getTranslations
    this.getInitialData = () => getInitialData()
}

export default Datasource
