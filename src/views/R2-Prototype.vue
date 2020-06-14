<template>
    <div class="r2-prototype" :key="uKey">
        <ActionCell class="view login" :config="zones.login" />
        <ActionCell class="view get-datasets" :config="zones.getDatasets" @onClickListItem="onClickDatasetListItem" />
        <ActionCell
            class="view get-files"
            :config="zones.getDataset"
            @onClickListItem="onClickFileListItem"
            @onUpdateResults="onZoneUpdateResults"
        />
        <ActionCell
            class="view change-metadata"
            :key="mtKey"
            :config="zones.changeMetadata"
            @onClickListItem="onClickFileListItem"
        />
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
            mtKey: 1,
            zones: {
                login: {
                    id: 'r2d2-login',
                    requests: {},
                    options: {
                        showTabs: false,
                        showApiInfo: false
                    }
                },
                getDatasets: {
                    id: 'r2d2-get-datasets',
                    requests: {},
                    options: {
                        showTabs: false,
                        showApiInfo: false
                    },
                    getResult: (data, me = this.zones.getDatasets) => {
                        const key = me.initialRequest ? this.getSelectedDataset(key) : null
                        this.setSelectedDataset(key)
                        me.initialRequest = false
                        return r2.getDatasets(data, { as: 'key-list' })
                    },
                    selected: this.getSelectedDataset(),
                    initialRequest: true
                },
                getDataset: {
                    id: 'r2d2-get-dataset',
                    requests: {},
                    options: {
                        showTabs: false,
                        showApiInfo: false
                    },
                    getResult: (data, me = this.zones.getDataset) => {
                        const key = me.initialRequest ? this.getSelectedFile(key) : null
                        this.setSelectedFile(key)
                        me.initialRequest = false
                        return r2.getFilesOfDataset(data, { as: 'key-list' })
                    },
                    sendFormEventKey: 'sendform--get-dataset',
                    selected: this.getSelectedFile(),
                    initialRequest: true
                },
                changeMetadata: {
                    id: 'r2d2-pp-change-metadata',
                    requests: {},
                    options: {
                        showTabs: false,
                        showApiInfo: false
                    },
                    getResult: (data, me = this.zones.getDataset) => {
                        const key = me.initialRequest ? this.getSelectedFile(key) : null
                        this.setSelectedFile(key)
                        me.initialRequest = false
                        return r2.getFilesOfDataset(data, { as: 'key-list' })
                    },
                    sendFormEventKey: 'sendform--change-metadata',
                    updateFormEventKey: 'updateform--change-metadata',
                    selected: this.getSelectedFile(),
                    initialRequest: true
                }
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
            this.setSelectedDataset(evt.item.key)
            globals.eventBus.$emit(this.zones.getDataset.sendFormEventKey, this.zones.getDataset.id)
        },
        onClickFileListItem(evt) {
            this.setSelectedFile(evt.item.key)
        },
        setNavigation(nav) {
            this.navigation = nav
        },
        onZoneUpdateResults(evt) {
            console.log('R2P:onZoneUpdateResults IN evt = ', evt)
            if (evt.id === 'r2d2-get-dataset') {
                setTimeout(() => {
                    console.log('R2P:onZoneUpdateResults evt = ', evt)
                    const metadata = r2.getMetadataOfDataset(evt.raw)
                    console.log('R2P:onZoneUpdateResults metadata = ', metadata)
                    //
                    const cfg = this.zones.changeMetadata
                    cfg.requests[cfg.id].form['file-id'].selected = this.getSelectedDataset()
                    cfg.requests[cfg.id].form['metadata'].selected = metadata
                    console.log(
                        'R2P:onZoneUpdateResults:XX file-id selected = ',
                        cfg.requests[cfg.id].form['file-id'].selected
                    )

                    const mdForm = {
                        // 'md-input-1': {
                        //     type: 'input',
                        //     placeholder: 'Add md-input-1 stuff here :-)'
                        // },
                        // 'md-input-2': {
                        //     type: 'input',
                        //     placeholder: 'Add md-input-1 stuff here :-)'
                        // }
                    }

                    cfg.requests[cfg.id].form = { ...cfg.requests[cfg.id].form, ...mdForm }
                    console.log('R2P:onZoneUpdateResults:XX cfg.id = ', cfg.id)
                    console.log('R2P:onZoneUpdateResults:XX cfg.requests[cfg.id].form = ', cfg.requests[cfg.id].form)
                    // globals.eventBus.$emit(`update--${cfg.id}`) // INFO updates only the value cell !
                    console.log('R2P:onZoneUpdateResults:XX cfg.updateFormEventKey = ', cfg.updateFormEventKey)
                    globals.eventBus.$emit(cfg.updateFormEventKey)
                }, 100)
            }
        },
        async loadData() {
            const requests = await r2.ppGetRequests()
            _.each(this.zones, (cfg, key) => {
                cfg.requests[cfg.id] = requests[cfg.id]
            })
            this.update()
        },
        // computed prop dont works
        setSelectedDataset(key) {
            r2.ppSetSelectedDataset(key)
            console.log('R2P:setSelectedDataset key = ', key)
            //
            let cfg
            //
            cfg = this.zones.getDatasets
            cfg.selected = key

            //
            cfg = this.zones.getDataset
            cfg.selected = key
            cfg.requests[cfg.id].form['file-id-select'].selected = key
            globals.eventBus.$emit(`update--${cfg.id}`)

            //
            cfg = this.zones.changeMetadata
            cfg.selected = key
            cfg.requests[cfg.id].form['file-id'].selected = key
            cfg.requests[cfg.id].form['metadata'].selected = null
            globals.eventBus.$emit(`update--${cfg.id}`)
            //
        },
        getSelectedDataset() {
            return r2.ppGetSelectedDataset()
        },
        setSelectedFile(key) {
            r2.ppSetSelectedFile(key)
            this.zones.getDataset.selected = key
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
            ::v-deep {
                .form-elements {
                    height: 105px;
                }
            }
        }
        &.change-metadata {
            position: absolute;
            left: 420px;
            width: 400px;
            height: 400px;
            ::v-deep {
                .form-elements {
                    height: 300px;
                    .value-cell.file-id {
                        .scroll-area-vc {
                            height: 20px;
                        }
                    }
                    .value-cell.metadata {
                        .ps-container.scroll-area-vc.ps.ps--active-y{
                            height: 150px;
                        }
                    }
                }
            }
        }
        &.get-files {
            position: absolute;
            left: 420px;
            top: 523px;
            width: 400px;
            height: 407px;
            ::v-deep {
                .form-elements {
                    height: 50px;
                    .value-cell .scroll-area-vc {
                        height: 20px;
                    }
                }
                .scroll-area.results {
                    height: 240px;
                }
            }
        }

        .r2-prototype {
            .view {
                &.get-datasets {
                    .form-elements {
                        height: 105px;
                    }
                }
            }
        }
    }
    //
    //
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
