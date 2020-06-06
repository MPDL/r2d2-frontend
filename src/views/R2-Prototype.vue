<template>
    <div class="r2-prototype">
        <ActionCell class="view login" :config="cfgLogin" />
        <ActionCell class="view get-datasets" :config="cfgGetDatasets" @onClickListItem="onClickDatasetListItem" />
        <ActionCell
            class="view get-files"
            :config="cfgGetDataset"
            @onClickListItem="onClickFileListItem"
        />
    </div>
</template>

<script>
//
import ActionCell from '@/components/ActionCell.vue'
import R2D2DataHandler from '@/js/R2D2DataHandler'
const r2 = new R2D2DataHandler()
//
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
            dsKey: 1,
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
            },
            cfgGetDataset: {
                requests: {},
                options: {
                    showTabs: false,
                    showApiInfo: false
                },
                getResult: data => r2.getFilesOfDataset(data, { as: 'key-list' }),
                sendFormEventKey: 'sendform--get-dataset'
            }
        }
    },
    components: {
        ActionCell
    },
    created() {
        this.loadData()
    },
    methods: {
        update(updateKey = 'uKey') {
            this[updateKey] = this[updateKey] > 1000 ? 1 : ++this[updateKey]
        },
        onClickDatasetListItem(evt) {
            const cfg = this.cfgGetDataset
            cfg.requests['r2d2-get-dataset'].form['file-id-select'].selected = evt.item.key
            globals.eventBus.$emit('update--r2d2-get-dataset')
            globals.eventBus.$emit('sendform--get-dataset', 'r2d2-get-dataset')
        },
        onClickFileListItem(evt) {
            console.log('R2:onClickFileListItem evt = ', evt)
        },
        setNavigation(nav) {
            this.navigation = nav
        },
        async loadData() {
            const requests = datasource.getRequests()
            let rq
            // login
            // clone request as its inner data gets mutated !
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
            // clone request as its inner data gets mutated !
            rq = this.cfgGetDatasets.requests['r2d2-get-datasets'] = { ...requests['r2d2-get-datasets'] }
            rq.form['keys'].label = 'query:'
            rq.form['keys'].type = 'value-cell'
            rq.api.schema.data = ''
            rq.description = 'lists all datasets'
            // get files
            // clone request as its inner data gets mutated !
            rq = this.cfgGetDataset.requests['r2d2-get-dataset'] = { ...requests['r2d2-get-dataset'] }
            rq.form['file-id-select'].label = 'dataset-id:'
            rq.form['file-id-select'].type = 'value-cell'
            rq.form['file-id-select'].updateEventKey = 'update--r2d2-get-dataset'
            rq.description = 'lists all files of a dataset'
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
        &.get-files {
            position: absolute;
            left: 420px;
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
