import { _forEachName } from 'gsap/gsap-core'
import { _ } from 'core-js'

const R2D2DataHandler = function() {
    //
    const ppStates = {
        selectedDataset: {
            key: null,
            data: null
        },
        selectedFile: {
            key: null
            // data: null
        }
    }
    this.ppSetSelectedDataset = (key = null, data = null) => {
        if (!key && data) {
            key = data.id
            // check if the version nummer is included, or add one if not
            const num = parseInt(key.split('/')[1])
            if (isNaN(num) && key !== 'STAGE') {
                const vNum = _.isNumber(data.versionNumber) ? data.versionNumber : 1
                key = `${key}/${vNum}`
            }
        }
        ppStates.selectedDataset.key = key
        ppStates.selectedDataset.data = data
    }
    this.ppGetSelectedDataset = () => {
        const res = {
            key: ppStates.selectedDataset.key,
            data: ppStates.selectedDataset.data
        }
        return res
    }

    // this converts a simple (e.g. STAGE) filelist to a dataset, if needed
    this.ppCreateDatasetFromFileList = (key, data = null) => {
        if (data) {
            if (data.id) {
                return data
            } else if (key) {
                return {
                    id: key,
                    files: _.isArray(data) ? data : []
                }
            }
        }
        return null
    }

    this.ppSetSelectedFile = (key = null, data = null) => {
        ppStates.selectedFile.key = key
        // ppStates.selectedFile.data = data
    }
    this.ppGetSelectedFile = () => ({
        key: ppStates.selectedFile.key
        // data: ppStates.selectedFile.data
    })

    this.ppGetNativeFileProperties = id => {
        let file = null
        const d = ppStates.selectedDataset.data
        if (d && d.files) {
            file = _.find(d.files, { id }) || null
        }
        return file
    }
    //
    this.getDatasets = (data = null, options = {}) => {
        if (!data) {
            return {}
        }
        const res = {
            _new: {
                key: null,
                label: '>> create new dataset'
            },
            _pool: {
                key: 'STAGE',
                label: '>> list staging files'
            }
        }
        if (options.as === 'key-list') {
            _.each(data.hits.hits, (value, index) => {
                const d = {
                    key: value._id,
                    title: value._source.metadata.title
                }
                d.label = `${d.title} | ${d.key}`
                res[value._id] = d
            })
        }
        return res
    }
    //
    this.getFilesOfDataset = (data = null, options = {}) => {
        if (!data) {
            return {}
        }
        const res = {
            _new: {
                key: null,
                label: '>> upload / create new file'
            }
        }
        if (options.as === 'key-list') {
            _.each(data.files, value => {
                const d = {
                    key: value.id,
                    title: value.filename
                }
                d.label = `${d.title} | ${d.key}`
                res[value.id] = d
            })
        }
        return res
    }

    this.getDataOfDataset = (file, options = {}) => {
        return file || null
    }

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++ prototype page
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    this.ppGetRequests = async () => {
        const raw = datasource.getRequests()
        const requests = {}
        let rq
        let id
        // login
        // clone request as its inner data gets mutated !
        id = 'r2d2-login'
        rq = requests[id] = _.cloneDeep(raw[id])
        rq.form = {
            username: {
                type: 'input',
                label: 'username:',
                sendKey: 'username',
                selected: rq.form['dd-auth'].options[0].value.username
            },
            password: {
                type: 'input',
                label: 'password:',
                sendKey: 'password',
                selected: rq.form['dd-auth'].options[0].value.password
            }
        }
        rq.description = 'login'
        rq.api.schema.data = 'ROOT'
        //
        // logout
        // clone request as its inner data gets mutated !
        id = 'r2d2-logout'
        rq = requests[id] = _.cloneDeep(raw[id])
        //
        // get datasets
        // clone request as its inner data gets mutated !
        id = 'r2d2-get-datasets'
        rq = requests[id] = _.cloneDeep(raw[id])
        rq.form['keys'].label = 'query:'
        rq.form['keys'].type = 'value-cell'
        rq.api.schema.data = ''
        rq.description = 'lists all datasets'
        //
        // get files
        // clone request as its inner data gets mutated !
        id = 'r2d2-get-dataset'
        rq = requests[id] = _.cloneDeep(raw[id])
        rq.form['file-id-select'].label = 'dataset-id:'
        rq.form['file-id-select'].type = 'value-cell'
        rq.form['file-id-select'].selected = null
        rq.form['file-id-select'].updateEventKey = `update--${id}`
        rq.description = 'lists all files of a dataset'
        // start change metadata
        // clone request as its inner data gets mutated !
        id = 'r2d2-pp-start-change-metadata'
        rq = requests[id] = _.cloneDeep(raw[id])
        rq.form['dataset-id'].updateEventKey = `update--${id}`
        rq.form['metadata'].updateEventKey = `update--${id}`
        //
        // change metadata
        // clone request as its inner data gets mutated !
        id = 'r2d2-pp-change-metadata'
        rq = requests[id] = _.cloneDeep(raw[id])
        rq.form['dataset-id'].updateEventKey = `update--${id}`
        rq.form['close'] = {
            type: 'button',
            key: 'close',
            label: 'close'
        }
        // create dataset (and set initial metadata)
        // clone request as its inner data gets mutated !
        id = 'r2d2-pp-create-dataset'
        rq = requests[id] = _.cloneDeep(raw[id])
        rq.form['dataset-id'].updateEventKey = `update--${id}`
        rq.form['close'] = {
            type: 'button',
            key: 'close',
            label: 'close'
        }
        //
        // upload file
        // clone request as its inner data gets mutated !
        id = 'r2d2-pp-chunk-upload-file'
        rq = requests[id] = _.cloneDeep(raw[id])
        rq.form['close'] = {
            type: 'button',
            key: 'close',
            label: 'close'
        }
        //
        // update file
        // clone request as its inner data gets mutated !
        // id = 'r2d2-pp-update-file'
        // rq = requests[id] = _.cloneDeep(raw[id])
        // rq.form['close'] = {
        //     type: 'button',
        //     key: 'close',
        //     label: 'close'
        // }

        // inspect file
        id = 'r2d2-pp-inspect-file'
        rq = requests[id] = _.cloneDeep(raw[id])
        rq.form['close'] = {
            type: 'button',
            key: 'close',
            label: 'close'
        }

        // download file
        id = 'r2d2-pp-download-file'
        rq = requests[id] = _.cloneDeep(raw[id])
        rq.form['close'] = {
            type: 'button',
            key: 'close',
            label: 'close'
        }

        // get (pool) files
        id = 'r2d2-pp-get-files'
        rq = requests[id] = _.cloneDeep(raw[id])

        return requests
    }

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++ meta form handler (generic)
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++

    const MetaFormHandler = function() {
        const LY = {
            START: '_START',
            END: '_END',
            ADD: '_ADD',
            REMOVE: '_REMOVE',
            START_OF_LIST: '_START_OF_LIST',
            END_OF_LIST: '_END_OF_LIST'
        }

        // TESTDATA
        const metaRawData = {
            title: 'test metadata',
            authors: [
                {
                    givenName: 'author 1',
                    familyName: 'foo 1',
                    nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
                    affiliations: [
                        {
                            id: 'affy-1',
                            organization: '',
                            department: 1 // select by index test
                        }
                    ]
                },
                {
                    givenName: 'author 2',
                    familyName: 'foo 2',
                    nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
                    affiliationsXX: [
                        {
                            id: null,
                            organization: '',
                            department: 0 // select by index test
                        }
                    ]
                },
                {
                    givenName: 'author 3',
                    familyName: 'foo 3',
                    nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
                    affiliations: [
                        {
                            id: null,
                            organization: '',
                            department: 'department 2'
                        },
                        {
                            id: 'zzk-22',
                            organization: 'fzdgduzfg',
                            department: 'area 51'
                        },
                        {
                            id: 'msg-5555',
                            organization: 'tizoiho',
                            department: '42'
                        }
                    ]
                }
            ],
            doi: '12345',
            description: 'fourth try to create a dataset via drag',
            genres: ['g1', 'g2'],
            keywords: ['kw1', 'kw2'],
            correspondingPapers: [
                {
                    title: 'paper 1',
                    url: null,
                    type: null,
                    identifier: null,
                    identifierType: 'identifierType paper 1'
                },
                {
                    title: 'paper 2',
                    url: null,
                    type: null,
                    identifier: null,
                    identifierType: 'identifierType paper 2'
                }
            ],
            license: 'lcs 123',
            language: ['de', 'ru']
        }

        // TESTDATA // TODO move to structure
        const schemaV1 = {
            title: {
                __0: {
                    // TESTDATA
                    type: 'input',
                    label: 'title'
                }
            },
            description: {},
            language: {},
            doi: {},
            license: {},
            genres: {},
            keywords: {},
            authors: {
                __0: {
                    type: 'input',
                    label: 'title',
                    dynamicList: true
                },
                givenName: {},
                familyName: {},
                nameIdentifier: {},
                affiliations: {
                    __0: {
                        dynamicList: true
                    },
                    department: {
                        __0: {
                            // TESTDATA
                            type: 'dropdown',
                            label: 'authors.affiliations.department TEST',
                            sendKey: '',
                            options: ['a', 'b', 'c', 'd'],
                            default: 2
                        }
                    },
                    organization: {},
                    id: {
                        __0: {
                            default: '1234-oo'
                        }
                    }
                }
            },
            correspondingPapers: {
                __0: {
                    dynamicList: true
                },
                url: {},
                type: {},
                identifier: {},
                identifierType: {}
            }
        }

        const schema = {
            title: {
                __0: {
                    type: 'input',
                    label: 'title',
                    default: 'dedault title'
                }
            },
            description: {},
            language: {},
            doi: {},
            license: {},
            genres: {},
            keywords: {},

            authors: [
                {
                    __0: {
                        sublist: true
                    },
                    givenName: {},
                    familyName: {},
                    nameIdentifier: {},
                    affiliations: [
                        {
                            __0: {
                                sublist: true
                            },
                            department: {
                                __0: {
                                    // TESTDATA
                                    type: 'dropdown',
                                    label: 'authors.affiliations.department TEST',
                                    sendKey: '',
                                    options: ['a', 'b', 'c', 'd']
                                },
                                default: 2
                            },
                            organization: { default: 'affy-orgaaa' },
                            id: {
                                default: '1234-oo'
                            }
                        }
                    ]
                }
            ],

            correspondingPapers: [
                {
                    __0: {
                        sublist: true
                    },
                    url: {},
                    type: {},
                    identifier: {},
                    identifierType: {}
                }
            ]
        }

        // simple structure test

        const metaRawDataXX = {
            correspondingPapers: [
                {
                    title: 'paper 1',
                    url: null,
                    type: null,
                    identifier: null,
                    identifierType: 'identifierType paper 1',
                    sub2test: [
                        {
                            val1: '1-123',
                            val2: '1-456'
                        }
                    ]
                },
                {
                    title: 'paper 2',
                    url: null,
                    type: null,
                    identifier: null,
                    // identifierType: 'identifierType paper 2',
                    sub2test: [
                        {
                            val1: '2-123',
                            val2: '2-456'
                        }
                    ]
                }
            ]
        }

        const schemaXX = {
            correspondingPapers: [
                {
                    __0: {
                        sublist: true
                    },
                    url: { default: '123' },
                    type: {},
                    identifier: {},
                    identifierType: { default: '456' },
                    sub2test: [
                        {
                            __0: {
                                sublist: true
                            },
                            val1: {},
                            val2: {}
                        }
                    ]
                }
            ]
        }

        //

        const sortingTree = [] // OK
        const createSortingTree = (source = {}, target = []) => {
            // console.log('CST:IN source =  ', source)
            _.each(source, (obj, key) => {
                if (key !== '__0') {
                    let node = null
                    if (_.isArray(obj) && _.isPlainObject(obj[0]) && obj[0].__0 && obj[0].__0.sublist) {
                        node = { key, sub: [] }
                        target.push(node)
                        createSortingTree(obj[0], node.sub)
                    } else {
                        // console.log('CST: obj =  ', obj)
                        node = { key, value: _.isUndefined(obj.default) ? null : obj.default }
                        target.push(node)
                    }
                }
            })
        }

        const sortRawDataByTree = (srcNnode, tgNode = [], reference = []) => {
            // console.log('SBT:E2:IN: +++++++++++ = ')
            // console.log('SBT:E2:IN: sortedData = ', sortedData)
            // console.log('SBT:E2:IN: srcNnode = ', srcNnode)
            // console.log('SBT:E2:IN: tgNode = ', tgNode)
            // console.log('SBT:E2:IN: reference = ', reference)
            if (_.isArray(srcNnode)) {
                _.each(srcNnode, (elm, index) => {
                    tgNode[index] = []
                    // console.log('SBT:E2:isA: tgNode = ', tgNode)
                    sortRawDataByTree(elm, tgNode[index], reference)
                })
            }
            const missingKeys = {}
            _.each(reference, (rfObj, index) => {
                const key = rfObj.key // correspondingPapers
                if (Object.keys(srcNnode).indexOf(key) > -1) {
                    // console.log('SBT:E2:isO: hasKey key, srcNnode[key] = ', key, srcNnode[key])
                    tgNode[index] = { key }
                    if (rfObj.sub) {
                        tgNode[index].sub = []
                        sortRawDataByTree(srcNnode[key], tgNode[index].sub, rfObj.sub)
                    } else {
                        tgNode[index].value = srcNnode[key]
                    }
                } else {
                    if (!_.isArray(srcNnode)) {
                        missingKeys[key] = { key, index }
                    }
                }
            })
            // console.log('SBT:E2:missing: Object.keys(srcNnode) = ', Object.keys(srcNnode))
            // console.log('SBT:E2:missing: missingKeys = ', missingKeys)
            _.each(missingKeys, msObj => {
                // this creates the complete structure below the node!
                // no need to start ecursion here
                let cloned = _.cloneDeep(reference[msObj.index])
                // console.log('SBT:E1:CLO cloned = ', cloned)

                if (cloned.sub) {
                    cloned.sub = [cloned.sub]
                    // cloned = [cloned]
                }
                // console.log('SBT:E1:CLO msObj = ', msObj)
                // console.log('SBT:E1:CLO cloned = ', cloned)
                // console.log('SBT:E1:CLO reference = ', reference)
                // console.log('SBT:E1:CLO reference[msObj.index] = ', reference[msObj.index])
                tgNode[msObj.index] = cloned
            })
        }

        const sortRawDataByTreeV1 = (source = {}, target = [], reference = [], tree = []) => {
            // console.log('createSortingTree: sortingTree ', sortingTree)
            // debugger

            let node
            if (_.isArray(source) && _.isPlainObject(source[0])) {
                _.each(source, (val, key) => {
                    node = { key, sub: [] }
                    target[key] = node
                    sortRawDataByTree(val, target[key].sub, reference, tree)
                })
            } else {
                const allNeededKeys = {}
                let index = -1
                _.each(reference, obj => {
                    index++
                    allNeededKeys[obj.key] = { index }
                })
                console.log('sortRawDataByTree: source = ', source)

                _.each(source, (val, key) => {
                    delete allNeededKeys[key]
                })
                console.log('sortRawDataByTree: allNeededKeys = ', allNeededKeys)
                _.each(allNeededKeys, (obj, key) => {
                    console.log('sortRawDataByTree:E1: key = ', key)
                    console.log('sortRawDataByTree:E1: obj = ', obj)
                    console.log('sortRawDataByTree:E1: tree = ', tree)

                    const tr = [...tree, key]
                    const t = getTree(tr)
                    console.log('sortRawDataByTree:E1: allNeededKeys = ', allNeededKeys)
                    console.log('sortRawDataByTree:E1: key = ', key)
                    console.log('sortRawDataByTree:E1: tree = ', tree)
                    console.log('sortRawDataByTree:E1: tr = ', tr)
                    console.log('sortRawDataByTree:E1: t = ', t)

                    // key: affiliations

                    // SOURCE: reference.authors[0].affiliations[0]
                    // TARGET: target.authors[x].affiliations[0]

                    const path = t.nodeGetPath ? `${t.nodeGetPath}.${key}` : key

                    // array path here !!

                    // const path = tree.length > 0 ? `${tree.join('.')}.${key}` : key
                    console.log('sortRawDataByTree:E1: path = ', path)

                    let ref = _.get(schema, path)
                    if (_.isArray(ref)) {
                        ref = ref[0]
                    }

                    console.log('sortRawDataByTree:E1: ref = ', ref)

                    const stc = ref && ref.__0 ? ref && ref.__0 : {}
                    stc.sublist = stc.sublist === true
                    let value = null

                    console.log('sortRawDataByTree:E1: +++++ key = ', key)
                    console.log('sortRawDataByTree:E1: stc.sublist = ', stc.sublist)

                    if (stc.sublist === true) {
                        // target[obj.index] = { key, sub: [{ key: 0, sub: [] }] }

                        target[obj.index] = { key, sub: reference[obj.index].sub }

                        // sortRawDataByTree(xxx, target[obj.index].sub, reference[obj.index].sub, t1)

                        // sortRawDataByTree(val, target[index].sub, reference[index].sub, t1)

                        console.log('sortRawDataByTree:E1: obj.index = ', obj.index)
                        console.log('sortRawDataByTree:E1: source = ', source)
                        console.log('sortRawDataByTree:E1: target = ', target)
                        console.log('sortRawDataByTree:E1: reference = ', reference)
                        console.log('sortRawDataByTree:E1: target[obj.index] = ', target[obj.index])

                        // const tg = target[obj.index].sub[0].sub
                        // _.each(ref, (val2, key2) => {
                        //     if (key2 !== '__0') {
                        //         if (val2.__0 && !_.isNil(val2.__0.default)) {
                        //             value = val2.__0.default
                        //         }
                        //         tg.push({ key: key2, value })
                        //     }
                        // })
                    } else {
                        console.log('sortRawDataByTree:E1: !isDynamicList reference = ', reference)
                        value = _.isNil(stc.default) ? null : stc.default
                        target[obj.index] = { key, value }
                    }
                })
                _.each(source, (val, key) => {
                    const index = _.findIndex(reference, { key: key })
                    if (index > -1) {
                        console.log('sortRawDataByTree:E2: +++++ IN key = ', key)
                        console.log('sortRawDataByTree:E2: IN val = ', val)

                        if (_.isArray(val) && _.isPlainObject(val[0])) {
                            node = { key, sub: [] }
                            target[index] = node
                            const t1 = [...tree, index, key]
                            // t1.push(key)

                            console.log('sortRawDataByTree:E2:VVV: +++++++ key = ', key)
                            console.log('sortRawDataByTree:E2:VVV: index = ', index)
                            console.log('sortRawDataByTree:E2:VVV: t1 = ', t1)
                            sortRawDataByTree(val, target[index].sub, reference[index].sub, t1)
                        } else if (_.isPlainObject(val)) {
                            node = { key, sub: [] }
                            target[index] = node
                            const t2 = [...tree]
                            t2.push(key)
                            sortRawDataByTree(val, target[index].sub, reference, t2)
                            // sortRawDataByTree(val, target[index].sub, reference[index].sub, t2)
                        } else {
                            node = { key, value: val }
                            target[index] = node
                        }
                    }
                })
            }
        }

        // this holds the index data of all levels
        // needed to recursive detect when a list ends
        let indexTree = {}
        const createIndexTree = (source, parentTree = null) => {
            // console.log('CIT:IN +++++++++')
            // console.log('CIT:IN source = ', source)
            // console.log('CIT:IN parentTree = ', parentTree)
            // console.log('CIT:IN indexTree = ', indexTree)
            let key = null
            const setIndexInfo = (node, key) => {
                if (_.isString(node.key)) {
                    indexTree[key] = {
                        length: node.sub.length,
                        index: 0
                    }
                }
            }
            if (_.isArray(source)) {
                _.each(source, (node, index) => {
                    if (_.isArray(node)) {
                        _.each(node, (obj, i) => {
                            if (obj.sub) {
                                key = parentTree ? `${parentTree}.${index}` : index.toString()
                                createIndexTree(obj, key)
                            }
                        })
                    } else if (node.sub) {
                        key = parentTree ? `${parentTree}.${node.key}` : node.key
                        setIndexInfo(node, key)
                        createIndexTree(node.sub, key)
                    }
                })
            } else if (source.sub) {
                key = parentTree ? `${parentTree}.${source.key}` : source.key
                setIndexInfo(source, key)
                createIndexTree(source.sub, key)
            }
        }

        const addLayoutElements = (source, target = []) => {
            let node2add
            if (_.isArray(source)) {
                _.each(source, (node, index) => {
                    if (_.isArray(node)) {
                        const targetL2 = []
                        target[index] = targetL2
                        _.each(node, (nodeL2, indexL2) => {
                            // TODO check if this block could be replaced by a simple recursion,
                            // looks a bit redundant !
                            if (_.isArray(nodeL2)) {
                                // go deeper
                                addLayoutElements(nodeL2, targetL2)
                            } else if (nodeL2.sub) {
                                node2add = { key: nodeL2.key, sub: [] }
                                targetL2[indexL2] = node2add
                                // go deeper
                                addLayoutElements(nodeL2.sub, targetL2[indexL2].sub)
                            } else {
                                // finalize recursion here
                                targetL2[indexL2] = _.cloneDeep(nodeL2)
                            }
                        })
                    } else if (_.isArray(node.sub)) {
                        node2add = { key: node.key, sub: [] }
                        target[index] = node2add
                        // go deeper
                        addLayoutElements(node.sub, target[index].sub)
                    } else {
                        // finalize recursion here
                        target[index] = _.cloneDeep(node)
                    }
                })
            }
        }

        const addLayoutElementsV2 = (source, target = []) => {
            // console.log('ALE:IN: +++++++ ')
            // console.log('ALE:IN: source.key = ', source.key)
            console.log('ALE:IN: source = ', source)
            console.log('ALE:IN: target = ', target)
            //
            const start = { layout: LY.START_OF_LIST, label: 'Start' }
            const end = { layout: LY.END_OF_LIST, label: 'End' }
            //
            if (_.isArray(source)) {
                console.log('ALE:E: source = ', source)
                _.each(source, (node, index) => {
                    if (_.isArray(node)) {
                        console.log('ALE:E: node = ', node)
                    }

                    // console.log('ALE:isA node = ', node)
                    // if (node) {
                    //     addLayoutElements(node)
                    // }
                    // if (_.isArray(node)) {
                    //     node = [start, ...node, end]
                    // }
                })
                // if (_.isArray(source)) {
                //     source = [start, ...source, end]
                // }
            } else if (source.sub) {
                addLayoutElements(source.sub)
            } else {
                // console.log('ALE:E source.key = ', source.key)
                // console.log('ALE:E source = ', source)
                target[source.key] = source
            }

            // _.each(source, node => {
            //     console.log('ALE: node = ', node)
            //     if (node.sub) {
            //         addLayoutElements(node.sub)
            //     }
            // })

            // _.each(source, node => {
            //     if (node.sub) {
            //         const start = { layout: LY.START_OF_LIST, label: 'Start' }
            //         const end = { layout: LY.END_OF_LIST, label: 'End' }
            //         node.sub = [start, ...node.sub, end]
            //         const targetNode = { key: node.key, sub: [] }
            //         target.push(targetNode)
            //         addLayoutElements(node.sub, targetNode.sub)
            //     }

            //     else if (node.layout) {
            //         target.push({ layout: node.layout })
            //     } else {
            //         console.log('ALE:3: target = ',target)
            //         console.log('ALE:3: node = ',node)
            //         target.push({ key: node.key, value: node.value })
            //     }
            // })
        }

        const addLayoutElementsV1 = (source, target) => {
            _.each(source, node => {
                if (node.sub) {
                    const start = { layout: LY.START_OF_LIST, label: 'Start' }
                    const end = { layout: LY.END_OF_LIST, label: 'End' }
                    node.sub = [start, ...node.sub, end]
                    const targetNode = { key: node.key, sub: [] }
                    target.push(targetNode)
                    addLayoutElements(node.sub, targetNode.sub)
                } else if (node.layout) {
                    target.push({ layout: node.layout })
                } else {
                    target.push({ key: node.key, value: node.value })
                }
            })
        }

        // TODO implement a recursive filter for undefined values
        // happens when raw input data vs. schema keys missing

        const getLayoutItem = (tree, args) => {
            tree = args.treeAdd ? [...tree, args.treeAdd] : [...tree]

            const item = {
                type: 'LY',
                label: '',
                spLabel: tree.join('.'),
                startBlock: args.startBlock === true,
                endBlock: args.endBlock === true,
                addBlock: args.addBlock === true,
                removeBlock: args.removeBlock === true,
                __strc: {
                    level: args.level,
                    class: `level-${args.level}`,
                    tree
                }
            }
            return item
        }

        const getTree = tree => {
            tree = tree.length === 0 ? [''] : tree
            tree = _.isString(tree) ? tree.split('.') : [...tree]
            _.each(tree, (val, index) => {
                tree[index] = isNaN(parseInt(val)) ? val : parseInt(val)
            })

            const res = {
                tree: [...tree],
                objectPath: tree.reduce((acc, val) => (isNaN(val) ? `${acc}.${val}` : acc)),
                arrayPath: tree.reduce((acc, val) => `${acc}.${val.toString()}`)
            }
            //
            const t0 = [...tree]
            const val1 = t0.pop()
            const val2 = t0.pop()
            res.lastIndex = !isNaN(val1) ? val1 : !isNaN(val2) ? val2 : -1
            res.lastKey = _.isString(val1) ? val1 : val2
            //
            const t1 = [...tree]
            res.keyEndingTree = t1
            res.keyEndingArrayPath = res.arrayPath
            if (_.isNumber(_.last(t1))) {
                t1.pop()
                res.keyEndingTree = t1
                res.keyEndingArrayPath = ''
                if (t1.length > 0) {
                    res.keyEndingArrayPath = t1.reduce((acc, val) => `${acc}.${val.toString()}`)
                }
            }
            //
            const t2 = [...tree]
            res.indexEndingTree = t2
            res.indexEndingArrayPath = res.arrayPath
            if (_.isString(_.last(t2))) {
                t2.pop()
                res.indexEndingTree = t2
                res.indexEndingArrayPath = ''
                if (t2.length > 0) {
                    res.indexEndingArrayPath = t2.reduce((acc, val) => `${acc}.${val.toString()}`)
                }
            }
            let n = null
            const t = [...res.indexEndingTree].reverse()
            while (t.length > 1) {
                const v = t.pop()
                if (_.isString(v)) {
                    n = n ? `${n}.${v}` : v
                } else {
                    n = `${n}[${v}]`
                }
            }
            // n = n ? n : res.lastKey
            res.nodeGetPath = n
            return res
        }

        const scanAndCreateForm = (node, level = 1, tree = []) => {
            _.each(node, obj => {
                if (obj) {
                    while (tree.length > level) {
                        tree.pop()
                    }
                    tree[level - 1] = obj.key
                    if (obj.sub) {
                        scanAndCreateForm(obj.sub, level + 1, tree, obj)
                    } else {
                        const items = []
                        if (obj.layout) {
                            tree.pop()
                            const t1 = getTree(tree)
                            // console.log('SCR: t1 = ',t1)
                            // console.log('SCR: schema = ',schema)
                            // const tst =  _.get(schema, `${getTree(tree).arrayPath}.__0`)
                            // console.log('SCR: tst = ',tst)

                            const actionDef = _.get(schema, `${getTree(tree).objectPath}.__0`)
                            console.log('SCR: actionDef = ', actionDef)
                            const isListElement = _.isNumber(_.last(tree))
                            if (actionDef && actionDef.dynamicList) {
                                if (isListElement) {
                                    if (obj.layout === LY.START_OF_LIST) {
                                        const t = getTree(tree)
                                        const idx = t.keyEndingArrayPath
                                        if (indexTree[idx].index === 0) {
                                            const t1 = [...tree]
                                            t1.pop()
                                            const lbl1 = getFormItem(t1, null, {
                                                level: level - 2,
                                                type: 'label',
                                                label: t.lastKey
                                            })
                                            items.push(lbl1)
                                        }

                                        const lbl2 = getFormItem(tree, null, {
                                            level: level - 1,
                                            type: 'label',
                                            label: `${t.lastKey}.${indexTree[idx].index}`
                                        })
                                        items.push(lbl2)

                                        items.push(getLayoutItem(tree, { level, startBlock: true, treeAdd: LY.START }))
                                        items.push(
                                            getLayoutItem(tree, { level, removeBlock: true, treeAdd: LY.REMOVE })
                                        )
                                    }
                                    if (obj.layout === LY.END_OF_LIST) {
                                        items.push(getLayoutItem(tree, { level, endBlock: true, treeAdd: LY.END }))
                                        const t = getTree(tree)
                                        const idx = t.keyEndingArrayPath
                                        indexTree[idx].index++
                                        // if the indexTree.index condition is set, the add tags only appear
                                        // at the end of a list
                                        // otherwise its set on end of every block
                                        // TODO check usability!
                                        if (true || indexTree[idx].index === indexTree[idx].length) {
                                            items.push(getLayoutItem(tree, { level, addBlock: true, treeAdd: LY.ADD }))
                                        }
                                    }
                                }
                            } else {
                                items.push(getLayoutItem(tree, { level }))
                            }
                            tree.push(obj.layout)
                        } else {
                            items.push(
                                getFormItem(tree, obj.value, {
                                    level
                                })
                            )
                        }
                        _.each(items, item => {
                            const path = item.__strc.tree.reduce((acc, val) => `${acc}.${val.toString()}`)
                            form[path] = item
                        })
                    }
                }
            })
        }

        const getFormItem = (tree, value, args) => {
            const path = tree.reduce((acc, val) => (_.isString(val) ? `${acc}.${val}` : acc))
            const res = _.get(schema, path)
            const key = tree.join('--')
            const defaultItem = {
                type: 'input',
                label: tree.join('.')
            }
            let item = res && _.isPlainObject(res.__0) && _.isString(res.__0.type) ? res.__0 : defaultItem
            item = _.cloneDeep(item)

            const add = {
                __strc: {
                    level: args.level,
                    class: `level-${args.level}`,
                    tree
                },
                selected: value,
                key,
                sendKey: key, // ??
                label: tree
                    .join('.')
                    .split('.')
                    .pop() // TEST
            }
            item = { ...item, ...add }

            // overrides
            if (_.isString(args.type)) {
                item.type = args.type
            }
            if (_.isString(args.label)) {
                item.label = args.label
            }
            //
            item.label = `${item.label}:` // mock hardcoded, TODO: generate i18n id here!
            //
            if (item.type === 'dropdown') {
                item = globals.setupDropdownFormCell(item)
            } else {
                // MOCK just remove the annoying bootstrap propz error :-((
                item.selected = _.isArray(item.selected) ? item.selected.join(',') : item.selected
            }
            //
            return item
        }

        const initialize = () => {
            // 1. create a sorting tree by schema
            createSortingTree(schema, sortingTree)
        }
        //
        let sortedData = null
        let sortedDataWithLayoutElements = null
        let form = null
        //
        const createNewForm = meta => {
            form = {}
            sortedData = []
            sortedDataWithLayoutElements = []
            // 2. move all raw data into correct order by schema
            console.log('INIT:createNewForm meta = ', _.cloneDeep(meta))
            sortRawDataByTree(meta, sortedData, sortingTree)
            console.log('INIT:createNewForm SBT:E1: sortedData = ', sortedData)
            // debugger
            const d = _.cloneDeep(sortedData)
            console.log('INIT:createNewForm d = ', d)
            // 3. create the index-tree for list-length tracking by following recursive functions
            createIndexTree(d)
            console.log('INIT:createNewForm indexTree = ', indexTree)
            // 4. add the basic layout tags (list start/end)
            addLayoutElements(d, sortedDataWithLayoutElements)
            console.log('INIT:ALE:createNewForm sortedDataWithLayoutElements = ', sortedDataWithLayoutElements)
            console.log('INIT:ALE:createNewForm sortedData = ', sortedData)
            // 5. create the final form and add the add/remove tags (uses the index-tree)
            scanAndCreateForm(sortedDataWithLayoutElements)
        }

        initialize()
        createNewForm(metaRawData)

        this.getForm = () => form
        // this.getForm = () => {} // TEST ON

        const collectData = () => {
            const res = {}
            const filteredForm = {}
            //
            _.each(form, (obj, key) => {
                const t = getTree(key)
                const filter = Object.values(LY)
                if (filter.indexOf(t.lastKey) === -1) {
                    filteredForm[key] = obj
                }
            })
            _.each(filteredForm, (obj, key) => {
                const t = getTree(key).tree.reverse()
                let path = null
                while (t.length) {
                    const p1 = t.pop()
                    const p2 = t.pop()
                    path = path ? `${path}.${p1}` : p1
                    let tg = _.get(res, path)
                    if (_.isPlainObject(tg) && t.length > 0) {
                        _.set(res, path, [])
                        tg = _.get(res, path)
                    }
                    if (!tg) {
                        if (t.length > 0) {
                            _.set(res, path, [])
                        } else {
                            _.set(res, path, {})
                        }
                        tg = _.get(res, path)
                    }
                    if (t.length > 0) {
                        if (!tg[p2]) {
                            tg[p2] = {}
                        }
                        path = `${path}[${p2}]`
                    } else {
                        tg.selected = obj.selected
                    }
                }
                _.set(res, path, { selected: obj.selected })
            })
            return res
        }

        // add and remove form blocks
        const removeBlock = tree => {
            const meta = collectData()
            const t = getTree(tree)
            const target = _.get(meta, t.nodeGetPath)
            target.splice(t.lastIndex, 1)
            console.log('MT:removeBlock t = ', t)
            console.log('MT:removeBlock meta = ', meta)
            createNewForm({})
        }

        this.modifyForm = args => {
            if (args.action === 'removeBlock') {
                removeBlock(args.tree)
            }
            console.log('MT:modifyForm args = ', args)
        }
    }
    let metaFormHandler = null
    this.getMetaFormHandler = () => {
        if (!metaFormHandler) {
            metaFormHandler = new MetaFormHandler()
        }
        return metaFormHandler
    }

    // ++++++++++++++++++++++++++
    // +++++++ upload handler
    // ++++++++++++++++++++++++++

    // TODO Cleanup after work in progress

    const pendingUploads = {}

    const ChunkFileUploadHandlerApiV1 = function(file, options) {
        // TODO create overlaping slices to check if the transitions are correct
        // TODO dynamic uniqueInstanceKey's for multiple uploads
        const uniqueInstanceKey = 'r2d2-chunkload-fcc001'
        let numOfChunks = _.toInteger(options['num-of-chunks']) || 0
        numOfChunks = numOfChunks < 1 ? 1 : numOfChunks
        console.log('CFU:ChunkFileUploadHandler file = ', file)
        console.log('CFU:ChunkFileUploadHandler options = ', options)
        // let testFileName = 'chunktest-25.jpg'
        let fileId = null
        let chunkCnt = null
        let resultList = []

        const fireResult = (res = resultList) => {
            globals.eventBus.$emit('onLoadResults', {
                key: options.resultEventKey,
                uniqueInstanceKey,
                filteredResult: res
            })
        }

        const onFileInitializeResult = res => {
            console.log('R2UH:onFileInitializeResult res = ', res)
            // initChunkSetup() // TEST ON
            // return sendChunk() // TEST ON
            if (!res.error) {
                resultList.push(res.result.data)
                fileId = res.result.data.id
                fireResult()
                initChunkSetup()
                sendChunk()
            } else {
                fireResult(res)
            }
        }

        const initializeFile = () => {
            let key = options['api-initial']
            let api = datasource.getRequests()[key].api
            console.log('R2UH:initializeFile file = ', file)
            console.log('R2UH:initializeFile options.resultEventKey = ', options.resultEventKey)
            if (!file) {
                return fireResult({
                    error: 'No file selected!'
                })
            }
            const sendData = {
                'dataset-id': options['dataset-id'],
                'file-id': null,
                cunky: {
                    base64: null,
                    filename: file.name,
                    filesize: file.size,
                    totalchunks: numOfChunks, // numOfChunks,
                    contentType: 'application/x-binary'
                }
            }
            datasource.request(uniqueInstanceKey, api, sendData).then(onFileInitializeResult)
        }

        let sliceStart = null
        let sliceEnd = null
        let sliceDelta = null
        let testBase64 = ''
        //
        const initChunkSetup = res => {
            // TODO check this if right
            chunkCnt = 1
            const units = Math.floor(file.size / 6)
            console.log('CFU:initChunkSetup file.size = ', file.size)
            console.log('CFU:initChunkSetup units = ', units)
            sliceDelta = Math.floor(units / numOfChunks) * 6
            console.log('CFU:initChunkSetup sliceDelta = ', sliceDelta)
            sliceStart = 0
            sliceEnd = sliceDelta
        }

        const onChunkUploadResult = res => {
            resultList.push(res.result.data)
            fireResult()
            chunkCnt++
            sliceStart = sliceEnd + 0
            sliceEnd = sliceStart + sliceDelta
            sliceEnd = chunkCnt === numOfChunks ? file.size : sliceEnd
            if (chunkCnt <= numOfChunks) {
                sendChunk()
            } else {
                resultList.push('Upload finalized successful! :-)')
                fireResult()
            }
        }

        const sendChunk = () => {
            console.log('CFU:sendChunk: chunkCnt = ', chunkCnt)
            const reader = new FileReader()
            reader.onload = evt => {
                let base64 = evt.target.result
                if (chunkCnt === 1) {
                    base64 = base64.split('application/octet-stream').join(file.type)
                } else {
                    base64 = base64.split('base64,')[1]
                }
                console.log('CFU:sendChunk: base64 S = ', base64.substr(0, 50))
                console.log('CFU:sendChunk: base64 E = ', base64.substr(base64.length - 20))
                let key = options['api-upload-chunk']
                let api = datasource.getRequests()[key].api
                const sendData = {
                    'dataset-id': options['dataset-id'],
                    'file-id': fileId,
                    cunky: {
                        base64,
                        binary: base64,
                        chunknumber: chunkCnt,
                        contentType: 'application/x-binary'
                    }
                }
                // testBase64 += base64
                // onChunkUploadResult() // TEST ON
                datasource.request(uniqueInstanceKey, api, sendData).then(onChunkUploadResult)
            }
            // console.log('CFU:sendChunk: chunkCnt = ', chunkCnt)
            // console.log('CFU:sendChunk: sliceStart, sliceEnd = ', sliceStart, sliceEnd)
            const slice = file.slice(sliceStart, sliceEnd)
            reader.readAsDataURL(slice)
        }

        initializeFile()

        // +++++++++++++++++++++++++
        // +++++++++++++++++++++++++
        // +++++++++++++++++++++++++
        // +++++++++++++++++++++++++
    }

    const ChunkFileUploadHandler = function(file, options) {
        // TODO create overlaping slices to check if the transitions are correct
        // TODO dynamic uniqueInstanceKey's for multiple uploads
        const uniqueInstanceKey = 'r2d2-chunkload-fcc001'
        let numOfChunks = _.toInteger(options['num-of-chunks']) || 0
        numOfChunks = numOfChunks < 1 ? 1 : numOfChunks
        console.log('CFU:ChunkFileUploadHandler file = ', file)
        console.log('CFU:ChunkFileUploadHandler options = ', options)
        // let testFileName = 'chunktest-25.jpg'
        let fileId = null
        let chunkCnt = null
        let resultList = []

        const fireResult = (res = resultList) => {
            globals.eventBus.$emit('onLoadResults', {
                key: options.resultEventKey,
                uniqueInstanceKey,
                filteredResult: res
            })
        }

        const onFileInitializeResult = res => {
            console.log('R2UH:onFileInitializeResult res = ', res)
            // initChunkSetup() // TEST ON
            // return sendChunk() // TEST ON
            if (!res.error) {
                resultList.push(res.result.data)
                fileId = res.result.data.id
                fireResult()
                initChunkSetup()
                sendChunk()
            } else {
                fireResult(res)
            }
        }

        const initializeFile = () => {
            console.log('R2UH:initializeFile options = ', options)
            let key = options['api-upload-initial']
            let api = datasource.getRequests()[key].api
            console.log('R2UH:initializeFile file = ', file)
            console.log('R2UH:initializeFile options.resultEventKey = ', options.resultEventKey)
            if (!file) {
                return fireResult({
                    error: 'No file selected!'
                })
            }
            const sendData = {
                'dataset-id': options['dataset-id'],
                'file-id': null,
                cunky: {
                    base64: null,
                    filename: file.name,
                    filesize: file.size,
                    totalchunks: numOfChunks // numOfChunks
                }
            }
            datasource.request(uniqueInstanceKey, api, sendData).then(onFileInitializeResult)
        }

        let sliceStart = null
        let sliceEnd = null
        let sliceDelta = null
        let testBase64 = ''
        //
        const initChunkSetup = res => {
            // TODO check this if right
            chunkCnt = 1
            const units = Math.floor(file.size / 6)
            console.log('CFU:initChunkSetup file.size = ', file.size)
            console.log('CFU:initChunkSetup units = ', units)
            sliceDelta = Math.floor(units / numOfChunks) * 6
            console.log('CFU:initChunkSetup sliceDelta = ', sliceDelta)
            sliceStart = 0
            sliceEnd = sliceDelta
        }

        const onChunkUploadResult = res => {
            resultList.push(res.result.data)
            fireResult()
            chunkCnt++
            sliceStart = sliceEnd + 0
            sliceEnd = sliceStart + sliceDelta
            sliceEnd = chunkCnt === numOfChunks ? file.size : sliceEnd
            if (chunkCnt <= numOfChunks) {
                sendChunk()
            } else {
                resultList.push('last chunk upload finished')
                fireResult()
                finalizeUpload()
            }
        }

        const sendChunk = () => {
            console.log('CFU:sendChunk: chunkCnt = ', chunkCnt)
            const reader = new FileReader()
            reader.onload = evt => {
                let base64 = evt.target.result
                if (chunkCnt === 1) {
                    base64 = base64.split('application/octet-stream').join(file.type)
                } else {
                    base64 = base64.split('base64,')[1]
                }
                console.log('CFU:sendChunk: base64 S = ', base64.substr(0, 50))
                console.log('CFU:sendChunk: base64 E = ', base64.substr(base64.length - 20))
                let key = options['api-upload-chunk']
                let api = datasource.getRequests()[key].api
                const sendData = {
                    'dataset-id': options['dataset-id'],
                    'file-id': fileId,
                    cunky: {
                        base64,
                        binary: base64,
                        chunknumber: chunkCnt
                    }
                }
                // testBase64 += base64
                // onChunkUploadResult() // TEST ON
                datasource.request(uniqueInstanceKey, api, sendData).then(onChunkUploadResult)
            }
            // console.log('CFU:sendChunk: chunkCnt = ', chunkCnt)
            // console.log('CFU:sendChunk: sliceStart, sliceEnd = ', sliceStart, sliceEnd)
            const slice = file.slice(sliceStart, sliceEnd)
            reader.readAsDataURL(slice)
        }

        const sendChunkApiV1 = () => {
            console.log('CFU:sendChunk: chunkCnt = ', chunkCnt)
            const reader = new FileReader()
            reader.onload = evt => {
                let base64 = evt.target.result
                if (chunkCnt === 1) {
                    base64 = base64.split('application/octet-stream').join(file.type)
                } else {
                    base64 = base64.split('base64,')[1]
                }
                console.log('CFU:sendChunk: base64 S = ', base64.substr(0, 50))
                console.log('CFU:sendChunk: base64 E = ', base64.substr(base64.length - 20))
                let key = options['api-upload-chunk']
                let api = datasource.getRequests()[key].api
                const sendData = {
                    'dataset-id': options['dataset-id'],
                    'file-id': fileId,
                    cunky: {
                        base64,
                        binary,
                        chunknumber: chunkCnt
                    }
                }
                // testBase64 += base64
                // onChunkUploadResult() // TEST ON
                datasource.request(uniqueInstanceKey, api, sendData).then(onChunkUploadResult)
            }
            // console.log('CFU:sendChunk: chunkCnt = ', chunkCnt)
            // console.log('CFU:sendChunk: sliceStart, sliceEnd = ', sliceStart, sliceEnd)
            const slice = file.slice(sliceStart, sliceEnd)
            reader.readAsDataURL(slice)
        }

        const onFileUploadFinalized = () => {
            resultList.push('Upload finalized successful! :-)')
            fireResult()
        }

        const finalizeUpload = () => {
            console.log('R2UH:finalizeUpload options = ', options)
            let key = options['api-upload-finalize']
            let api = datasource.getRequests()[key].api
            const sendData = {
                'file-id': fileId,
                cunky: {
                    totalchunks: numOfChunks
                }
            }
            datasource.request(uniqueInstanceKey, api, sendData).then(onFileUploadFinalized)
        }

        // finalize
        // add to ds

        initializeFile()

        // +++++++++++++++++++++++++
        // +++++++++++++++++++++++++
        // +++++++++++++++++++++++++
        // +++++++++++++++++++++++++
    }

    // Upload API v.2 / anonymous upload and attach file to ds when finished
    //     Initialize Chunk Upload
    // POST /files/multipart

    // Upload Chunk
    // PUT /files/multipart/{file_id}?part=<number>

    // Finish Chunked Upload
    // POST /files/multipart/{file_id}?parts=<total_number_of_parts>

    // Delete File
    // DELETE /files/

    // {file_id}

    // add file to ds:

    // Update (metadata and adding/removing files) of latest version
    // PUT /datasets/{dataset_uuid}
    // body: dataset mit modification date, metadata, and files
    // wobei neue Files mit storageLocation: <staging file id> hinzugefügt werden.
    // sample:
    // {
    // "modificationDate": "2020-08-18T07:34:25.527741Z",
    // "metadata": {
    // "title": "Test title",
    // "authors": [
    // {
    // "givenName": "First Name",
    // "familyName": "Last Name",
    // "nameIdentifier": null,
    // "affiliations": null
    // }
    // ]
    // },
    // "files": [
    // {
    // "storageLocation": "uuid of staging file"
    // }
    // ]

    this.startChunkedUpload = (file, options) => {
        console.log('R2:startChunkedUpload file, options = ', file, options)
        new ChunkFileUploadHandler(file, options)
    }
}

export default R2D2DataHandler
