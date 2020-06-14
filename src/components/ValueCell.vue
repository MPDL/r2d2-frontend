<template>
    <div class="value-cell" :class="config.sendKey">
        <div class="text-area">
            <vue-custom-scrollbar class="scroll-area-vc">
                <vue-json-pretty
                    :data="selected"
                    :show-length="true"
                    :show-line="true"
                    :highlight-mouseover-node="true"
                    :collapsed-on-click-brackets="true"
                    :custom-value-formatter="customValueFormatter"
                    @click="handleClick"
                ></vue-json-pretty>
            </vue-custom-scrollbar>
        </div>
    </div>
</template>

<script>
//
import VueJsonPretty from '@/lib/vue-json-pretty.1.6.3.js'
import vueCustomScrollbar from 'vue-custom-scrollbar'
//
export default {
    name: 'ValueCell',
    components: {
        VueJsonPretty,
        vueCustomScrollbar
    },
    props: {
        config: Object
    },
    data() {
        return {
            showAsJson: true,
            uKey: 1
        }
    },
    created() {
        if (this.config.updateEventKey) {
            globals.eventBus.$on(`${this.config.updateEventKey}`, this.update)
        }
        console.log('VC:created this.config = ',this.config)
    },
    beforeDestroy() {
        globals.eventBus.$off(`${this.config.updateEventKey}`, this.update)
    },
    computed: {
        selected: {
            get() {
                let uKey = this.uKey
                const value = this.config.selected
                this.showAsJson = false
                this.dataType = 'String'
                switch (true) {
                    case _.isNumber(value):
                        this.dataType = 'Number'
                        break
                    case _.isPlainObject(value):
                        this.dataType = 'Object'
                        this.showAsJson = true
                        break
                    case _.isArray(value):
                        this.dataType = 'Array'
                        this.showAsJson = true
                }
                return value
            },
            set(value) {
                this.config.selected = this.showAsJson ? JSON.parse(value) : value
            }
        }
    },
    methods: {
        update(updateKey = 'uKey') {
            this[updateKey] = this[updateKey] > 1000 ? 1 : ++this[updateKey]
        },
        handleClick(value) {
            //
        },
        customValueFormatter(value, key, parent) {
            if (!_.isNil(key) && _.isString(value)) {
                value = `"${value}"`
            }
            return value
            // if (data.startsWith('http://')) {
            //     return `<a style="color:red;" href="${data}">"${data}"</a>`
            // }
        }
    }
}
</script>

<style lang="scss" scoped>
.value-cell {
    //
}
</style>
