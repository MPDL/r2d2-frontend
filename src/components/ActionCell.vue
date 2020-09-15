<template>
    <div class="action-cell tabs-hidden">
        <b-tabs id="fake tabs to keep the styling working">
            <b-tab class="tab hide-scrollbar">
                <div class="info">
                    <div class="description">{{ request.description }}</div>
                    <div v-if="showSend" class="seperator">::</div>
                    <div v-if="showSend" class="send">
                        <b-button class="bt-send" :class="{ click: mousedown }" size="sm" @click="onClick(request.key)">
                            Send
                        </b-button>
                    </div>
                </div>
                <div v-if="showApiInfo" class="target">
                    <span>api-target: {{ request.api.target }}</span>
                    <br />
                    <span>api-method: {{ request.api.methodKey }}</span>
                </div>
                <div class="scoll-area-edge"></div>
                <FormCell
                    :request="request"
                    :key="formKey"
                    @onClickButton="$emit('form-button-clicked', { action: arguments[0].action, key: config.id })"
                ></FormCell>
                <div v-if="showResultList || showResultJson" class="scoll-area-edge"></div>

                <vue-custom-scrollbar v-if="showResultJson" class="scroll-area results">
                    <div class="list-pane" :key="rsKey">
                        <div class="">
                            <vue-json-pretty
                                :data="filteredResult"
                                :show-length="true"
                                :show-line="true"
                                :highlight-mouseover-node="true"
                                :collapsed-on-click-brackets="true"
                            ></vue-json-pretty>
                        </div>
                    </div>
                </vue-custom-scrollbar>

                <vue-custom-scrollbar v-if="showResultList" class="scroll-area results">
                    <div class="list-pane" :key="rsKey">
                        <div
                            v-for="(item, index) in filteredResult"
                            :key="index"
                            class="info"
                            :class="{ selected: listItemIsSelected(item.key) }"
                            @click="onClickListItem(item)"
                        >
                            <div class="description">{{ item.label }}</div>
                            <div class="seperator">::</div>
                        </div>
                    </div>
                </vue-custom-scrollbar>
                <div class="scoll-area-edge"></div>
            </b-tab>
        </b-tabs>
    </div>
</template>

<script>
//
// TODO make the action cell more dynamic (heights etc.)
//
import vueCustomScrollbar from 'vue-custom-scrollbar'
import VueJsonPretty from '@/lib/vue-json-pretty.1.6.3.js'

export default {
    name: 'ActionCell',
    components: {
        vueCustomScrollbar,
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
            mousedown: false,
            uKey: 0,
            rsKey: 0,
            formKey: 0,
            ddSelected: 0,
            tix: null,
            tme: null,
            filteredResult: {}
        }
    },
    created() {
        globals.eventBus.$on('onLoadResults', this.updateResults)
        if (this.config.updateFormEventKey) {
            globals.eventBus.$on(`${this.config.updateFormEventKey}`, this.updateForm)
        }
        if (this.config.sendFormEventKey) {
            globals.eventBus.$on(`${this.config.sendFormEventKey}`, this.sendForm)
        }
    },
    beforeDestroy() {
        globals.eventBus.$off('onLoadResults', this.updateResults)
        globals.eventBus.$off(`${this.config.sendFormEventKey}`, this.sendForm)
        globals.eventBus.$off(`${this.config.updateFormEventKey}`, this.updateForm)
    },
    mounted() {
        this.updateResults({ key: this.config.id })
    },
    methods: {
        update(updateKey = 'uKey') {
            this[updateKey] = this[updateKey] > 1000 ? 1 : ++this[updateKey]
        },
        updateForm(evt) {
            this.update('formKey')
        },
        updateResults(evt) {
            if (evt.key === this.config.id) {
                this.filteredResult = {}
                let data = {}
                if (evt.filteredResult) {
                    data = this.filteredResult = evt.filteredResult
                } else {
                    data =
                        evt.result && evt.result.data
                            ? evt.result.data
                            : datasource.getConfig().requests[evt.key].result

                    if (data) {
                        this.filteredResult = _.isFunction(this.config.getResult) ? this.config.getResult(data) : data
                    }
                }
                this.update('rsKey') // needed to update the own selected state!
                this.$emit('onUpdateResults', { id: this.config.id, raw: data, filtered: this.filteredResult })
            }
        },
        onClickListItem(item) {
            this.$emit('onClickListItem', {
                item
            })
        },
        getApi(key) {
            return _.isFunction(this.config.getApi) ? this.config.getApi(key) : this.config.requests[key].api
        },
        collectData(key) {
            let res = {}
            _.each(this.requests[key].form, item => {
                if (!_.isUndefined(item.selected)) {
                    const ky = item.sendKey === '' ? '___ROOT' : item.sendKey
                    res[ky] = item.selected
                }
            })
            return _.isFunction(this.config.collectData) ? this.config.collectData(res) : res
        },
        async sendForm(key) {
            globals.eventBus.$emit('beforeCollectData', { key })
            const api = this.getApi(key)
            await datasource.request(key, api, this.collectData(key, api.schema))
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
        },
        listItemIsSelected(key) {
            return key === this.config.selected
        }
    },
    computed: {
        requests() {
            return this.config.requests || {}
        },
        request() {
            return this.config.requests[this.config.id] || {}
        },
        options() {
            return this.config.options || {}
        },
        showApiInfo() {
            return this.options.showApiInfo === true
        },
        showTabs() {
            // 2kill
            return this.options.showTabs !== false
        },
        showSend() {
            return this.options.showSend !== false
        },
        showResultList() {
            return this.options.showResultList !== false
        },
        showResultJson() {
            return this.options.showResultJson === true
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
        // TODO make the height dynamic
        // height: 380px;
        .info {
            margin-bottom: 5px;
            margin-left: 5px;
            cursor: pointer;
            width: calc(100% - 15px);
            &.selected {
                background-color: #e8faff;
            }
        }
    }
}
</style>
