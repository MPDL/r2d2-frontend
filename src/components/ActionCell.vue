<template>
    <div class="action-cell" :class="{ 'tabs-hidden': !showTabs }">
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
                <div v-if="showApiInfo" class="target">
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
                                <r2-chunky :config="item" />
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
                <vue-custom-scrollbar class="scroll-area">
                    <div class="list-pane" :key="rsKey">
                        <div
                            v-for="(item, index) in request.result"
                            :key="index"
                            class="info"
                            @click="onClickListItem(item)"
                        >
                            <div class="description">{{ item.label }}</div>
                            <div class="seperator">::</div>

                            <!-- <div class="seperator">::</div>
                    <div class="send">
                        <b-button class="bt-send" :class="{ click: mousedown }" size="sm" @click="onClick(request.key)">
                            Send
                        </b-button>
                    </div> -->
                        </div>
                    </div>
                    <!-- <div class="view-pane" :key="rsKey">{{ request.result }}</div> -->
                    <!-- <vue-json-pretty :data="request.result"></vue-json-pretty> -->
                </vue-custom-scrollbar>
                <div class="scoll-area-edge"></div>
            </b-tab>
        </b-tabs>
    </div>
</template>

<script>
import vueCustomScrollbar from 'vue-custom-scrollbar'
import R2Chunky from '@/components/R2Chunky.vue'
import VueJsonPretty from 'vue-json-pretty'

export default {
    name: 'ActionCell',
    components: {
        vueCustomScrollbar,
        R2Chunky,
        VueJsonPretty
    },
    props: {
        config: {
            requests: {
                type: Object,
                default: {
                    result: ''
                }
            },
            options: {
                type: Object,
                default: {
                    result: ''
                }
            }
        }
    },
    data() {
        return {
            // requests: {},
            mousedown: false,
            uKey: 0,
            rsKey: 0,
            ddSelected: 0,
            tix: null,
            tme: null
        }
    },
    created() {
        globals.eventBus.$on('onLoadResults', this.updateResults)
        // this.updateRequests()
        console.log('SZ:created this.requests = ', this.requests)
    },
    methods: {
        update(updateKey = 'uKey') {
            this[updateKey] = this[updateKey] > 1000 ? 1 : ++this[updateKey]
        },
        updateTabActiveState() {
            // TODO unify this (redundant in result and request zone)
            let $sel = $('.action-cell .nav-item')
            $sel.removeClass('active')
            clearTimeout(this.tme)
            this.tme = setTimeout(() => {
                $sel = $('.action-cell .nav-item')
                $sel.removeClass('active')
                $($sel[this.tabIndex]).addClass('active')
            }, 100)
        },
        updateRequests() {
            this.requests = datasource.getRequests()
            console.log('AC:updateRequests this.requests = ', this.requests)
            this.update()
            this.updateTabActiveState()
        },
        updateResults(evt) {
            // console.log('AC:updateResults evt = ', evt)
            // console.log('AC:updateResults evt.data = ', evt.data)
            // console.log('AC:updateResults evt.key = ', evt.key)
            // // console.log('AC:updateResults this.config.requests[evt.key] = ', this.config.requests[evt.key])

            if (this.config.requests[evt.key]) {
                console.log('AC:updateResults evt = ', evt)
                console.log('AC:updateResults evt.data = ', evt.data)
                console.log('AC:updateResults evt.key = ', evt.key)
                let res = _.isFunction(this.config.getResult) ? this.config.getResult(evt.data) : evt.data
                // res = JSON.stringify(res)
                this.config.requests[evt.key].result = res
                // console.log('AC:updateResults res = ', res)
                console.log('AC:updateResults evt.key = ', evt.key)
                console.log('AC:updateResults this.config.requests[evt.key] = ', this.config.requests[evt.key])

                console.log(
                    'AC:updateResults this.config.requests[evt.key].result = ',
                    this.config.requests[evt.key].result
                )
                this.update('rsKey')
            }
        },
        onClickListItem(item) {
            this.$emit('onClickListItem', {
                item
            })
            console.log('AC:onClickListItem item = ', item)
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
            // console.log('AC:sendForm this.config.requests[key].result = ', this.config.requests[key].result)
            // console.log('AC:sendForm this.config.requests[key] = ', this.config.requests[key])
            // this.updateRequests()
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
        },
        requests() {
            console.log('AC:requests this.config.requests = ', this.config.requests)
            return this.config.requests
        },
        showApiInfo() {
            return this.config.options.showApiInfo !== false
        },
        showTabs() {
            return this.config.options.showTabs !== false
        }
    }
}
</script>

<style lang="scss" scoped>
.action-cell {
    background-color: rgb(235, 250, 255);
    border: 1px solid #b9d3dc;
    border-radius: 5px;
    // this keeps the close buttons visible on top
    // TODO find better solution or dont use bootstrap tabs
    // if you want this look!
    padding-top: 6px;
    margin-top: -6px;
    &.tabs-hidden {
        ::v-deep {
            .nav-tabs {
                display: none;
            }
        }
    }
    .list-pane {
        background-color: rgb(248, 255, 250);
        height: 400px;
        .info {
            margin-bottom: 5px;
            cursor: pointer;
        }
    }
}
</style>
