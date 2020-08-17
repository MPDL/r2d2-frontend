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
        key = !key && data ? data.id : key
        ppStates.selectedDataset.key = key
        ppStates.selectedDataset.data = data
    }
    this.ppGetSelectedDataset = () => ({
        key: ppStates.selectedDataset.key,
        data: ppStates.selectedDataset.data
    })
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
            _.each(data.files, (value, index) => {
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

    const metadata = {
        title: 'drag 4',
        authors: [
            {
                givenName: 'Markus',
                familyName: 'Haarländer',
                nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
                affiliations: [
                    {
                        id: null,
                        organization: '',
                        department: ''
                    }
                ]
            }
        ],
        doi: 'n(a',
        description: 'fourth try to create a dataset via drag',
        genres: [''],
        keywords: [''],
        license: '',
        language: '',
        correspondingPapers: [
            {
                title: '',
                url: null,
                type: null,
                identifier: null,
                identifierType: null
            }
        ]
    }

    this.getDataOfDataset = (file, options = {}) => {
        return file || null
    }

    // ++++++++++++++++++++++++++
    // +++++++ upload handler
    // ++++++++++++++++++++++++++

    // TODO Cleanup after work in progress

    const pendingUploads = {}

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
                let key = options['api-follow']
                let api = datasource.getRequests()[key].api
                const sendData = {
                    'dataset-id': options['dataset-id'],
                    'file-id': fileId,
                    cunky: {
                        base64,
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

        initializeFile()

        // +++++++++++++++++++++++++
        // +++++++++++++++++++++++++
        // +++++++++++++++++++++++++
        // +++++++++++++++++++++++++
    }

    this.startChunkedUpload = (file, options) => {
        console.log('R2:startChunkedUpload file, options = ', file, options)
        new ChunkFileUploadHandler(file, options)
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

        return requests
    }

    // ++++++++++++++++++++++++++
    // +++++++ meta form handler
    // ++++++++++++++++++++++++++

    const MetaFormHandler = function() {
        const printout = (lv, key, value, $tree = null) => {
            let pre = ''
            while (lv--) {
                pre += '-'
            }
            pre += ' '
            console.log('SCAN: ---------------  ')
            console.log('SCAN: pre, tree = ', pre, $tree)
            console.log('SCAN: pre, key, value = ', pre, key, value)
        }

        const getFormItem = (tree, value, args) => {
            const path = tree.reduce((acc, val) => (_.isString(val) ? `${acc}.${val}` : acc))
            console.log('getFormat: path = ', path)
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
                    parent: args.parent,
                    index: args.index
                },
                selected: value,
                key,
                sendKey: key, // ??
                label: tree.join('.') // TEST
            }
            item = { ...item, ...add }
            if (item.type === 'dropdown') {
                item = globals.setupDropdownFormCell(item)
            }
            return item
        }

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
                            department: 'department 1'
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
                givenName: {},
                familyName: {},
                nameIdentifier: {},
                affiliations: {
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
                console.log('CST: key = ', key)
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
                    console.log('SRD: key = ', key)
                    node = { key, sub: [] }
                    target[key] = node
                    sortRawDataByTree(val, target[key].sub, reference)
                })
                console.log('SRD: target = ', target)
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

        // TODO implement a recursive filter for undefined values
        // happens when raw input data vs. schema keys missing

        let form = {}
        const scanAndCreateForm = (node, level = 1, tree = []) => {
            _.each(node, obj => {
                if (obj) {
                    while (tree.length > level) {
                        tree.pop()
                    }
                    tree[level - 1] = obj.key
                    if (obj.sub) {
                        scanAndCreateForm(obj.sub, level + 1, tree)
                    } else {
                        const item = getFormItem(tree, obj.value, {
                            level
                        })
                        const path = tree.reduce((acc, val) => `${acc}.${val.toString()}`)
                        form[path] = item
                    }
                }
            })
        }

        createSortingTree(schema, sortingTree)
        sortRawDataByTree(metadata, sortedData, sortingTree)
        console.log('SRT: sortedData = ', sortedData)
        scanAndCreateForm(sortedData)
        console.log('obj:fc form = ', form)
        this.getForm = () => form
    }
    this.getMetaFormHandler = () => new MetaFormHandler()
}
export default R2D2DataHandler
