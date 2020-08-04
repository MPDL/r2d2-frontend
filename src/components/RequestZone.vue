<template>
    <div class="request-zone">
        <b-tabs :key="uKey" v-model="tabIndex">
            <b-tab v-for="(request, index) in requests" :key="index" class="tab hide-scrollbar">
                <template v-slot:title>
                    <div class="title">
                        <div class="tiny-close" @click="onClickRemove(request.key)">
                            <div class="icon">x</div>
                        </div>
                        {{ request.label }}
                    </div>
                </template>
                <div class="info">
                    <div class="description">{{ request.description }}</div>
                    <div class="seperator">::</div>
                    <div class="send">
                        <b-button class="bt-send" :class="{ click: mousedown }" size="sm" @click="onClick(request.key)">
                            Send
                        </b-button>
                    </div>
                </div>
                <div class="target">
                    <span>api-target: {{ request.api.target }}</span>
                    <br />
                    <span>api-method: {{ request.api.method }}</span>
                </div>
                <div class="scoll-area-edge"></div>
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
                                <r2-chunky :config="item" :form="request.form" />
                            </b-input-group>

                            <b-input-group
                                v-if="item.type === 'input'"
                                size="sm"
                                :prepend="item.prepend"
                                :append="item.append"
                            >
                                <b-form-input
                                    :id="item.key"
                                    :placeholder="item.placeholder"
                                    v-model="item.selected"
                                ></b-form-input>
                            </b-input-group>

                            <b-input-group
                                v-if="item.type === 'textarea'"
                                :prepend="item.prepend"
                                :append="item.append"
                            >
                                <b-form-textarea
                                    :id="item.key"
                                    v-model="item.selected"
                                    :placeholder="item.placeholder"
                                    :rows="item.rows"
                                    :max-rows="item.maxRows"
                                ></b-form-textarea>
                            </b-input-group>

                            <b-input-group
                                v-if="item.type === 'dropdown'"
                                :prepend="item.prepend"
                                :append="item.append"
                            >
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
                                <b-form-datepicker
                                    :id="item.key"
                                    v-model="item.selected"
                                    class="mb-2"
                                ></b-form-datepicker>
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
                        </b-form-group>
                    </div>
                </vue-custom-scrollbar>
                <div class="scoll-area-edge"></div>
            </b-tab>
        </b-tabs>
    </div>
</template>

<script>
import vueCustomScrollbar from 'vue-custom-scrollbar'
import R2Chunky from '@/components/R2Chunky.vue'
export default {
    name: 'SearchZone',
    components: {
        vueCustomScrollbar,
        R2Chunky
    },
    data() {
        return {
            requests: {},
            mousedown: false,
            uKey: 0,
            ddSelected: 0,
            tix: null,
            tme: null
        }
    },
    created() {
        this.updateRequests()
        console.log('SZ:created this.requests = ', this.requests)
    },
    methods: {
        update() {
            this.uKey = this.uKey > 1000 ? 1 : ++this.uKey
        },
        updateTabActiveState() {
            // TODO unify this (redundant in result and request zone)
            let $sel = $('.request-zone .nav-item')
            $sel.removeClass('active')
            clearTimeout(this.tme)
            this.tme = setTimeout(() => {
                $sel = $('.request-zone .nav-item')
                $sel.removeClass('active')
                $($sel[this.tabIndex]).addClass('active')
            }, 100)
        },
        updateRequests() {
            this.requests = datasource.getRequests()
            console.log('obj:updateRequests this.requests = ', this.requests)
            this.update()
            this.updateTabActiveState()
        },
        onClickRemove(key) {
            datasource.removeRequestByKey(key)
            this.updateRequests()
        },
        getApi(key) {
            return this.requests[key].api
        },

        collectData(key) {
            let res = {}
            _.each(this.requests[key].form, item => {
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
            this.updateRequests()
        },
        onClick(key) {
            this.mousedown = true
            setTimeout(() => (this.mousedown = false), 100)
            this.sendForm(key)
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
    },
    computed: {
        // TODO unify this (redundant in result and request zone)
        tabIndex: {
            get() {
                return this.tix
            },
            set(index) {
                this.tix = index
                this.updateTabActiveState(index)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.request-zone {
    background-color: rgb(235, 250, 255);
    border: 1px solid #b9d3dc;
    border-radius: 5px;
    // this keeps the close buttons visible on top
    // TODO find better solution or dont use bootstrap tabs
    // if you want this look!
    padding-top: 6px;
    margin-top: -6px;
}
</style>
