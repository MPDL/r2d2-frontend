<template>
    <div class="meta-component">
        <FormCell class="form" :key="uKey" :request="metaFormConfig" @onClickFormAction="onFormAction"></FormCell>
    </div>
</template>

<script>
//
let r2
//
export default {
    name: 'Metadata',
    props: {
        config: Object
    },
    data() {
        return {
            metaFormConfig: {
                form: {}
            },
            uKey: 0
        }
    },
    created() {
        globals.eventBus.$on('beforeCollectData', this.prepareCollectData)
        r2 = globals.getDataHandler('r2d2')
        this.metaFormConfig.form = r2.getMetaFormHandler().getForm(this.$config.data, this.$config.schema)
    },
    mounted() {
        this.formKey++
    },
    beforeDestroy() {
        globals.eventBus.$off('beforeCollectData', this.prepareCollectData)
    },
    methods: {
        prepareCollectData() {
            this.config.selected =  r2.getMetaFormHandler().getData()
        },
        update(updateKey = 'uKey') {
            this[updateKey] = this[updateKey] > 1000 ? 1 : ++this[updateKey]
        },
        onFormAction(evt) {
            r2.getMetaFormHandler().modifyForm(evt)
            this.metaFormConfig.form = r2.getMetaFormHandler().getForm()
            this.update()
        }
    },
    computed: {
        $config() {
            return this.config && this.config.setup ? this.config.setup : { data: {}, schema: {} }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.meta-component {
    .form {
        border: 1px solid #86b1bd;
        border-radius: 5px;
        padding: 12px;
    }
}
</style>
