import axios from 'axios'

function Datasource() {
    //

    // -----------------------------------
    // -----------------------------------

    // const srv = 'http://localhost:8081/'
    const srv = 'https://127.0.0.1:3000/'

    const config = {
        root: window.baseConfig.root === '{ENV}' ? '' : window.baseConfig.root,

        structureApi: '/heidi/structure.en.json',
        translatinosApi: '/heidi/translations.en.json',

        structure: null,
        sessionTimeoutMsec: 10000,
        translations: {},
        searches: {}
    }

    const getConfig = () => config

    this.getSearches = () => config.searches

    const getStructureApi = () => `${config.root}${config.structureApi}`
    const getTranslationsApi = () => `${config.root}${config.translatinosApi}`

    const post = async (api, data = {}, options = {}) => {
        data.token = globals.getAdminToken()
        return axios.create().post(api, data, options)
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

    const updateSearches = searches => {
        _.each(searches, (search, key) => {
            search.key = key
            search.label = _.isString(search.label) ? search.label : key
            search.description = _.isString(search.description) ? search.description : key

            _.each(search.form, (item, itemKey) => {
                item.key = `${key}--${itemKey}`
                item.description = _.isString(item.description) ? item.description : null
                item.label = _.isString(item.label) ? item.label : itemKey
            })
        })

        config.searches = { ...config.searches, ...searches }
    }

    const getStructure = () => {
        if (config.structure) {
            return config.structure
        }
        return post(getStructureApi())
            .then(res => {
                config.structure = generateStructure(res.data)
                updateSearches(res.data.searches)
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
