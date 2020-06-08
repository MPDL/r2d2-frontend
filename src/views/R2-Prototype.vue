<template>
    <div class="r2-prototype" :key="uKey">
        <ActionCell class="view login" :config="cfgLogin" />
        <ActionCell class="view get-datasets" :config="cfgGetDatasets" @onClickListItem="onClickDatasetListItem" />
        <ActionCell class="view get-files" :config="cfgGetDataset" @onClickListItem="onClickFileListItem" />
    </div>
</template>

<script>
//
import ActionCell from '@/components/ActionCell.vue'
const r2 = globals.getDataHandler('r2d2')
//
export default {
    name: 'R2-Prototype',
    data() {
        return {
            r2,
            content: {
                label: 'mock-content',
                data: null
            },
            searchZone: {
                'search-1': {}
            },
            navigation: {},
            uKey: 1,
            sdsKey: 1,
            cfgLogin: {
                id: 'r2d2-login',
                requests: {},
                options: {
                    showTabs: false,
                    showApiInfo: false
                }
            },
            cfgGetDatasets: {
                id: 'r2d2-get-datasets',
                requests: {},
                options: {
                    showTabs: false,
                    showApiInfo: false
                },
                getResult: (data, me = this.cfgGetDatasets) => {
                    const key = me.initialRequest ? this.getSelectedDataset(key) : null
                    this.setSelectedDataset(key)
                    me.initialRequest = false
                    return r2.getDatasets(data, { as: 'key-list' })
                },
                selected: this.getSelectedDataset(),
                initialRequest: true
            },
            cfgGetDataset: {
                id: 'r2d2-get-dataset',
                requests: {},
                options: {
                    showTabs: false,
                    showApiInfo: false
                },
                getResult: (data, me = this.cfgGetDataset) => {
                    const key = me.initialRequest ? this.getSelectedFile(key) : null
                    this.setSelectedFile(key)
                    me.initialRequest = false
                    return r2.getFilesOfDataset(data, { as: 'key-list' })
                },

                // getResult: data => r2.getFilesOfDataset(data, { as: 'key-list' }),
                sendFormEventKey: 'sendform--get-dataset',
                selected: this.getSelectedFile(),
                initialRequest: true
            }
        }
    },
    components: {
        ActionCell
    },
    created() {
        console.log('R2P:created evt = ')
        this.loadData()
    },
    methods: {
        update(updateKey = 'uKey') {
            this[updateKey] = this[updateKey] > 1000 ? 1 : ++this[updateKey]
        },
        onClickDatasetListItem(evt) {
            this.setSelectedDataset(evt.item.key)
            globals.eventBus.$emit('sendform--get-dataset', this.cfgGetDataset.id)
        },
        onClickFileListItem(evt) {
            this.setSelectedFile(evt.item.key)
            // this.selectedDataset = evt.key
            console.log('R2P:onClickFileListItem evt = ', evt)
        },
        setNavigation(nav) {
            this.navigation = nav
        },
        async loadData() {
            const requests = await r2.ppGetRequests()
            this.cfgLogin.requests[this.cfgLogin.id] = requests[this.cfgLogin.id]
            this.cfgGetDatasets.requests[this.cfgGetDatasets.id] = requests[this.cfgGetDatasets.id]
            this.cfgGetDataset.requests[this.cfgGetDataset.id] = requests[this.cfgGetDataset.id]
            this.update()
        },
        // computed prop dont works
        setSelectedDataset(key) {
            r2.ppSetSelectedDataset(key)
            this.cfgGetDatasets.selected = key
            //
            const cfg = this.cfgGetDataset
            cfg.requests[cfg.id].form['file-id-select'].selected = key
            globals.eventBus.$emit(`update--${cfg.id}`)
        },
        getSelectedDataset() {
            return r2.ppGetSelectedDataset()
        },
        setSelectedFile(key) {
            r2.ppSetSelectedFile(key)
            this.cfgGetDataset.selected = key
            //
            // const cfg = this.cfgGetDataset
            // cfg.requests[cfg.id].form['file-id-select'].selected = key
            // globals.eventBus.$emit(`update--${cfg.id}`)
        },
        getSelectedFile() {
            return r2.ppGetSelectedFile()
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
