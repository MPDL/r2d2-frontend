<template>
    <div class="meta-component">Metadata Component

    </div>
</template>

<script>
//
const r2 = globals.getDataHandler('r2d2')
//
export default {
    name: 'Metadata',
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
        // console.log('CKY:created this.config = ', this.config)
        // console.log('CKY:created this.form = ', this.form)
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
