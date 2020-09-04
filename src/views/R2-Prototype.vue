<template>
    <div class="r2-prototype" :key="uKey">
        <div :class="{ hidden: viewMode !== 'change-metadata' }">
            <ActionCell
                class="view change-metadata edit"
                :key="mtKey"
                :config="zones.changeMetadata"
                @onClickFormButton="onClickFormButton('change-metadata')"
            />
        </div>
        <div :class="{ hidden: viewMode !== 'create-dataset' }">
            <ActionCell
                class="view change-metadata edit"
                :key="mtKey"
                :config="zones.createDataset"
                @onClickFormButton="onClickFormButton('create-dataset')"
            />
        </div>
        <div :class="{ hidden: viewMode !== 'upload-file' }">
            <ActionCell
                class="view upload-file"
                :config="zones.uploadFile"
                @onUpdateResults="onZoneUpdateResults"
                @onClickFormButton="onClickFormButton"
            />
        </div>
        <div :class="{ hidden: viewMode !== 'download-file' }">
            <ActionCell
                class="view upload-file"
                :config="zones.downloadFile"
                @onUpdateResults="onZoneUpdateResults"
                @onClickFormButton="onClickFormButton"
            />
        </div>
        <div :class="{ hidden: viewMode !== 'inspect-file' }">
            <ActionCell class="view upload-file" :config="zones.inspectFile" @onClickFormButton="onClickFormButton" />
        </div>
        <!-- <div :class="{ hidden: viewMode !== 'update-file' }">
            <ActionCell
                class="view upload-file"
                :config="zones.updateFile"
                @onClickListItem="onClickFileListItem"
                @onUpdateResults="onZoneUpdateResults"
                @onClickFormButton="onClickFormButton('update-file')"
            />
        </div> -->
        <div :class="{ hidden: viewMode !== 'default' }">
            <ActionCell class="view login" :config="zones.logout" v-if="$store.state.userToken" />
            <ActionCell class="view login" :config="zones.login" v-else />
            <ActionCell
                class="view get-datasets"
                :config="zones.getDatasets"
                @onClickListItem="onClickDatasetListItem"
            />
            <ActionCell
                class="view get-files"
                :config="zones.getDataset"
                @onClickListItem="onClickFileListItem"
                @onUpdateResults="onZoneUpdateResults"
            />
            <ActionCell
                class="view start-change-metadata"
                :key="mtKey"
                :config="zones.startChangeMetadata"
                @onClickFormButton="onClickEditMetadata"
            />
        </div>
    </div>
</template>

<script>
//
// TODO: Implement update File
//
import ActionCell from '@/components/ActionCell.vue'
const r2 = globals.getDataHandler('r2d2')
//
const VIEWMODE = {
    DEFAULT: 'default',
    INSPECT_FILE: 'inspect-file',
    UPLOAD_FILE: 'upload-file',
    DOWNLOAD_FILE: 'download-file',
    CHANGE_METADATA: 'change-metadata',
    CREATE_DATASET: 'create-dataset'
}

