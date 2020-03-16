<template>
    <div class="search-zone">
        <b-tabs>
            <b-tab v-for="(search, index) in searches" :key="index" class="tab hide-scrollbar" :title="search.label">
                <div class="info">
                    <div class="description">{{ search.description }}</div>
                    <div class="seperator">::</div>
                    <div class="send">
                        <b-button class="bt-send" :class="{ click: mousedown }" size="sm" @click="onClick(search.key)">
                            Send
                        </b-button>
                    </div>
                </div>
                <div class="scoll-area-edge"></div>
                <vue-custom-scrollbar class="scroll-area">
                    <div class="form-elements">
                        <b-form-group
                            v-for="(item, index) in search.form"
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
    // props: {
    //     config: Object
    // },
    data() {
        return {
            searches: {},
            mousedown: false
        }
    },
    created() {
        this.searches = datasource.getSearches()
        console.log('SZ:created this.searches = ', this.searches)
    },
    methods: {
        getApi(key) {
            return this.searches[key].api
        },

        collectData(key) {
            // TODO add here api collect model later
            const res = {}
            _.each(this.searches[key].form, item => {
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
            await datasource.request(key, 'get', this.collectData(key))
            this.searches = datasource.getSearches()
        },
        onClick(key) {
            this.mousedown = true
            setTimeout(() => (this.mousedown = false), 100)
            this.sendForm(key)
        }
    }
}
</script>

<style lang="scss" scoped>
.search-zone {
    background-color: rgb(235, 250, 255);
    .tab {
        margin: 10px;
        display: flex;
        flex-direction: column;
        height: calc(100% - 100px);
        .alert {
            padding: 0.5rem 0.5rem;
            display: inline-block;
            // width: 100%;
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
        .scroll-area {
            flex-grow: 1;
        }
    }
}
</style>
