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
        const metaRawData1 = {
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
            // doi: '12345',
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

        const schema1 = {
            title: {
                __0: {
                    type: 'input',
                    label: 'title',
                    default: 'dedault title'
                }
            },
            description: {},
            language: {},
            doi: {
                default: 'doiiii-123'
            },
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

        const metaRawData2 = {
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

        const schema2 = {
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

        // const schema = schema1
        // const metaRawData = metaRawData1

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

        // TESTDATA
        const metaRawData3 = {
            title: 'test metadata',
            authors: [
                // {
                //     givenName: 'author 1',
                //     familyName: 'foo 1',
                //     nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
                //     affiliations: [
                //         {
                //             id: 'affy-1',
                //             organization: '',
                //             department: 1 // select by index test
                //         }
                //     ]
                // },
                // {
                //     givenName: 'author 2',
                //     familyName: 'foo 2',
                //     nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
                //     affiliationsXX: [
                //         {
                //             id: null,
                //             organization: '',
                //             department: 0 // select by index test
                //         }
                //     ]
                // },
                {
                    givenName: 'author 3',
                    familyName: 'foo 3',
                    nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
                    affiliations: [
                        {
                            id: 'aff-1-id-set',
                            organization: '',
                            department: 'aff department 2'
                        },
                        null,
                        // {
                        //     id: 'zzk-22',
                        //     organization: 'fzdgduzfg',
                        //     department: 'area 51'
                        // },
                        {
                            id: 'aff-3-id-set',
                            organization: 'tizoiho',
                            department: 'aff dp 42'
                        }
                    ]
                }
            ]
        }

        // TESTDATA // TODO move to structure

        const schema3 = {
            description: {
                default: 'default description'
            },
            authors: [
                {
                    __0: {
                        sublist: true
                    },
                    // test1: {},
                    // test2: {},
                    // test3: {},
                    // test4: {},
                    // givenName: {},
                    // familyName: {},
                    givenName: {
                        default: 'default: name-id'
                    },
                    affiliations: [
                        {
                            __0: {
                                sublist: true
                            },
                            // department: {
                            //     __0: {
                            //         // TESTDATA
                            //         type: 'dropdown',
                            //         label: 'authors.affiliations.department TEST',
                            //         sendKey: '',
                            //         options: ['a', 'b', 'c', 'd']
                            //     },
                            //     default: 2
                            // },
                            // organization: { default: 'affy-orgaaa' },
                            id: {
                                default: 'default: affy-id'
                            }
                        }
                    ]
                }
            ]
        }

        const sortRawDataByTree = (srcNnode, tgNode = [], reference = []) => {
            if (_.isArray(srcNnode)) {
                if (srcNnode.length === 0) {
                    srcNnode[0] = _.cloneDeep(reference)
                }
                let index = -1
                _.each(srcNnode, elm => {
                    if (!_.isNil(elm)) {
                        index++
                        tgNode[index] = []
                        sortRawDataByTree(elm, tgNode[index], reference)
                    }
                })
            }
            const missingKeys = {}
            _.each(reference, (rfObj, index) => {
                const key = rfObj.key
                if (_.isNil(srcNnode)) {
                    srcNnode = {}
                }
                if (Object.keys(srcNnode).indexOf(key) > -1) {
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
            _.each(missingKeys, msObj => {
                // this creates the complete structure below every missing node!
                // no need to start a recursion here
                let cloned = _.cloneDeep(reference[msObj.index])
                if (cloned.sub) {
                    cloned.sub = [cloned.sub]
                }
                tgNode[msObj.index] = cloned
            })
        }

        // this holds the index data of all levels
        // needed to recursive detect when a list ends
        let indexTree = {}
        const createIndexTree = (source, parentTree = null) => {
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
                        _.each(node, obj => {
                            if (obj.sub) {
                                const idx = index + 0
                                key = parentTree ? `${parentTree}.${idx}` : idx.toString()
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
            const start = { layout: LY.START_OF_LIST, label: 'Start' }
            const end = { layout: LY.END_OF_LIST, label: 'End' }
            let node2add
            if (_.isArray(source)) {
                target.push(start)
                _.each(source, node => {
                    if (_.isArray(node)) {
                        const targetL2 = []
                        target.push(targetL2)
                        targetL2.push(start)
                        _.each(node, nodeL2 => {
                            // TODO check if this block could be replaced by a direct recursion,
                            // looks a bit redundant !
                            if (_.isArray(nodeL2)) {
                                // go deeper
                                addLayoutElements(nodeL2, targetL2)
                            } else if (nodeL2.sub) {
                                node2add = { key: nodeL2.key, sub: [] }
                                targetL2.push(node2add)
                                // go deeper
                                addLayoutElements(nodeL2.sub, node2add.sub)
                            } else {
                                // finalize recursion here
                                targetL2.push(_.cloneDeep(nodeL2))
                            }
                        })
                        targetL2.push(end)
                    } else if (_.isArray(node.sub)) {
                        node2add = { key: node.key, sub: [] }
                        target.push(node2add)
                        // go deeper
                        addLayoutElements(node.sub, node2add.sub)
                    } else {
                        // finalize recursion here
                        target.push(_.cloneDeep(node))
                    }
                })
                target.push(end)
            }
        }

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

            const schemaTree = []
            _.each(tree, val => {
                schemaTree.push(isNaN(val) ? val : 0)
            })

            const res = {
                tree: [...tree],
                schemaTree,
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
            let t
            let n = null
            t = [...res.indexEndingTree].reverse()
            while (t.length > 1) {
                const v = t.pop()
                if (_.isString(v)) {
                    n = n ? `${n}.${v}` : v
                } else {
                    n = `${n}[${v}]`
                }
            }
            let e = null
            t = [...res.tree].reverse()
            while (t.length > 0) {
                const v = t.pop()
                if (_.isString(v)) {
                    e = e ? `${e}.${v}` : v
                } else {
                    e = `${e}[${v}]`
                }
            }

            res.nodeGetPath = n
            res.endPointGetPath = e
            return res
        }

        const scanAndCreateForm = (source, target = {}, tree = []) => {
            const getCombinedTree = ($tree, $add = []) => {
                const tr = $tree.length > 0 ? [...$tree, ...$add] : [...$add]
                return getTree(tr)
            }
            const getLabelItem = $t => {
                return getFormItem($t.tree, null, {
                    level: $t.tree.length,
                    type: 'label',
                    label: $t.arrayPath
                })
            }
            let t = null
            let index = -1
            let level = null
            _.each(source, node => {
                if (_.isArray(node)) {
                    index++
                    t = getCombinedTree(tree, [index])
                    target[t.arrayPath] = getLabelItem(t)
                    scanAndCreateForm(node, target, t.tree) // OK
                } else if (_.isArray(node.sub)) {
                    t = getCombinedTree(tree, [node.key])
                    target[t.arrayPath] = getLabelItem(t)
                    scanAndCreateForm(node.sub, target, t.tree)
                } else if (node.layout) {
                    const items = []
                    let ly = null
                    level = tree.length
                    switch (node.layout) {
                        case LY.START_OF_LIST:
                            ly = getLayoutItem(tree, { level, addBlock: true, treeAdd: LY.ADD })
                            level > 1 ? items.push(ly) : null
                            //
                            ly = getLayoutItem(tree, { level, startBlock: true, treeAdd: LY.START })
                            items.push(ly)
                            //
                            ly = getLayoutItem(tree, { level, removeBlock: true, treeAdd: LY.REMOVE })
                            level > 1 ? items.push(ly) : null
                            break
                        case LY.END_OF_LIST:
                            ly = getLayoutItem(tree, { level, startBlock: true, treeAdd: LY.END })
                            items.push(ly)
                            //
                            t = getCombinedTree(tree)

                            const indexInfo = indexTree[t.keyEndingArrayPath]
                            if (indexInfo) {
                                indexInfo.index++
                                ly = getLayoutItem(tree, { level, addBlock: true, treeAdd: LY.ADD })
                                level > 1 ? items.push(ly) : null
                                // set a additional add (+1) tag ad the end of the list
                                if (indexInfo.index >= indexInfo.length) {
                                    const tr = [...tree]
                                    let last = tr.pop()
                                    last++
                                    if (!isNaN(last) && level > 1) {
                                        tr.push(last)
                                        ly = getLayoutItem(tr, { level, addBlock: true, treeAdd: LY.ADD })
                                        items.push(ly)                                       
                                    }
                                }
                                indexInfo.index >= indexInfo.length
                            }
                            break
                    }
                    _.each(items, item => {
                        target[item.__strc.tree.join('.')] = item
                    })
                } else {
                    t = getCombinedTree(tree, [node.key])
                    target[t.arrayPath] = getFormItem(t.tree, node.value, { level: tree.length })
                }
            })
        }

        const getFormItem = (tree, value, args) => {
            const res = _.get(schema, getTree(tree).schemaTree)
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
            // 3. create the index-tree for list-length tracking by following recursive functions
            createIndexTree(d)
            console.log('INIT:createNewForm indexTree = ', indexTree)
            // 4. add the basic layout tags (list start/end)
            addLayoutElements(d, sortedDataWithLayoutElements)
            console.log('INIT:ALE:createNewForm sortedDataWithLayoutElements = ', sortedDataWithLayoutElements)
            console.log('INIT:ALE:createNewForm sortedData = ', sortedData)
            // 5. create the final form and add the add/remove tags (uses the index-tree)
            scanAndCreateForm(sortedDataWithLayoutElements, form)
            console.log('INIT:SCR: form = ', form)
        }

        const schema = schema3
        const metaRawData = metaRawData3

        initialize()
        createNewForm(metaRawData)

        this.getForm = () => form
        // this.getForm = () => {} // TEST ON

        const collectData = () => {
            const res = {}
            const filtered = {}
            const depthSorted = []
            _.each(form, (obj, key) => {
                if (obj.type !== 'LY' && obj.type !== 'label') {
                    filtered[key] = obj
                }
            })
            // sort by depth
            // this takes care that later appearing, less-depth nodes
            // overwrite already written deeper nodes!
            const depthSortOnLevel = (source, depth = 1) => {
                _.each(source, (obj, key) => {
                    if (key.split('.').length === depth) {
                        depthSorted.push({ key, obj })
                        delete source[key]
                    }
                })
                if (Object.keys(source).length > 0) {
                    depthSortOnLevel(source, depth + 1)
                }
            }
            depthSortOnLevel(filtered)
            //
            _.each(depthSorted, obj => {
                const value = form[obj.key]
                const t = getTree(obj.key)
                const tree = t.tree.reverse()
                const sTree = t.schemaTree.reverse()
                const path = []
                const sPath = []
                while (tree.length) {
                    const p1 = tree.pop()
                    const p2 = tree.pop()
                    const sp1 = sTree.pop()
                    const sp2 = sTree.pop()
                    path.push(p1)
                    sPath.push(sp1)
                    if (_.isArray(_.get(schema, sPath))) {
                        path.push(p2)
                        sPath.push(sp2)
                    }
                }
                // TODO set the collect-format optionally here!
                // _.set(res, path, { selected: value.selected })
                _.set(res, path, value.selected)
            })
            return res
        }

        const nodeJob = (action, data, tree, args = {}) => {
            // add at index
            // shift by index delta
            const tr = [...tree]
            const key = tr.pop()
            let node = data
            const isArrayNode = !isNaN(key)

            tr.reverse()
            while (tr.length) {
                const n = tr.pop()
                node = node[n]
            }

            switch (action) {
                case 'remove': // ok
                    isArrayNode ? node.splice(key, 1) : delete node[key]
                    break
                case 'add': // ok
                    console.log('NJ:fc isArrayNode = ', isArrayNode)
                    console.log('NJ:fc tree = ', tree)
                    console.log('NJ:fc node = ', node)
                    console.log('NJ:fc key = ', key)
                    isArrayNode ? node.splice(key, 0, true) : null
                    break

                // arr.splice(index, 0, item);
            }
            return true
        }

        this.modifyForm = args => {
            const meta = collectData()
            args.tree.pop()
            if (args.action === 'removeBlock') {
                nodeJob('remove', meta, args.tree)
            }

            switch (args.action) {
                case 'removeBlock':
                    nodeJob('remove', meta, args.tree)
                    break
                case 'addBlock':
                    nodeJob('add', meta, args.tree)
                    break
            }
            createNewForm(meta)
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
