<template>
    <div class="form-cell">
        <vue-custom-scrollbar class="scroll-area">
            <div class="form-elements">
                <b-form-group
                    v-for="(item, index) in request.form"
                    :key="index"
                    :id="item.key"
                    :label="item.label"
                    :label-for="item.key"
                    :description="item.description"
                >
                    <b-input-group v-if="item.component === 'r2-chunky'">
                        <r2-chunky :config="item" />
                    </b-input-group>

                    <b-input-group v-if="item.type === 'input'" size="sm" :prepend="item.prepend" :append="item.append">
                        <b-form-input
                            :id="item.key"
                            :placeholder="item.placeholder"
                            v-model="item.selected"
                        ></b-form-input>
                    </b-input-group>

                    <b-input-group v-if="item.type === 'textarea'" :prepend="item.prepend" :append="item.append">
                        <b-form-textarea
                            :id="item.key"
                            v-model="item.selected"
                            :placeholder="item.placeholder"
                            :rows="item.rows"
                            :max-rows="item.maxRows"
                        ></b-form-textarea>
                    </b-input-group>

                    <b-input-group v-if="item.type === 'dropdown'" :prepend="item.prepend" :append="item.append">
                        <b-form-select
                            :id="item.key"
                            v-model="item.selected"
                            :options="item.options"
                            size="sm"
                        ></b-form-select>
                    </b-input-group>
                    <b-input-group v-if="item.type === 'tags'" :prepend="item.prepend" :append="item.append">
                        <b-form-tags
                            :id="item.key"
                            v-model="item.selected"
                            :options="item.options"
                            size="md"
                        ></b-form-tags>
                    </b-input-group>
                    <b-input-group v-if="item.type === 'date'">
                        <b-form-datepicker :id="item.key" v-model="item.selected" class="mb-2"></b-form-datepicker>
                    </b-input-group>
                    <b-input-group v-if="item.type === 'multi-select'">
                        <b-form-checkbox-group
                            :id="item.key"
                            class="pointer"
                            v-model="item.selected"
                            :options="item.options"
                        ></b-form-checkbox-group>
                    </b-input-group>
                    <b-input-group v-if="item.type === 'single-select'">
                        <b-form-radio-group
                            :id="item.key"
                            class="pointer"
                            v-model="item.selected"
                            :options="item.options"
                        ></b-form-radio-group>
                    </b-input-group>
                    <b-input-group v-if="item.type === 'file-upload'" class="pointer">
                        <b-form-file
                            :id="item.key"
                            v-model="item.meta"
                            :state="Boolean(item.meta)"
                            :placeholder="item.placeholder"
                            :drop-placeholder="item.placeholder"
                            @input="onFileInput(item)"
                        ></b-form-file>
                    </b-input-group>
                        <value-cell v-if="item.type === 'value-cell'" :config="item" v-model="item.selected"></value-cell>
                </b-form-group>
            </div>
        </vue-custom-scrollbar>
    </div>
</template>

<script>
import vueCustomScrollbar from 'vue-custom-scrollbar'
import R2Chunky from '@/components/R2Chunky.vue'
import ValueCell from '@/components/ValueCell.vue'
import VueJsonPretty from '@/lib/vue-json-pretty.1.6.3.js'

export default {
    name: 'FormCell',
    components: {
        vueCustomScrollbar,
        R2Chunky,
        VueJsonPretty,
        ValueCell
    },
    props: {
        request: Object
    },
    data() {
        return {
            mousedown: false,
            uKey: 0,
            rsKey: 0,
            ddSelected: 0,
            tix: null,
            tme: null
        }
    },
    methods: {
        update(updateKey = 'uKey') {
            this[updateKey] = this[updateKey] > 1000 ? 1 : ++this[updateKey]
        },
        onClickListItem(item) {
            this.$emit('onClickListItem', {
                item
            })
        },
        getApi(key) {
            return this.request.api
        },
        collectData(key) {
            let res = {}
            _.each(this.request.form, item => {
                if (!_.isUndefined(item.selected)) {
                    const ky = item.sendKey === '' ? '___ROOT' : item.sendKey
                    res[ky] = item.selected
                }
            })
            return res
        },
        async sendForm(key) {
            const api = this.getApi(key)
            await datasource.request(key, api, this.collectData(key, api.schema))
        },
        onFileInput(item) {
            const meta = globals.filterObjectByKeys(item.meta, 'type,name,size,lastModified')
            const reader = new FileReader()
            reader.onload = evt => {
                item.selected = {
                    meta,
                    base64: evt.target.result
                }
            }
            reader.readAsDataURL(item.meta)
        }
    }
}
</script>

<style lang="scss" scoped>
.form-elements{
    // TEST ON
    height: 100px;
}
</style>
