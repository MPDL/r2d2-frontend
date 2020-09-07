import DynamicFormHandler from '@/js/DynamicFormHandler'

const R2D2DataHandler = function() {
    //
    const ppStates = {
        selectedDataset: {
            key: null,
            version: null,
            data: null
        },
        selectedFile: {
            key: null
            // data: null
        }
    }
    this.ppSetSelectedDataset = (key = null, version = null, data = null) => {
        let k = [null, 1]
        if (_.isString(key)) {
            // this filteres the version, if included in key
            k = key.split('/')
            key = k[0]
            k[1] = parseInt(k[1])
        }
        version = isNaN(version) ? k[1] : version
        version = isNaN(version) ? 1 : version
        if (!key && data) {
            key = data.id
            version = isNaN(data.versionNumber) ? 1 : data.versionNumber
        }
        const vsKey = key ? `${key}/${version}` : null
        ppStates.selectedDataset = { ...ppStates.selectedDataset, key, vsKey, data, version }
    }
    this.ppGetSelectedDataset = () => ppStates.selectedDataset

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
                    key: value._source.id,
                    version: value._source.versionNumber,
                    title: value._source.metadata.title
                }
                if (options.addVersionToKey) {
                    d.key = `${d.key}/${d.version}`
                }
                d.label = `${d.title} | ${d.key} (vers: ${d.version})`
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
        id = 'r2d2-pp-get-dataset'
        rq = requests[id] = _.cloneDeep(raw[id])
        rq.form['ds-select'].updateEventKey = `update--${id}`
        rq.description = 'lists all files of a dataset'
        //
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

    let metaFormHandler = null
    this.getMetaFormHandler = (create = false) => {
        if (!metaFormHandler || create) {
            metaFormHandler = new DynamicFormHandler()
        }
        return metaFormHandler
    }

    // ++++++++++++++++++++++++++
    // +++++++ upload handler
    // ++++++++++++++++++++++++++

    // TODO move to seperate class file
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
