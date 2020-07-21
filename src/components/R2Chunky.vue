<template>
    <div class="upload-component">
        <b-form-file
            :placeholder="config.placeholder"
            :drop-placeholder="config.placeholder"
            @change="onFileSelect"
        ></b-form-file>
        <b-button class="bt-send" size="sm" @click="onClickSend">
            Start upload
        </b-button>
    </div>
</template>

<script>
//
const r2 = globals.getDataHandler('r2d2')
//
export default {
    name: 'Upload',
    components: {},
    props: {
        config: Object,
        form: Object
    },
    data() {
        return {
            results: {},
            uKey: 0,
            fileReference: null
        }
    },
    created() {
        console.log('CKY:created this.config = ', this.config)
        console.log('CKY:created this.form = ', this.form)
    },
    methods: {
        onClickSend() {
            console.log('CKY:onClickSend this.config = ', this.config)
            console.log('CKY:onClickSend this.config.options = ', this.config.options)
            console.log('CKY:onClickSend this.form = ', this.form)
            const options = {
                'api-initial': this.config.options['api-initial'],
                'api-follow': this.config.options['api-follow'],
                'dataset-id': this.form['dataset-id'].selected,
                'file-id': this.form['file-id'].selected
            }
            r2.startChunkedUpload(this.fileReference, options)
        },
        onFileSelect(event) {
            this.fileReference = event.target.files[0]
        },
        onFileSelectXX(event) {
            const input = event.target
            console.log('CKY:onFileSelect input = ', input)
            console.log('CKY:onFileSelect input.files = ', input.files)
            if (input.files && input.files[0]) {
                const reader = new FileReader()
                reader.onload = e => {
                    this.config.selected = {
                        // base64: e.target.result.substr(0, 20),
                        // base64: this.getInitialChunk(e.target.result),
                        base64: e.target.result,
                        filename: input.files[0].name,
                        filesize: e.total,
                        chunknumber: 1 // TEST
                    }
                    console.log('CKY:onFileSelect:onload e.target.result = ', e.target.result)
                    console.log('CKY:onFileSelect:onload this.config.selected = ', this.config.selected)
                }
                // reader.readAsDataURL(input.files[0])
                reader.readAsArrayBuffer(input.files[0])
            }
        },

        getInitialChunk(base64) {
            // base64 = '1234567890'
            console.log('CHK:getInitialChunk base64.length = ', base64.length)
            const splitIndex = Math.ceil(base64.length / 2)
            const chk1 = base64.substr(0, splitIndex)
            const chk2 = base64.substr(splitIndex)
            console.log('CHK:getInitialChunk chk1 = ', chk1)
            console.log('CHK:getInitialChunk chk2 = ', chk2)
            return chk1
        },

        //     PUT http://130.183.216.136/r2d2/datasets/<id>/files/<file_id>
        // header: Authorization, <token from login>
        //     X-File-Chunk-Number, <number of chunk>
        //     etag, <checksum> OPTIONAL
        //     Content-Length, <number of bytes> OPTIONAL
        // body:
        // base64 encoded file
        // returns uploaded filechunk

        // editor.on('fileUploadRequest', evt =>
        // window.datasource.ckUploadFileRequest(evt).then(res => resolveUpload(evt, res))

        // let file = document.getElementById('file').files[0];
        // let fr = new FileReader();
        // let CHUNK_SIZE = 10 * 1024;
        // let startTime, endTime;
        // let reverse = false;
        // fr.onload = function () {
        //     let buffer = new Uint8Array(fr.result);
        //     let timeReg = /\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}/;
        //     for (let i = reverse ? buffer.length - 1 : 0; reverse ? i > -1 : i < buffer.length; reverse ? i-- : i++) {
        //         if (buffer[i] === 10) {
        //             let snippet = new TextDecoder('utf-8').decode(buffer.slice(i + 1, i + 20));
        //             if (timeReg.exec(snippet)) {
        //                 if (!reverse) {
        //                     startTime = snippet;
        //                     reverse = true;
        //                     seek();
        //                 } else {
        //                     endTime = snippet;
        //                     alert(`Log time range: ${startTime} ~ ${endTime}`);
        //                 }
        //                 break;
        //             }
        //         }
        //     }
        // }
        // seek();
        // function seek() {
        //     let start = reverse ? file.size - CHUNK_SIZE : 0;
        //     let end = reverse ? file.size : CHUNK_SIZE;
        //     let slice = file.slice(start, end);
        //     fr.readAsArrayBuffer(slice);
        // }

        uploadFileRequest(ckEvt) {
            const upload = {}
            upload.base64 = ckEvt.data.fileLoader.data
            const cleaned = sanitizeFilename(ckEvt.data.fileLoader.file.name)
            console.log('CKY:ckUploadFileRequest cleaned = ', cleaned)
            if (!cleaned.isUsable) {
                window.alert(`Filetype, filename or ending "${cleaned.postfix}" not valid`)
                return Promise.resolve(resolved => ({}))
            }
            upload.fileName = cleaned.processedName
            upload.key = `${globals.getLocale()}.${globals.getFocusedKey()}`
            return post(config.uploadApi, upload)
                .then(res => {
                    if (res.data.success === true) {
                        res.data.path = `${config.mediaApi}/${upload.key.split('.').join('/')}/${upload.fileName}`
                        res.data.previewPath = `${config.mediaApi}/${res.data.previewKey}/${upload.key
                            .split('.')
                            .join('/')}/${upload.fileName}`
                        res.data.key = upload.key
                    }
                    res.data.error = null
                    return res.data
                })
                .catch(error => {
                    console.warn('CKY:getTranslations ERROR error.message = ', error.message)
                    return {
                        success: false,
                        error: error.message
                    }
                })
        }
    },
    computed: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.upload-component {
    //
}
</style>
