<template>
    <div class="request-zone">
        <!-- <div class="overlay tiny-close">
            <div class="icon">x</div>
        </div> -->
        <!-- <div class="spacer-top"></div> -->
        <b-tabs>
            <b-tab v-for="(request, index) in requests" :key="index" class="tab hide-scrollbar">
                <template v-slot:title>
                    <div class="title">
                        <div class="tiny-close">
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
                <div class="target">api-target: {{ apiBase }}{{ request.api.target }}</div>
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
                                    v-model="item.selected"
                                    :state="Boolean(item.selected)"
                                    :placeholder="item.placeholder"
                                    :drop-placeholder="item.placeholder"
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
export default {
    name: 'SearchZone',
    components: {
        vueCustomScrollbar
    },
    data() {
        return {
            requests: {},
            mousedown: false
        }
    },
    created() {
        this.requests = datasource.getRequests()
        console.log('SZ:created this.requests = ', this.requests)
    },
    methods: {
        getApi(key) {
            return this.requests[key].api
        },
        collectData(key) {
            // TODO add here api collect model later
            const res = {}
            _.each(this.requests[key].form, item => {
                if (!_.isUndefined(item.selected)) {
                    res[item.key] = item.selected
                }
                console.log('SZ:collectData item.selected = ', item.selected)
            })
            return res
        },
        async sendForm(key) {
            console.log('SZ:sendForm this.getApi(key) = ', this.getApi(key))
            console.log('SZ:sendForm this.getApi(key).target = ', this.getApi(key).target)
            console.log('SZ:sendForm key = ', key)
            // datasource.send(key, this.getApi(key).target, this.collectData(key))
            await datasource.request(key, this.getApi(key).target, this.collectData(key))
            this.requests = datasource.getRequests()
        },
        onClick(key) {
            this.mousedown = true
            setTimeout(() => (this.mousedown = false), 100)
            this.sendForm(key)
        }
    },
    computed: {
        apiBase(key) {
            return datasource.getConfig().apiBase
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
    ::v-deep {
        .nav {
            flex-wrap: nowrap;
            .nav-link.active {
                .tiny-close {
                    visibility: visible;
                }
            }
        }
        .nav-tabs {
            flex-wrap: nowrap;
            white-space: nowrap;
            scrollbar-width: none;
            overflow-x: auto;
            padding-top: 6px;
            width: calc(100% - 20px);
            margin-left: 10px;
            &::-webkit-scrollbar {
                display: none;
            }
            .nav-link {
                border: 1px solid #4950571c;
            }
        }
    }
    .spacer-top {
        height: 10px;
    }

    .tiny-close {
        border: 1px solid #8ec3c3;
        width: 15px;
        height: 15px;
        padding: 0;
        line-height: 15px;
        border-radius: 100%;
        float: right;
        margin-top: -14px;
        margin-right: -22px;
        visibility: hidden;
        background-color: #fff;
        .icon {
            text-align: center;
            vertical-align: middle;
            line-height: 11px;
            font-weight: bold;
            font-size: 12px;
            color: #539dab;
        }
        ::v-deep {
            .close {
                transform: scale(0.75);
                position: relative;
            }
        }
    }

    .tab {
        margin: 10px;
        display: flex;
        flex-direction: column;
        height: calc(100% - 100px);

        .alert {
            padding: 0.5rem 0.5rem;
            display: inline-block;
            width: max-content;
            max-width: 100%;
        }
        .scoll-area-edge {
            height: 1px;
            border-top: 1px dashed #50bbe4;
            margin: 10px 0px 10px 0px;
        }
        .info {
            display: flex;
            flex-direction: row;
            background-color: #fff;
            padding: 5px 10px 5px 10px;
            border: 1px solid #7fb6d0;
            border-radius: 5px;
            .description {
                flex-grow: 1;
            }
            .send {
                align-self: center;
                .bt-send {
                    position: relative;
                    padding: 2px 10px 2px 10px;
                    background-color: #4fa7c1;
                    &:hover {
                        background-color: #3a859b;
                    }
                    // &:active, // ths dont works on tap!!
                    &.click {
                        // use this to get the tap state also
                        background-color: #cde7ef;
                        color: #3a3838;
                    }
                }
            }
            .seperator {
                align-self: center;
                position: relative;
                padding: 2px 5px 2px 5px;
                border: none;
            }
        }
        .target {
            background-color: #ffffffa3;
            padding: 5px 10px 5px 10px;
            border: 1px solid #7fb6d0;
            border-radius: 5px;
            margin-top: 5px;
            color: #686574;
            font-size: 12px;
        }
        .scroll-area {
            flex-grow: 1;
        }
    }
}
</style>
