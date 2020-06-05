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
                <FormCell :request="request"></FormCell>
                <div class="scoll-area-edge"></div>
                <vue-custom-scrollbar class="scroll-area">
                    <div class="list-pane" :key="rsKey">
                        <div
                            v-for="(item, index) in filteredResult"
                            :key="index"
                            class="info"
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
import R2Chunky from '@/components/R2Chunky.vue'
import FormCell from '@/components/FormCell.vue'
import VueJsonPretty from '@/lib/vue-json-pretty.1.6.3.js'

export default {
    name: 'ActionCell',
    components: {
        vueCustomScrollbar,
        R2Chunky,
        VueJsonPretty,
        FormCell
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
            ddSelected: 0,
            tix: null,
            tme: null,
            filteredResult: {}
        }
    },
    created() {
        globals.eventBus.$on('onLoadResults', this.updateResults)
    },
    mounted() {
        // TODO this is hardcoded to tab 1 currently, make the persist key dynamic!
        const key = Object.keys(this.config.requests)[0]
        this.updateResults({ key })
    },
    methods: {
        update(updateKey = 'uKey') {
            console.log('AC:updateKey = ', updateKey)
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
            this.update()
            this.updateTabActiveState()
        },
        updateResults(evt) {
            if (this.config.requests[evt.key]) {
                this.filteredResult = {}
                const data = datasource.getConfig().requests[evt.key].result
                if (data) {
                    this.filteredResult = _.isFunction(this.config.getResult) ? this.config.getResult(data) : data
                }
                this.update('rsKey')
            }
        },
        onClickListItem(item) {
            this.$emit('onClickListItem', {
                item
            })
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
        // TODO make the height dynamic
        height: 380px;
        .info {
            margin-bottom: 5px;
            margin-left: 5px;
            cursor: pointer;
            width: calc(100% - 15px);
        }
    }
}
</style>
