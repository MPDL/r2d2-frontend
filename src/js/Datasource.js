import axios from 'axios'
// import FileSaver from 'file-saver'

function Datasource() {
    //
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
        })
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
        definitions: {},
        setup: {}
    }

    const updateConfig = data => {
        console.log('DS:updateConfig data = ', data)
        config.setup = { ...config.setup, ...data.setup }
        config.defaultApi = _.isPlainObject(data.defaultApi) ? data.defaultApi : config.defaultApi
        config.setup.apiRoot = _.isString(data.setup.apiRoot) ? data.setup.apiRoot : ''
        config.definitions = data.definitions || {}
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

    const getApi = api => {
        api = globals.DEV_MODE && config.devApis[api.target] ? config.devApis[target] : api
        api.target = api.target.split('{apiRoot}').join(config.setup.apiRoot)
        return api
    }

    const post = async (api, data = {}, options = {}) => {
        return axios.create().post(getPath(api), data, options)
    }

    const get = async (api, dta = {}, options = {}) => {
        return axios.create().get(getPath(api), options)
    }

    const put = async (api, data = {}, options = {}) => {
        return axios.create().put(getPath(api), data, options)
    }

    const METHODS = {
        post,
        get,
        put,
        default: 'post'
    }

    // Evaluate strange responseURL / second request after sending */logout:
    // "http://130.183.216.136/r2d2/login?logout"
    // comes from axios / xhr.js / XMLHttpRequest
    this.request = async (key = null, api = null, data = {}) => {
        api = _.isPlainObject(api) ? { ...getApi(api) } : { ...config.defaultApi }
        const schema = _.isPlainObject(api.schema) ? api.schema : {}
        // TODO extract 'getValueByKey' to global class or someting ...
        const getValueByKey = (key, data, cut = false) => {
            switch (true) {
                case _.isString(data):
                    return data
                case _.isPlainObject(data):
                    const res = _.get(data, key)
                    cut ? _.unset(data, key) : null
                    return res
            }
            return undefined
        }

        // +++++++++++++++++
        // TODO extract header handling to global class or someting ...
        const options = {}
        const fcxSet = {
            'auth.token': () => globals.getUserToken()
        }
        const headerSet = _.get(schema, 'header-set') || {}
        _.each(headerSet, (sourceKey, targetKey) => {
            const value = fcxSet[sourceKey] ? fcxSet[sourceKey]() : getValueByKey(sourceKey, data, true)
            _.set(options, `headers.${targetKey}`, value)
        })

        const params = _.get(schema, 'params') || {}
        _.each(params, (sourceKey, targetKey) => {
            const value = getValueByKey(sourceKey, data, true)
            _.set(options, `params.${targetKey}`, value)
        })
        if (api.responseType) {
            options.responseType = api.responseType
        }

        // +++++++++++++++++
        // TODO extract api-target-parser to global class or someting ...
        let inside = false
        const source = api.target.split('').reverse()
        const parts = [[[], []]]

        while (source.length > 0) {
            const char = source.pop()
            switch (char) {
                case '{':
                case '}':
                    parts[0] = inside ? getValueByKey(parts[0][1].join(''), data, true) : parts[0][0].join('')
                    parts.unshift([[], []])
                    inside = char === '{'
                    break
                default:
                    const tg = inside ? parts[0][1] : parts[0][0]
                    tg.push(char)
            }
            if (source.length === 0) {
                parts[0] = inside ? getValueByKey(parts[0][1].join(''), data, true) : parts[0][0].join('')
                parts.reverse()
                break
            }
        }
        // +++++++++++++++++ finalize data structure for sending
        api.target = parts.join('')
        const directDataKey = _.get(schema, 'data')
        const directDataValue = getValueByKey(directDataKey, data)
        switch (true) {
            case directDataKey === null:
                data = null
                break
            case !_.isUndefined(directDataValue):
                data = directDataValue
                break
            case !_.isUndefined(data.___ROOT):
                data = { ...data.___ROOT }
                break
            case directDataKey === 'ROOT':
                break
            default:
                data = { key, data }
                data.token = globals.getUserToken()
        }

        let downloadFileName = null
        if (_.isString(api.responseType)) {
            downloadFileName = data
        }

        return METHODS[api.method](api.target, data, options)
            .then(res => {
                if (downloadFileName) {
                    return downloadFile(res.data, downloadFileName)
                }
                // TODO make this fully generic
                const fcxGet = {
                    'auth.token': headers => globals.setUserToken(headers.authorization)
                }
                const headerGet = _.get(schema, 'header-get') || {}
                _.each(headerGet, sourceKey => {
                    fcxGet[sourceKey] ? fcxGet[sourceKey](res.headers) : null
                })
                //
                updateRequests(res.data.requests)
                updateResults(res.data, key, api)
                globals.eventBus.$emit('onLoadResults', { error: null, key, result: res })
                return { result: res, key, error: false }
            })
            .catch(error => {
                try {
                    updateResults(JSON.stringify(error.response.data), key, api)
                } catch (error) {
                    updateResults(JSON.stringify(error), key, api)
                }
                globals.eventBus.$emit('onLoadResults', { error, key })
                console.log('DS:getTranslations ERROR error.message = ', error.message)
                // throw new Error({ error, key })
                return { error, key }
            })
    }

    const downloadFile = (data, name) => {
        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', name)
        document.body.appendChild(link)
        link.click()
    }
    this.downloadFile = downloadFile // TEST

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
        _.each(requests, (request, rqKey) => {
            request.key = rqKey
            request.label = _.isString(request.label) ? request.label : rqKey
            request.api =
                request.api && _.isString(request.api.target) ? request.api : { target: '/get', method: 'post' }

            request.api.method = METHODS[request.api.method] ? request.api.method : METHODS.default
            request.description = _.isString(request.description) ? request.description : rqKey
            _.each(request.form, (item, itemKey) => {
                if (item.addToForm === false) {
                    delete request.form[itemKey]
                } else {
                    item.sendKey = _.isString(item.sendKey) ? item.sendKey : itemKey
                    item.key = `${rqKey}--${itemKey}`
                    item.description = _.isString(item.description) ? item.description : null
                    item.label = _.isString(item.label) ? item.label : itemKey
                    if (item.type === 'dropdown') {
                        item = globals.setupDropdownFormCell(item)
                    }
                    if (_.isString(item.schema)) {
                        let schema = item.schema.split('')
                        const start = schema.shift()
                        const end = schema.pop()
                        if (start === '{' && end === '}') {
                            schema = schema.join('')
                            item.schema = _.get(config, schema) || null
                        }
                    } else {
                        item.schema = _.isPlainObject(item.schema) ? item.schema : null
                    }
                }
            })
            ordered.push(request)
        })
        _.each(config.requests, request => ordered.push(request))
        config.requests = {}
        _.each(ordered, request => (config.requests[request.key] = request))
    }

    const removeRequestByKey = key => {
        delete config.requests[key]
    }
    this.removeRequestByKey = removeRequestByKey

    const updateResults = (data, key, api) => {
        const ts = new Date().getTime()
        config.results[ts.toString()] = {
            ts,
            data,
            key,
            api: api || '-'
        }
        const keys = Object.keys(config.results).reverse()
        while (keys.length > config.setup.maxStoreResults) {
            delete config.results[keys.pop()]
        }
        // set the latest result directly into the request
        config.requests[key] ? (config.requests[key].result = data) : null
        return config.results[ts.toString()]
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
                component: _.isString(item.component) ? item.component : null,
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
                    },
                    component: _.isString(item.component) ? item.component : null
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

    const jpgTestData1 =
        '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'

    const jpgTestData =
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxASEBAQEBAQDxAQEBAQEA8QDw8PDw8PFRIWFhUSFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OFxAQFy0dFx0rLSstLSsrLS0rKy0tLS0rLS0rKy0tNy0tLS0tLS03Ny03NzcrNy03LS0tLSs3NystK//AABEIAL8BCAMBIgACEQEDEQH/xAAcAAACAwEBAQEAAAAAAAAAAAAEBQECAwYABwj/xAA3EAABAwMDAgMGBAUFAQAAAAABAAIRAwQhBTFBElEiYXEGEzKBkaFCUmKxFHLB0eEVJDOC8SP/xAAZAQADAQEBAAAAAAAAAAAAAAABAgMABAX/xAAiEQEBAQEAAgMAAgMBAAAAAAAAAQIRAyESMUEyURMiYQT/2gAMAwEAAhEDEQA/AOfLVNMZVy1TSblea7OJe1UDUTUasw1YXmNV3tVmNU1AgzFoVoVmhWDVmZvGFlCIqBZdKzMS1Es09zhJw3v39Ey0bTg6XvEtbt2lRrF20YaRjEdgt3+igRRpM/DPrlEUbtrezRvkQD9Egq3DnHB2W9rXbI6yXRwMp7KEdD/qcjEJdd6gQcYQFxXaXSwFg7EoN9eTv4h32KEyc9bcvLesgR91RmrThwkcA5hDUK1RzNx6QEM6k4nIR43Toe6qDbpntkfThLdQ0wtEtHUPLsooscE0tbotw5uOey3bA1iX6c7b0z2WtRq6C7sGu8bQCD2wUprUCJwT89vkm+XSTPC+V5aPasyEzKleUwphYEKjlpCo9GFqsqrypVXIghqvCoFdGsiF5eXkGPnNUUhlauaq0xlczoXqrMBbVQqtCArMC9UCuwL1QIMyYFeF5gWgCPWZVApo0Z23W4pyiKbQ3YZW6FTcXfuqfu278rmrh5e49uSml00k+ZWZsw1pc4Y/COD5lGXhaTOZjHhaOTytrG5pNP4nfyt/qsbhr6hIOGA4GwKtRDGD/kazyEkqv4EHajcteB4XAfqYktcBpDgMcEbIu5unEQD1Dul1a5xGI5HdHMNbOLV7xwiHH6lYjUntz1EnsdkHWqz8kPUMq0xP1K6pyNXqOIkxHYQnVDWQQA76rjGvIRtF8iUuvHFMbd/Z3wAzlpRNSgyoOphk9jv9Vx2n3B6YJ2TWyvHA7rnueKclgm4s8QQSfkCllWgRK6inUa8DqAnzQl7ZHdsOHluAtNEuXNkKAiLmj0nyKyVJSKqrgtIVXI9BlCqQtCFBRKyVlVWCLPQvKwXlus6RzVWm3KJc1Z025XI6EVGqrWreoFVrVhSxqrVC3Y1VqMQZjTatm0ytKFA9kW2kiHWNvS7q1QLdjMElBXFRAqtCj1PA3jJ9FlrHicKYENaPEi9Od0031DgnDUNfNIt31uXkgeiM+yuV1a9APS3YYxykvvQTuR5qL2pkoULtzjkJb7H/AMQ4S2UK4lQFbpTc4b3WZXulahit0rfIZgMWIm0MGFRwVQ6Ct3ofHlNrJ0OTI4OEio1cptSfKhqLZp7p9eRB3TBlQCN5XOW9bpITgP6xI3/dSsGiL7peNs+Ylc5cU4JT5rXRn5JTf0yXEy0eUhPipaA9SqXLz2qIVCPdS8qlQsyCpVSvSiC3UvKilAHalqyY3KMcxZMZlccdKlRqhrURUYvNYiyjGrajRl09ldjEXTpTEY7oBVGt4haGnGAtjTAf6BWpiJJRKCrCBtJ4lI7kucYK6S8cA2e+AuaujuUGbvqS0NGANh5phqND/YtYd+kkfVKbRpcWj5pz7Qv6KLG9h9jhN+g+UahShxCHa1MNUHjKChd0vovPbwarKAplYyzVKqPortI9UD5Z1AsoRrKZcsLinBWlHWf1jTfmE0s62Eoecoqzqo6z2JZvK6GlDhjdG2LiDBxCSUqkI+lczEnI55XNYt9nlywNaXzLogT3K554M5XQWgFSmWyJ4nZLriweCZb8xlbNT1C6FCu4QVUqhGblUq7lQogzlSFUqwRBKleXlgfRHU8LKmzKPdTVKdLK4nT0O+mpbTRrqK1ZZu/K76FEOgm00RauAdkSPuFsaBG4hZsHS6R9EGb1xO23dDVnmSjanw7QUu96Z2z5okZ3FMmAUpu7fxRwnzpOUpv5BSiz08AO+YWvthUPS0fpQ9uYd8wifaHxNp93B32Tz7B821Azv3QYCYarT6Sl4cF25+i/qV6FK8iKFrTHJWao6otzozXBQrQV5zurhAiut6V0ELnhs+SX7rOtThZ0TmPoiatUEIfpghPCanv0ZWlbujWwk1N0bIxlc4UtZPmnFs4yCCfqm9Nz4wZ9cpDZ1sp9pdYTB2KhT2egFxamScDmOoIR7I5XT3dk0iQ5ue+Ckd3agfiB9E+b1AtUQrlqgp2YuGVKgq0IlQvKYXlmfW/dK9valzgAJJK6+jodIDIn1K3t9Mpsd1NGQozwaG+WBtO0VjBLgHO88geiaCiOy0AUrqz45IjdWgLzTabxkD15XIapprqT/I7Fd6Ut1qiDTJImMqfl8U52GzvjlarJbPdJrjdPHU5b2SqrQgz9yuPS8Dh3SCSk11X6iUy1J2I7pI8QhDIbUIcPOITG7rB7mN4Yx0/VKCYPWeNkG7UoDncZA+X+U0lpaUe0pHVA7pA50I7V6/U/J2S55EYXficntLVXbWVxUQ/UOylr8jCbgTYh8wsCVuXOLXZDQBMRJPzQrmFDMNr/AI8YVjWxAA9eVivBMnGgcSt6EuMeSxYmGkjxO9P6pdXkWxjtkZsbmETGEW+gIJ5SuvVJMDYKcvyW1PgZWzshObGoWuHIK52yenlhXBICnuNKf1bjwnwh2O8JBcVBOAjb1xHzSx6XMTqkqHFeIUJys4WgCqtAiVELysvIM/TsL0L0r0rqRSvKJXpWBKA1d4FF5PZHErmfaa/BHu2n+b+yn5NSQ2M9pdRuAQhbsSPQoZlSFS6LiJBXn2urgO9pdREJVqFGCBsB9ymn8Q0A9Unp4Bgk9kk1C6L3fCGM4zJPqlYq1aoSC1uNi49gufvahc9jBhsgwO3AXRx4X9WHHgrnQ2XPdHwtK6fGXUJ7p0uce5KwlaPWZXZPpGoJULxXmiVitqdORuqOcdijKTICh1AHMJeqzF56AwoW9SiQpp0JTdL8KyammltjJ5/ZQ20aGzEnuVvbNUt67HV4sXN9irmekkcAlJGmSn7h4H/ylc+zdDxfTef+UH0AmNmIcEDb7Iyhk7pdNPo3ugedoQBCbXDgKQg9U7kjY9krKnKnftmQqlaOCo4Jys1cFVhSiVpC8oavIC/RtO6k+SMDly1tdkHKNqariG7o48vr2W4G31/0mBmN1h/rbfyn6pS5r37AlQ+yqAfCUl8mvwZifoy71hzhDfCPuudvXyUYQUBebqOtW/amZIwCo5ys1UekqnAF4MiBvn5oB9Rohrmgg/FIwUyquyO4Wdei14yM9xgrBYTX9pTc3wOd5CZASWtbe7pOdy4gf3XWVbSk1gc4kDqgnseJS3VaDS1reAN+JPKfOrCVxlSxDwXNweUAbUzC6PT3NZU6X/C7wk9jwVnqmn9L+oDErqz5LPVL8ZXPPtSDBU0mAGSJTi7oS0EZIgFBi0dyE832BcSMeseilr+Aibm2DQPuhqDRKP4aWpNElR7tw4R3U1U940HBS9qnIvTy3CtaiQtbV7SexUso9BI43U6tm9SD4XehSFm6c3j4Y7zCRzCp456R899wfSqJjY0weUosz32Kd2lLlvASeT03jOLPINN2zhHz4IQFRsGDhEUXnB2cERqFIOaKzfIPbyHd1LJvLn9K3Kq85QE8QVhehWUgJgeavK7WryDPsj2ovS7PrdnYIapunehjB+SnidvG1eQzpUQ0QAAtCxSFK7ZmIdLNQ01rwSBDu643UKcEg7jBX0Qrj/amiA+fzCfmubz+OSdivj1+OfWb1qVk9cddMAV91LNlWvupbsgYNe+Km9noR6hc+apgsO248vJdBV3QdW3YcluU8pLlydwcnscFNtOqitTNNx/+jRGeRwVS/t6eYBCpQ0002fxIqdAafCDu89lfvYSeqM06zBpvBgFroM8wMJLqDwx/7Lq9Kqsq03PbguHibyHLk9do+M+SHj/lxteyqvWce6wBct2nK16R6rpl4TjBrHRkqpYiDVQ4OVu1SyDbF2RO4+6Z1m7FA2tPZG3DummT22UtfauPUJ9UrzDRxugA2SvVHEkk8oi1Y3mVaf6xz2/PQ21osI3ymdKkQAR9Ag6NBp2RFCoWb5b91DV66MzhgHAhpGHcg91vb3MGI3wWnYoGA7LTBVm1yCGvG/PClxQRqNs0APbMHBB/C7sgITKjWa6WHLT55B7rGvZObmCW8Oj9+yfNc+88BK7FDgjtLszUeBxymt5ExGmaY6pnZvdeXX0mMps4aAF5Ru7T8jonnKfaHsT6LnnuTTQ7sNPS7E7eqfx2TUT3PTowpVWuUyu7rn48VyXtZUBe0dhldLd3TWNJJ+S4XVrgveXHkrm8+5ziviz76CKxerysqi4a6wVbdWbsqVd1dmyBg1VDv2RFVWt7Iv3wDymgUroaeKhc95imzLjyfILn9e1f3pDWjppsw0DsE99pNWbTb7iltnqPc8rhLiqunxY77qGrx0vshdxVLJw4fdOdY0yZMbriPZ+t016biYHUJJX1is0OZIg43W8k+OuhL2PlFzQIcfJVp1RBBXS6vYCTAXMXNCCrZ18gvpWd1tb0gYKHYCirRqaml6aUaMIbXa8NDRyjKFWN8hJdZfL/AC4U8T/ZXV5C+m2SmtCg0iJQ1pTbzyjHWxAlmfTdNqp4npdtNzNv8IqnWa4QRBQ9tccO/wDVatTE+HEZnsp37Wl5PTZtMtJLTjcgq7KocQ1rjvjE5QDrp0+EQ3zO5R1F2MbnEoagzXfoVRpTPUGuA/FsUyo3DmiGnpHcmZS+jUaIG8fcohpM9zyeGqVPODn2lB8EyxxGSI6SfRM9MtW02yCHeYSKm/mf+x/oi7e5c3Ik+sALW+iXxz8EXt4alQUwfCD4vM9lC0t7Zjj7xnhdyzueSF5GI2WO0C0pAo620+U2stMa3JyjnFpNakCWTq4GMj9S3r3FwB8A+WU1DVJaun/FefaXzjjLq4e4+ImfNJ705Xa6tpoc0uaIcPuuKvxlcnkxc32vjUs9BmlZ1CrA4WTyo1aBKhytGLJ+6Ns6eOo8beqw9Zii1vif9Fnf3wo0jUduR4W9giGND3Fzvhb9JXH+2GpNe7oacNwfVPjPala53UrrrcXHkkpPVdJRFy/zQoXo5nI591rbtyPUY75X1TQbtr6ADcBvhjtC+aWwgF/5QSPXhOvY+7qdQpg+HxOPrCl5pLOj4/t1l60EnC5TUrTOyd0dTD6jmRJmI7Qq37WwZMcqGbZVLHKijG/P2W1KnCMqsbuSIMx5pU+7jAyr9taehd5W6WfZJmS45WlWu5xgo06c5gE7kSmnMtb2s/dYxlWt65aY4VWuLSiXBpBIgE8eSFpp/cbVAwjse8/dA3NwT4WkY3dy5D1bs9Pu2/CDvGT5KlIFbOOfZdeTvqCmDwgk85RFN/dCB/Cs161jTXDelWGIH32HdF0qwIn8PH6j3SKm87fm/ZF29X0Ab6791LWFs7OA+MnJPwt7LYO/Nk9hwltKqdzlx2HmEVTcQe7jyp3KvTWhVcCDhscKEJSeBk+I/svIB6fe7e2DUUAvQvLvzmSPMt6kLyhQmB5wXz/2kphtVwHeV37ivn/tNWmq/wAjC5v/AEc4t4fspCxqFXDsLGoVwV2RgBLo7mE1dAAaPT+652/vDSY6oNx8PqVpY9dOl1vJfVqDqJJw0HYBPJ66TV/BGu3jadIiY8p3K+a3VWSSTKZa5cudUMklI7h2F1eHHEdUPUOVLGyYVWo2xpS6ey6beIPXg6abW/nM/If5Tn2TrBr2tjJKTav/AMgb+VrR89z+6L0Kr01GHzUtzuV/F6rrBQbTNR+JJJlc/eV3VHHJATzUqktAHKWOt+lvclc+PXur2ExqPGJJGcLAUkw91JXvdCVb5Qnxe0bSjWqgbNb4nns1O9aqNDiC2I2nkBF+zrfc0qlV3wuIAjJKU6pVBcTMyY6CNvOVK6utBIXvc14JDUuuLjdjRjvGVrc3fTLGfMncHmEFnddGck3r+kgLVmFQKS6BKckaAqwKXPrErwqHut8Q+Zt1crWk/bsEstXE84CLY4yAksPnRrRqD4j5R5eSMpP5OXHhKaDxzsP3R1B5Bnywo6jpzTOm6PMlQhqRjkyVKTij/9k='
}

export default Datasource
