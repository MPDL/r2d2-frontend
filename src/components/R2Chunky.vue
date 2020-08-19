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
let r2
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
        r2 = globals.getDataHandler('r2d2')
        // console.log('CKY:created this.config = ', this.config)
        // console.log('CKY:created this.form = ', this.form)
    },
    methods: {
        onClickSend() {
            console.log('CKY:onClickSend this.config = ', this.config)
            console.log('CKY:onClickSend this.config.options = ', this.config.options)
            console.log('CKY:onClickSend this.form = ', this.form)
            const options = {
                // api v.1
                // 'api-initial': this.config.options['api-initial'],
                // 'api-follow': this.config.options['api-follow'],
// api v.2
                'api-upload-initial': this.config.options['api-upload-initial'],
                'api-upload-chunk': this.config.options['api-upload-chunk'],
                'api-upload-finalize': this.config.options['api-upload-finalize'],
                'dataset-id': this.form['dataset-id'].selected,
                'file-id': this.form['file-id'].selected,
                'num-of-chunks': this.form['num-of-chunks'].selected,
                resultEventKey: this.config.key.split('--')[0]
            }

            console.log('CKY:onClickSend options = ', { ...options })

            r2.startChunkedUpload(this.fileReference, options)
        },
        onFileSelect(event) {
            this.fileReference = event.target.files[0]
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.upload-component {
    //
}
</style>
