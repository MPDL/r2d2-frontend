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

    this.getDataOfDataset = (data, options = {}) => {
        return data || null
    }

    // ++++++++++++++++++++++++++
    // +++++++ upload handler
    // ++++++++++++++++++++++++++

    // TODO Cleanup after work in progress

    const pendingUploads = {}

    const ChunkFileUploadHandler = function(data, options) {
        const uKey = 'r2d2-chunkload-fcc001'
        console.log('CFU:ChunkFileUploadHandler data = ', data)
        console.log('CFU:ChunkFileUploadHandler options = ', options)
        const arrayBufferToBase64 = buffer => {
            let binary = ''
            let bytes = new Uint8Array(buffer)
            let len = bytes.byteLength
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i])
            }
            return window.btoa(binary)
        }

        // const loadingTST = file => {
        //     console.log('CFU:loading: file  = ', file)
        //     const reader = new FileReader()
        //     reader.onload = evt => {
        //         let base64 = evt.target.result
        //         // base64 = `${data.type}${base64}`
        //         let key = options['api-initial']
        //         let api = datasource.getRequests()[key].api
        //         const sendData = {
        //             'dataset-id': options['dataset-id'],
        //             'file-id': options['file-id'],
        //             chunknumber: 1,
        //             cunky: {
        //                 base64,
        //                 filename: file.name,
        //                 filesize: file.size
        //             }
        //         }
        //         datasource.request(uKey, api, sendData).then(onUploadResult)
        //     }
        //     // reader.readAsArrayBuffer(file)
        //     reader.readAsDataURL(file)
        // }

        // chunk queue
        // DOC: When chunks, first body must be empty to initialize, then chunking
        let fileToSend = null
        let testFileName = 'chunktest-4.jpg'
        let base64Complete = null
        let splitPoint = 0
        let mockFileId = null

        const sendChunk1 = file => {
            fileToSend = file
            console.log('CFU:sendChunk1: fileToSend  = ', fileToSend)
            const reader = new FileReader()
            reader.onload = evt => {
                let base64 = arrayBufferToBase64(evt.target.result)
                base64Complete = `${data.type};base64,${base64}`
                // console.log('CFU:loading: base64Complete  = ', base64Complete)
                console.log('CFU:loading: base64Complete.length  = ', base64Complete.length)

                splitPoint = Math.floor(base64Complete.length / 2)
                base64 = base64Complete.substr(0, splitPoint - 1)

                let key = options['api-initial']
                let api = datasource.getRequests()[key].api
                const sendData = {
                    'dataset-id': options['dataset-id'],
                    // 'file-id': options['file-id'],
                    'file-id': mockFileId,
                    cunky: {
                        base64: null,
                        //filename: file.name,
                        filename: testFileName,
                        filesize: file.size,
                        totalchunks: 1
                        // chunknumber: 1
                    }
                }
                datasource.request(uKey, api, sendData).then(onUploadResult)
            }
            reader.readAsArrayBuffer(fileToSend)
            // reader.readAsDataURL(input.files[0])
        }

        const onUploadResult = res => {
            mockFileId = res.result.data.id
            sendChunkN()
        }
        // 
        const firstResponse = { // TEST
            id: '2b3b504a-a647-4eee-942a-64cf4eef81bd', // id === new file id
            creationDate: '2020-07-24T08:29:02.807891Z',
            modificationDate: '2020-07-24T08:29:02.807891Z',
            creator: {
                id: '2d0dd850-eabb-43fe-8b8f-1a1b54018738',
                name: 'Test Admin'
            },
            modifier: {
                id: '2d0dd850-eabb-43fe-8b8f-1a1b54018738',
                name: 'Test Admin'
            },
            state: 'INITIATED',
            stateInfo: {
                currentChecksum: null,
                chunks: [],
                expectedNumberOfChunks: 1
            },
            filename: 'chunktest-2.jpg',
            storageLocation: null,
            checksum: null,
            format: null,
            size: 4712
        }
        const secondResponse = { // TEST
            number: 1,
            clientEtag: null,
            serverEtag: 'd41d8cd98f00b204e9800998ecf8427e',
            size: 6302
        }

        const sendChunkN = () => {
            console.log('CFU:sendChunkN:')
            const reader = new FileReader()
            reader.onload = evt => {
                let key = options['api-follow']
                let api = datasource.getRequests()[key].api
                // let base64 = base64Complete.substr(splitPoint)
                let base64 = base64Complete
                const sendData = {
                    'dataset-id': options['dataset-id'],
                    // 'file-id': options['file-id'],
                    'file-id': mockFileId,
                    cunky: {
                        base64,
                        chunknumber: 1
                    }
                }
                console.log('CFU:sendChunkN:onload: sendData  = ', sendData)

                datasource.request(uKey, api, sendData)
            }
            reader.readAsArrayBuffer(fileToSend)
            // reader.readAsDataURL(input.files[0])
        }

        // +++++++++++++++++++++++++
        // +++++++++++++++++++++++++
        // +++++++++++++++++++++++++
        // +++++++++++++++++++++++++

        function loadingXX(file, callbackProgress, callbackFinal) {
            const chunkSize = 1024 * 1024 // bytes
            let offset = 0
            var size = chunkSize
            var partial
            var index = 0

            if (file.size === 0) {
                callbackFinal()
            }

            console.log('CFU:loading offset = ', offset)
            console.log('CFU:loading file = ', file)
            console.log('CFU:loading file.size = ', file.size)
            while (offset < file.size) {
                partial = file.slice(offset, offset + size)
                const reader = new FileReader()
                reader.size = chunkSize
                reader.offset = offset
                reader.index = index
                reader.onload = function(evt) {
                    // callbackRead(this, file, evt, callbackProgress, callbackFinal)
                    console.log('CFU:loading:onload offset = ', offset)
                    // console.log('CFU:loading:onload evt.target.result = ', evt.target.result)

                    let res = arrayBufferToBase64(evt.target.result)
                    if (offset === 0) {
                        res = `${data.type}${res}`
                        datasource.request(options['api-initial'], res)
                    }

                    console.log('CFU:loading:onload res.substr(0,50) = ', res.substr(0, 50))
                }
                reader.readAsArrayBuffer(partial)
                // reader2 TEST
                console.log('CFU:loading data = ', data)
                console.log('CFU:loading data.type = ', data.type)

                // data:image/jpeg;base64,

                // const reader2 = new FileReader()
                // reader2.onload = function(evt) {
                //     console.log('CFU:loading2:onload evt.target.result = ', evt.target.result)
                // }
                // reader2.readAsDataURL(file)

                offset += chunkSize
                index += 1
            }
        }

        // var file = data
        // var SHA256 = CryptoJS.algo.SHA256.create()
        var counter = 0
        // var self = this
        sendChunk1(
            data,
            function(dta) {
                // var wordBuffer = CryptoJS.lib.WordArray.create(data)
                // SHA256.update(wordBuffer)
                counter += dta.byteLength
                console.log(((counter / file.size) * 100).toFixed(0) + '%')
            },
            function(dta) {
                // console.log('100%')
                // var encrypted = SHA256.finalize().toString()
                // console.log('encrypted: ' + encrypted)
            }
        )
    }

    this.startChunkedUpload = (data, options) => {
        // const md5 = CryptoJS.MD5(data.base64).toString()
        // pendingUploads[md5] = {
        //     md5,
        //     state: null,
        //     handler: new ChunkFileUploadHandler(data)
        // }
        console.log('R2:startChunkedUpload data, options = ', data, options)
        new ChunkFileUploadHandler(data, options)
        // console.log('R2:startChunkedUpload pendingUploads = ', pendingUploads)

        // return data || null
    }

    const arrow = value => {
        console.log('obj:arrow value = ', value)
    }

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
}
export default R2D2DataHandler
