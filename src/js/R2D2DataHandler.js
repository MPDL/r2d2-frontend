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

    // ++++++++++++++++++++++++++
    // +++++++ metadata edit
    // ++++++++++++++++++++++++++

    // "metadata" : {
    //     "title" : "Chunky Test Area :-)",
    //     "authors" : [ ],
    //     "doi" : null,
    //     "description" : "Chunky Test Area :-)",
    //     "genres" : null,
    //     "keywords" : null,
    //     "license" : null,
    //     "language" : null,
    //     "correspondingPapers" : [ ]
    //   },

    // ++++++++++++++++++++++++++
    // +++++++ prototype page
    // ++++++++++++++++++++++++++

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

    // ++++++++++++++++++++++++++
    // +++++++ meta form handler
    // ++++++++++++++++++++++++++

    const MetaFormHandler = function() {
        // TESTDATA
        const metadata = {
            title: 'test metadata',
            authors: [
                {
                    givenName: 'Markus 1',
                    familyName: 'Haarländer 2',
                    nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
                    affiliations: [
                        {
                            id: null,
                            organization: '',
                            department: 0 // select by index test
                        }
                    ]
                },
                {
                    givenName: 'Markus 2',
                    familyName: 'Haarländer 2',
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
            license: 'lcs 123',
            language: ['de', 'ru'],
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
            ]
        }

        // TESTDATA // TODO move to structure
        const schema = {
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
                            options: ['a', 'b', 'c']
                        }
                    },
                    organization: {},
                    id: {}
                }
            },
            correspondingPapers: {
                __0: {
                    dynamicList: true
                },
                title: {},
                url: {},
                type: {},
                identifier: {},
                identifierType: {}
            }
        }

        const sortingTree = []
        const createSortingTree = (source = {}, target = []) => {
            _.each(source, (obj, key) => {
                if (key !== '__0') {
                    const node = { key }
                    if (Object.keys(obj).length <= 1) {
                        target.push(node)
                    } else {
                        node.sub = []
                        target.push(node)
                        createSortingTree(obj, node.sub)
                    }
                }
            })
        }

        let sortedData = []
        const sortRawDataByTree = (source = {}, target = [], reference = []) => {
            let node
            if (_.isArray(source) && _.isPlainObject(source[0])) {
                _.each(source, (val, key) => {
                    node = { key, sub: [] }
                    target[key] = node
                    sortRawDataByTree(val, target[key].sub, reference)
                })
            } else {
                _.each(source, (val, key) => {
                    const index = _.findIndex(reference, { key: key })
                    if (_.isArray(val) && _.isPlainObject(val[0])) {
                        node = { key, sub: [] }
                        target[index] = node
                        sortRawDataByTree(val, target[index].sub, reference[index].sub)
                    } else if (_.isPlainObject(val)) {
                        node = { key, sub: [] }
                        target[index] = node
                        sortRawDataByTree(val, target[index].sub, reference)
                    } else {
                        node = { key, value: val }
                        target[index] = node
                    }
                })
            }
        }

        // this holds the index data of all levels
        // needed to recursive detect when a list ends
        let indexTree = {}
        const createIndexTree = (source, parentTree = null) => {
            _.each(source, node => {
                if (node.sub) {
                    const key = parentTree ? `${parentTree}.${node.key}` : node.key
                    if (_.isString(node.key)) {
                        indexTree[key] = {
                            length: node.sub.length,
                            index: 0
                        }
                    }
                    createIndexTree(node.sub, key)
                }
            })
        }

        let sortedDataWithLayoutElements = []

        const addLayoutElements = (source, target) => {
            _.each(source, node => {
                if (node.sub) {
                    const start = { layout: 'listStart', label: 'Start' }
                    const end = { layout: 'listEnd', label: 'End' }
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
                startList: args.startList === true,
                endList: args.endList === true,
                addList: args.addList === true,
                removeList: args.removeList === true,
                __strc: {
                    level: args.level,
                    class: `level-${args.level}`,
                    tree
                }
            }
            return item
        }

        const getTree = tree => {
            tree = [...tree]
            const res = {
                objectPath: tree.reduce((acc, val) => (isNaN(val) ? `${acc}.${val}` : acc)),
                arrayPath: tree.reduce((acc, val) => `${acc}.${val.toString()}`)
            }
            res.arrayPath0 = res.arrayPath
            if (_.isNumber(_.last(tree))) {
                tree.pop()
                res.tree0 = tree
                res.arrayPath0 = tree.reduce((acc, val) => `${acc}.${val.toString()}`)
            }
            return res
        }

        let form = {}
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
                            const actionDef = _.get(schema, `${getTree(tree).objectPath}.__0`)
                            const isListElement = _.isNumber(_.last(tree))
                            if (actionDef && actionDef.dynamicList) {
                                if (isListElement) {
                                    if (obj.layout === 'listStart') {
                                        items.push(getLayoutItem(tree, { level, startList: true, treeAdd: '_START' }))
                                        items.push(getLayoutItem(tree, { level, removeList: true, treeAdd: '_REMOVE' }))
                                    }
                                    if (obj.layout === 'listEnd') {
                                        items.push(getLayoutItem(tree, { level, endList: true, treeAdd: '_END' }))
                                        const idx = getTree(tree).arrayPath0
                                        indexTree[idx].index++
                                        // if the indexTree.index condition is set, the add tags only appear 
                                        // at the end of a list
                                        // otherwise its set on end of every block
                                        // TODO check usability!
                                        if (true || indexTree[idx].index === indexTree[idx].length) {
                                            items.push(getLayoutItem(tree, { level, addList: true, treeAdd: '_ADD' }))
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
            let item = res && _.isPlainObject(res.__0) ? res.__0 : defaultItem
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

            if (item.type === 'dropdown') {
                item = globals.setupDropdownFormCell(item)
            } else {
                // MOCK just remove the annoying bootstrap propz error :-((
                item.selected = _.isArray(item.selected) ? item.selected.join(',') : item.selected
            }
            if (['SPACER-S', 'SPACER-E'].includes(_.last(tree))) {
                const tr = [...tree]
                tr.pop()
                item.type = 'SP'
                item.label = ''
                item.spLabel = tr.join('.')
                item.key = item.sendKey = null
            }

            return item
        }

        // 1. create a sorting tree by schema
        createSortingTree(schema, sortingTree)
        // 2. move all raw data into correct order by schema
        sortRawDataByTree(metadata, sortedData, sortingTree)
        // 3. create the index-tree for list-length tracking by following recursive functions
        createIndexTree(sortedData)
        // 4. add the basic layout tags (list start/end)
        addLayoutElements(sortedData, sortedDataWithLayoutElements)
        // 5. create the final form and add the add/remove tags (uses the index-tree)
        scanAndCreateForm(sortedDataWithLayoutElements)
        this.getForm = () => form
        // this.getForm = () => {} // TEST ON
    }
    this.getMetaFormHandler = () => new MetaFormHandler()

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
