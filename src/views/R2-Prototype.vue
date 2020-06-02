<template>
    <div class="r2-prototype">
        <ActionCell class="view login" :config="cfgLogin" :uKey="uKey" />
        <ActionCell
            class="view get-datasets"
            :config="cfgGetDatasets"
            :uKey="uKey"
            @onClickListItem="onClickListItem"
        />
        <!-- <RequestZone class="view" :uKey="uKey" /> -->
        <!-- <ResultZone class="view" /> -->
    </div>
</template>

<script>
// @ is an alias to /src
import ActionCell from '@/components/ActionCell.vue'
import R2D2DataHandler from '@/js/R2D2DataHandler'

const r2 = new R2D2DataHandler()

// import ResultZone from '@/components/ResultZone.vue'
// import RequestZone from '@/components/RequestZone.vue'
// import FunctionCell from '@/components/FunctionCell.vue'

export default {
    name: 'R2-Prototype',
    data() {
        return {
            content: {
                label: 'mock-content',
                data: null
            },
            searchZone: {
                'search-1': {}
            },
            navigation: {},
            uKey: 1,
            cfgLogin: {
                requests: {},
                options: {
                    showTabs: false,
                    showApiInfo: false
                }
            },
            cfgGetDatasets: {
                requests: {},
                options: {
                    showTabs: false,
                    showApiInfo: false
                },
                getResult: data => r2.getDatasets(data, { as: 'key-list' })
            }
        }
    },
    components: {
        ActionCell
    },
    created() {
        this.loadData()
    },
    mounted() {
        // this.loadData()
    },
    methods: {
        update() {
            this.uKey = this.uKey > 1000 ? 1 : ++this.uKey
        },
        onClickListItem(evt) {
            console.log('R2:onClickListItem evt = ', evt)
        },
        setNavigation(nav) {
            this.navigation = nav
        },
        async loadData() {
            // const strc = await datasource.getStructure()
            // console.log('R2:loadData strc = ', strc)
            const requests = datasource.getRequests()

            let rq

            // login
            rq = this.cfgLogin.requests['r2d2-login'] = { ...requests['r2d2-login'] }
            rq.form = {
                username: {
                    type: 'input',
                    label: 'username:',
                    sendKey: 'username',
                    selected: rq.form['dd-auth'].options[0].value.username
                },
                password: {
                    type: 'input',
                    label: 'password:',
                    sendKey: 'password',
                    selected: rq.form['dd-auth'].options[0].value.password
                }
            }
            rq.description = 'login'
            rq.api.schema.data = 'ROOT'

            // get datasets
            rq = this.cfgGetDatasets.requests['r2d2-get-datasets'] = { ...requests['r2d2-get-datasets'] }
            rq.form['keys'].label = 'query:'
            rq.form['keys'].type = 'input'
            // rq.form['keys'].selected = JSON.stringify(rq.form['keys'].selected)
            rq.api.schema.data = ''

            rq.description = 'lists all datasets'
            // rq.api.schema.data = 'ROOT'

            console.log('R2:loadData rq = ', rq)

            // this.cfgLogin.requests['r2d2-login'].options = {

            // }
            console.log('R2:loadData requests = ', requests)

            // this.setNavigation(strc.navigation)
            // this.update()
            // globals.defaultPageReady()
        }
    }
}
</script>

<style lang="scss" scoped>
.r2-prototype {
    .view {
        top: 120px;
        // height: calc(100vh - 170px);
    }
    .action-cell {
        ::v-deep {
            .form-group {
                margin: 0;
                margin-bottom: 12px;
            }
            .col-form-label {
                font-size: 14px;
                color: gray;
                line-height: 10px;
                margin-left: 4px;
            }
        }
        &.login {
            position: absolute;
            left: 10px;
            width: 400px;
            height: 200px;
        }
        &.get-datasets {
            position: absolute;
            left: 10px;
            top: 330px;
            width: 400px;
            height: 600px;
        }
    }
    .request-zone {
        position: absolute;
        left: 10px;
        width: 400px;
    }
    .result-zone {
        position: absolute;
        top: 120px;
        left: 420px;
        width: calc(100vw - 400px - 20px - 170px);
        background-color: white;
    }
}
</style>
