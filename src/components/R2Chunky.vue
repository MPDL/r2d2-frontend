<template>
    <div class="upload-component">
        <b-form-file
            :placeholder="config.placeholder"
            :drop-placeholder="config.placeholder"
            @change="onFileSelect"
        ></b-form-file>
    </div>
</template>

<script>
export default {
    name: 'Upload',
    components: {},
    props: {
        config: Object
    },
    data() {
        return {
            results: {},
            uKey: 0
        }
    },
    created() {},
    methods: {
        onFileInput() {
            console.log('CKY:onFileInput = ')
        },
        onFileSelect(event) {
            // console.log('IU:previewImage event = ', event)
            // console.log('IU:previewImage event.dataTransfer.getData() = ', event.dataTransfer.getData('text/plain'))
            const input = event.target
            console.log('CKY:previewImage input = ', input)

            if (input.files && input.files[0]) {
                const reader = new FileReader()
                reader.onload = e => {
                    console.log('CKY:previewImage onload e = ', e)
                    const base64 = e.target.result
                    console.log('CKY:previewImage onload base64.substr(0,100) = ', base64.substr(0,100))
                    this.config.selected = base64
                }
                // this.setImageFieldText(input.files[0].name)
                reader.readAsDataURL(input.files[0])
            }
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
