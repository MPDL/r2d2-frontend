<template>
    <div class="meta-component">
        <FormCell
            v-if="hasData"
            class="form"
            :key="uKey"
            :request="metaFormConfig"
            @onClickFormAction="onFormAction"
        ></FormCell>
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
            hasData: false,
            metaFormConfig: {},
            uKey: 0,
            hasData: false
        }
    },
    created() {
        if (this.config.setup && this.config.setup.data) {
            const setup = this.config.setup
            this.hasData = true
            globals.eventBus.$on('beforeCollectData', this.prepareCollectData)
            globals.eventBus.$on(setup.clearFormEventKey, this.onClearForm)
            this.metaFormConfig = {
                // TODO add metadata persist option here !
                form: r2.getMetaFormHandler().getForm(setup.data, setup.schema)
            }
        }
        r2 = globals.getDataHandler('r2d2')
    },
    mounted() {
        this.formKey++
    },
    beforeDestroy() {
        this.clearForm('beforeDestroy')
        // !! always destroy global events WITH target function,
        // otherwise the global event ist removed completely for all component instances !
        globals.eventBus.$off('beforeCollectData', this.prepareCollectData)
        if (this.config.setup) {
            globals.eventBus.$off(this.config.setup.clearFormEventKey, this.onClearForm)
        }
        this.hasData = false
    },
    methods: {
        onClearForm (){
            this.clearForm('clear-event')
        },
        clearForm(source) {
            this.metaFormConfig.form = null
            if (this.config.setup) {
                this.config.setup.data = null
            }
        },
        prepareCollectData(evt) {
            if (evt.key === this.$keys[0]) {
                this.config.selected = r2.getMetaFormHandler().getData()
            }
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
        $keys() {
            return this.config.key.split('--')
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
    .hide {
        display: none;
    }
}
</style>