//
export default {
    name: 'R2-Prototype',
    data() {
        return {
            r2,
            VIEWMODE,
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
            upKey: 1,
            viewMode: VIEWMODE.DEFAULT,
            zones: {
                login: {
                    id: 'r2d2-login',
                    requests: {},
                    getResult: (data, me = this.zones.login) => {
                        console.log('PT:login getResult  data = ', data)
                    }
                },
                logout: {
                    id: 'r2d2-logout',
                    requests: {}
                },
                getDatasets: {
                    id: 'r2d2-get-datasets',
                    requests: {},
                    getResult: (data, me = this.zones.getDatasets) => {
                        // this part updates the selection, if it comes back e.g. from request zone
                        const ds = me.initialRequest ? r2.ppGetSelectedDataset() : { key: null, data: null }
                        me.initialRequest = false
                        return r2.getDatasets(data, { as: 'key-list' })
                    },
                    sendFormEventKey: 'sendform--get-datasets',
                    selected: r2.ppGetSelectedDataset().key,
                    initialRequest: true
                },
                getDataset: {
                    id: 'r2d2-get-dataset',
                    requests: {},
                    options: {
                        showSend: false
                    },
                    getResult: data => {
                        const dsKey = r2.ppGetSelectedDataset().key
                        data = r2.ppCreateDatasetFromFileList(dsKey, data)
                        this.setSelectedDataset(null, data)
                        return r2.getFilesOfDataset(data, { as: 'key-list' })
                    },
                    getApi: (key, me = this.zones.getDataset) => {
                        const dsKey = r2.ppGetSelectedDataset().key
                        if (dsKey === 'STAGE') {
                            key = 'r2d2-pp-get-files'
                        }
                        return me.requests[key].api
                    },
                    sendFormEventKey: 'sendform--get-dataset',
                    selected: r2.ppGetSelectedFile().key,
                    initialRequest: true
                },
                startChangeMetadata: {
                    id: 'r2d2-pp-start-change-metadata',
                    requests: {},
                    options: {
                        showSend: false,
                        showResultList: false
                    },
                    getResult: (data, me = this.zones.getDataset) => {
                        const key = me.initialRequest ? r2.ppGetSelectedFile(key) : null
                        me.initialRequest = false
                        return r2.getFilesOfDataset(data, { as: 'key-list' })
                    },
                    updateFormEventKey: 'updateform--start-change-metadata',
                    selected: r2.ppGetSelectedFile().key,
                    initialRequest: true
                },
                changeMetadata: {
                    id: 'r2d2-pp-change-metadata',
                    requests: {},
                    options: {
                        showSend: true,
                        showResultList: false,
                        showResultJson: true
                    },
                    collectData: data => {
                        console.log('changeMetadata:collectData data = ', data)
                        // TODO make this generic and realtime
                        // TODO get data from meta component here!
                        // data['send-data'].metadata.title = data.title
                        // data['send-data'].metadata.description = data.description
                        return data
                    },
                    sendFormEventKey: 'sendform--change-metadata',
                    updateFormEventKey: 'updateform--change-metadata'
                },
                createDataset: {
                    // TODO refresh ds-list after creation
                    id: 'r2d2-pp-create-dataset',
                    requests: {},
                    options: {
                        showSend: true,
                        showResultList: false,
                        showResultJson: true
                    },
                    collectData: data => {
                        // console.log('createDataset:collectData data = ', data)
                        // TODO make this generic and realtime
                        // TODO get data from meta component here!
                        // data['send-data'].metadata.title = data.title
                        // data['send-data'].metadata.description = data.description
                        return data
                    },
                    sendFormEventKey: 'sendform--create-dataset',
                    updateFormEventKey: 'updateform--create-dataset',
                    initalData: {
                        metadata: {}
                    }
                },
                uploadFile: {
                    id: 'r2d2-pp-chunk-upload-file',
                    requests: {},
                    options: {
                        showSend: false,
                        showResultList: false,
                        showResultJson: true
                    },
                    sendFormEventKey: 'sendform--upload-file',
                    updateFormEventKey: 'updateform--upload-file',
                    selected: r2.ppGetSelectedFile().key
                },
                inspectFile: {
                    id: 'r2d2-pp-inspect-file',
                    requests: {},
                    options: {
                        showSend: false,
                        showResultList: false,
                        showResultJson: true
                    },
                    sendFormEventKey: 'sendform--upload-file',
                    updateFormEventKey: 'updateform--upload-file',
                    selected: r2.ppGetSelectedFile().key
                },

                // r2d2-pp-get-file
                updateFile: {
                    id: 'r2d2-pp-update-file',
                    requests: {},
                    options: {
                        showSend: true,
                        showResultList: false,
                        showResultJson: true
                    },
                    sendFormEventKey: 'sendform--update-file',
                    updateFormEventKey: 'updateform--update-file',
                    selected: r2.ppGetSelectedFile().key
                },
                downloadFile: {
                    id: 'r2d2-pp-download-file',
                    requests: {},
                    options: {
                        showSend: true,
                        showResultList: false,
                        showResultJson: true
                    },
                    sendFormEventKey: 'sendform--download-file',
                    updateFormEventKey: 'updateform--download-file',
                    selected: r2.ppGetSelectedFile().key
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
        setViewMode(viewKey = VIEWMODE.DEFAULT) {
            this.viewMode = viewKey
        },
        onClickDatasetListItem(evt) {
            if (evt.item.key === null) {
                return this.setViewMode(VIEWMODE.CREATE_DATASET)
            }
            this.setSelectedDataset(evt.item.key, null)
            const cfg = this.zones.getDataset
            globals.eventBus.$emit(cfg.sendFormEventKey, cfg.id)
        },
        async onClickFileListItem(evt) {
            this.setSelectedFile(evt.item.key)
            const viewMode = evt.item.key ? VIEWMODE.INSPECT_FILE : VIEWMODE.UPLOAD_FILE
            if (viewMode === VIEWMODE.UPLOAD_FILE) {
                globals.eventBus.$emit('onLoadResults', {
                    key: 'r2d2-pp-chunk-upload-file',
                    filteredResult: { result: null }
                })
            }
            this.setViewMode(viewMode)
        },
        onClickEditMetadata(evt) {
            this.setViewMode(VIEWMODE.CHANGE_METADATA)
        },
        onClickFormButton(evt) {
            let cfg
            switch (evt.key) {
                case 'create-dataset':
                    cfg = this.zones.getDatasets
                    return globals.eventBus.$emit(cfg.sendFormEventKey, cfg.id)
                case 'r2d2-pp-inspect-file--update':
                    return this.setViewMode(VIEWMODE.UPLOAD_FILE)
                case 'r2d2-pp-inspect-file--download':
                    return this.setViewMode(VIEWMODE.DOWNLOAD_FILE)
            }
            this.setViewMode(VIEWMODE.DEFAULT)
            cfg = this.zones.getDataset
            globals.eventBus.$emit(cfg.sendFormEventKey, cfg.id)
        },
        setNavigation(nav) {
            this.navigation = nav
        },
        onZoneUpdateResults(evt) {
            let cfg, form
            if (evt.id === 'r2d2-get-dataset') {
                setTimeout(() => {
                    const data = r2.getDataOfDataset(evt.raw)
                    if (data) {
                        //
                        cfg = this.zones.startChangeMetadata
                        form = cfg.requests[cfg.id].form
                        form['dataset-id'].selected = r2.ppGetSelectedDataset().key
                        form['metadata'].selected = data.metadata
                        globals.eventBus.$emit(cfg.updateFormEventKey)
                        //
                        cfg = this.zones.changeMetadata
                        form = cfg.requests[cfg.id].form
                        form['dataset-id'].selected = r2.ppGetSelectedDataset().key
                        form['metadata'].selected = data.metadata
                        globals.eventBus.$emit(cfg.updateFormEventKey)
                    }
                }, 100)
            }
        },
        async loadData() {
            const requests = await r2.ppGetRequests()
            _.each(this.zones, (cfg, key) => {
                cfg.requests = requests
            })
            this.update()
        },
        setSelectedDataset(key, data = null) {
            r2.ppSetSelectedDataset(key, data)
            const ds = r2.ppGetSelectedDataset()
            //
            let cfg
            //
            cfg = this.zones.getDatasets
            cfg.selected = ds.key
            //
            cfg = this.zones.getDataset
            cfg.requests[cfg.id].form['file-id-select'].selected = ds.key
            globals.eventBus.$emit(`update--${cfg.id}`)
            //
            cfg = this.zones.startChangeMetadata
            cfg.selected = ds.key
            cfg.requests[cfg.id].form['dataset-id'].selected = ds.key
            cfg.requests[cfg.id].form['metadata'].selected = null
            globals.eventBus.$emit(`update--${cfg.id}`)
            //
            cfg = this.zones.changeMetadata
            cfg.selected = ds.key
            cfg.requests[cfg.id].form['dataset-id'].selected = ds.key
            globals.eventBus.$emit(cfg.updateFormEventKey)
            //
            cfg = this.zones.createDataset
            cfg.selected = ds.key
            cfg.requests[cfg.id].form['dataset-id'].selected = null
            cfg.requests[cfg.id].form['send-data'].selected = cfg.initalData
            globals.eventBus.$emit(cfg.updateFormEventKey)
            //
            cfg = this.zones.uploadFile
            cfg.selected = ds.key
            cfg.requests[cfg.id].form['dataset-id'].selected = ds.key
            cfg.requests[cfg.id].form['file-id'].selected = null
            globals.eventBus.$emit(cfg.updateFormEventKey)
            //
            // cfg = this.zones.updateFile
            // cfg.selected = key
            // cfg.requests[cfg.id].form['dataset-id'].selected = ds.key
            // cfg.requests[cfg.id].form['file-id'].selected = null
            // globals.eventBus.$emit(cfg.updateFormEventKey)
        },
        setSelectedFile(fileKey = null) {
            r2.ppSetSelectedFile(fileKey)
            const ds = r2.ppGetSelectedDataset()
            let cfg
            // this updates the file selection in the getDataset result list!
            cfg = this.zones.getDataset
            cfg.selected = fileKey
            //
            if (fileKey) {
                //
                const fProps = r2.ppGetNativeFileProperties(fileKey)
                // inspectFile
                cfg = this.zones.inspectFile
                cfg.requests[cfg.id].form['dataset-id'].selected = ds.key
                cfg.requests[cfg.id].form['file-id'].selected = fileKey
                cfg.requests[cfg.id].form['file-name'].selected = fProps.filename
                globals.eventBus.$emit(cfg.updateFormEventKey)
                // downloadFile
                cfg = this.zones.downloadFile
                cfg.requests[cfg.id].form['dataset-id'].selected = ds.key
                cfg.requests[cfg.id].form['file-id'].selected = fileKey
                cfg.requests[cfg.id].form['file-name'].selected = fProps.filename
                globals.eventBus.$emit(cfg.updateFormEventKey)
                //
            } else {
                cfg = this.zones.uploadFile
                cfg.requests[cfg.id].form['dataset-id'].selected = ds.key
                cfg.requests[cfg.id].form['file-id'].selected = fileKey
                globals.eventBus.$emit(cfg.updateFormEventKey)
            }
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
    .hidden {
        visibility: hidden;
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
                .scroll-area.results {
                    height: 374px;
                }
            }
        }
        &.start-change-metadata {
            position: absolute;
            left: 420px;
            width: 400px;
            height: 400px;
            ::v-deep {
                .form-elements {
                    height: 312px;
                    .value-cell.dataset-id {
                        .scroll-area-vc {
                            height: 20px;
                        }
                    }
                    .value-cell.metadata {
                        .ps-container.scroll-area-vc.ps {
                            height: 150px;
                            min-height: 150px;
                        }
                    }
                }
            }
        }
        &.get-files {
            position: absolute;
            left: 420px;
            top: 520px;
            width: 400px;
            height: 410px;
            ::v-deep {
                .form-elements {
                    height: 60px;
                    .value-cell .scroll-area-vc {
                        height: 20px;
                    }
                }
                .scroll-area.results {
                    height: 240px;
                }
            }
        }
        &.change-metadata {
            position: absolute;
            width: 810px;
            ::v-deep {
                .form-elements {
                    height: 500px;
                    .scroll-area-vc.ps {
                        height: 20px;
                    }
                    .meta-component {
                        .form-elements {
                            height: 350px;
                            .scroll-area-vc.ps {
                                height: 20px;
                            }
                        }
                        .form-cell.form {
                            width: 700px;
                        }
                    }
                }
                .scroll-area.results {
                    height: 350px;
                    min-height: 350px;
                    max-height: 350px;
                }
            }
        }
        &.upload-file {
            position: absolute;
            width: 820px;
            ::v-deep {
                .form-elements {
                    height: 370px;
                    .value-cell {
                        &.file-id,
                        &.dataset-id {
                            .scroll-area-vc {
                                height: 20px;
                            }
                        }
                    }
                }
                .scroll-area.results {
                    height: 350px;
                    min-height: 350px;
                    max-height: 350px;
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
