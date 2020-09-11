<template>
    <div class="r2-prototype" :key="uKey">
        <div :class="{ hidden: viewMode !== VIEWMODE.CHANGE_METADATA }">
            <ActionCell
                class="view change-metadata edit"
                :key="mtKey"
                c
                :config="zones.changeMetadata"
                @form-button-clicked="onClickFormButton"
            />
        </div>
        <div :class="{ hidden: viewMode !== VIEWMODE.CREATE_DATASET }">
            <ActionCell
                class="view change-metadata edit"
                :key="mtKey"
                :config="zones.createDataset"
                @form-button-clicked="onClickFormButton"
            />
        </div>
        <div :class="{ hidden: viewMode !== VIEWMODE.UPLOAD_FILE }">
            <ActionCell
                class="view upload-file"
                :config="zones.uploadFile"
                @onUpdateResults="onZoneUpdateResults"
                @form-button-clicked="onClickFormButton"
            />
        </div>
        <div :class="{ hidden: viewMode !== VIEWMODE.DOWNLOAD_FILE }">
            <ActionCell
                class="view upload-file"
                :config="zones.downloadFile"
                @onUpdateResults="onZoneUpdateResults"
                @form-button-clicked="onClickFormButton"
            />
        </div>
        <div :class="{ hidden: viewMode !== VIEWMODE.ADD_FILE_TO_DATASET }">
            <ActionCell
                class="view upload-file"
                :config="zones.addFileToDataset"
                @form-button-clicked="onClickFormButton"
            />
        </div>
        <div :class="{ hidden: viewMode !== VIEWMODE.INSPECT_FILE }">
            <ActionCell
                class="view inspect-file"
                :config="zones.inspectFile"
                @form-button-clicked="onClickFormButton"
            />
        </div>
        <div :class="{ hidden: viewMode !== VIEWMODE.DELETE_FILE }">
            <ActionCell class="view upload-file" :config="zones.deleteFile" @form-button-clicked="onClickFormButton" />
        </div>
        <!-- <div :class="{ hidden: viewMode !== 'update-file' }">
            <ActionCell
                class="view upload-file"
                :config="zones.updateFile"
                @onClickListItem="onClickFileListItem"
                @onUpdateResults="onZoneUpdateResults"
                @form-button-clicked="onClickFormButton"
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
                @form-button-clicked="onClickFormButton"
            />
        </div>
    </div>
</template>

<script>
//
// TODO: Implement update File
// TODO: refresh dataset list labels after metadata change
// TODO: persist unsaved metadata, concept for handling reload vs. unsaved changes (dialog ?)
// BUG: after closing 'createDataset' fix DOM panic / non unique ids
//
import ActionCell from '@/components/ActionCell.vue'
const r2 = globals.getDataHandler('r2d2')
//
const VIEWMODE = {
    DEFAULT: 'default',
    INSPECT_FILE: 'inspect-file',
    DELETE_FILE: 'delete-file',
    UPLOAD_FILE: 'upload-file',
    DOWNLOAD_FILE: 'download-file',
    CHANGE_METADATA: 'change-metadata',
    CREATE_DATASET: 'create-dataset',
    ADD_FILE_TO_DATASET: 'add-file-to-dataset'
}

const RQ = {
    login: 'r2d2-login',
    logout: 'r2d2-logout',
    getDatasets: 'r2d2-get-datasets',
    getDataset: 'r2d2-pp-get-dataset',
    createDataset: 'r2d2-pp-create-dataset',
    startChangeMetadata: 'r2d2-pp-start-change-metadata',
    changeMetadata: 'r2d2-pp-change-metadata',
    uploadFile: 'r2d2-pp-chunk-upload-file',
    inspectFile: 'r2d2-pp-inspect-file',
    updateFile: 'r2d2-pp-update-file',
    downloadFile: 'r2d2-pp-download-file',
    deleteFile: 'r2d2-pp-delete-file',
    getStageFiles: 'r2d2-pp-get-files',
    addFileToDataset: 'r2d2-pp-add-file-to-dataset'
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
            // TODO refactor all remeining 'me' to 'this'
            zones: {
                login: {
                    id: RQ.login,
                    requests: {},
                    getResult: data => {
                        console.log('PT:login getResult  data = ', data)
                    }
                },
                logout: {
                    id: RQ.logout,
                    requests: {}
                },
                getDatasets: {
                    id: RQ.getDatasets,
                    requests: {},
                    // use 'function' declaration here to get 'this' working inside object!
                    getResult: function(data) {
                        return r2.getDatasets(data, {
                            as: 'key-list',
                            addVersionToKey: true,
                            addNew: true,
                            addStage: true
                        })
                    },
                    sendFormEventKey: `sendform--${RQ.getDatasets}`,
                    selected: null // initial update in 'created' hook
                },
                getDataset: {
                    id: RQ.getDataset,
                    requests: {},
                    options: {
                        showSend: false
                    },
                    getResult: data => {
                        const dsKey = r2.ppGetSelectedDataset().key
                        data = r2.ppCreateDatasetFromFileList(dsKey, data)
                        this.setSelectedDataset(null, null, data)
                        return r2.getFilesOfDataset(data, { as: 'key-list' })
                    },
                    getApi: (key, me = this.zones.getDataset) => {
                        const dsKey = r2.ppGetSelectedDataset().key
                        if (dsKey === 'STAGE') {
                            key = RQ.getStageFiles
                        }
                        return me.requests[key].api
                    },
                    sendFormEventKey: `sendform--${RQ.getDataset}`,
                    selected: null,
                    initialRequest: true
                },
                startChangeMetadata: {
                    id: RQ.startChangeMetadata,
                    requests: {},
                    options: {
                        showSend: false,
                        showResultList: false
                    },
                    getResult: (data, me = this.zones.getDataset) => {
                        // ??
                        const key = me.initialRequest ? r2.ppGetSelectedFile(key) : null
                        me.initialRequest = false
                        return r2.getFilesOfDataset(data, { as: 'key-list' })
                    },
                    updateFormEventKey: `updateform--${RQ.startChangeMetadata}`,
                    selected: null,
                    initialRequest: true
                },
                changeMetadata: {
                    id: RQ.changeMetadata,
                    requests: {},
                    options: {
                        showSend: true,
                        showResultList: false,
                        showResultJson: true
                    },
                    data: {
                        modificationDate: null,
                        metadata: null
                    },
                    collectData: function(data) {
                        this.data.metadata = data.metadata
                        data['send-data'] = this.data
                        return data
                    },
                    getResult: function(data) {
                        this.data.modificationDate = data.modificationDate
                        return data
                    },

                    sendFormEventKey: `sendform--${RQ.changeMetadata}`,
                    updateFormEventKey: `updateform--${RQ.changeMetadata}`
                },
                createDataset: {
                    // TODO refresh ds-list after creation
                    id: RQ.createDataset,
                    requests: {},
                    options: {
                        showSend: true,
                        showResultList: false,
                        showResultJson: true
                    },
                    data: {
                        metadata: null
                    },
                    collectData: function(data) {
                        this.data.metadata = data.metadata
                        data['send-data'] = this.data
                        return data
                    },
                    getResult: function(data) {
                        return data
                    },
                    sendFormEventKey: `sendform--${RQ.createDataset}`,
                    updateFormEventKey: `updateform--${RQ.createDataset}`,
                    initalData: {}
                },
                uploadFile: {
                    id: RQ.uploadFile,
                    requests: {},
                    options: {
                        showSend: false,
                        showResultList: false,
                        showResultJson: true
                    },
                    sendFormEventKey: `sendform--${RQ.uploadFile}`,
                    updateFormEventKey: `updateform--${RQ.uploadFile}`,
                    selected: r2.ppGetSelectedFile().key
                },
                inspectFile: {
                    id: RQ.inspectFile,
                    requests: {},
                    options: {
                        showSend: false,
                        showResultList: false,
                        showResultJson: true
                    },
                    sendFormEventKey: `sendform--${RQ.inspectFile}`,
                    updateFormEventKey: `updateform--${RQ.inspectFile}`,
                    selected: r2.ppGetSelectedFile().key
                },
                updateFile: {
                    id: RQ.updateFile,
                    requests: {},
                    options: {
                        showSend: true,
                        showResultList: false,
                        showResultJson: true
                    },
                    sendFormEventKey: `sendform--${RQ.updateFile}`,
                    updateFormEventKey: `updateform--${RQ.updateFile}`,
                    selected: r2.ppGetSelectedFile().key
                },
                downloadFile: {
                    id: RQ.downloadFile,
                    requests: {},
                    options: {
                        showSend: true,
                        showResultList: false,
                        showResultJson: true
                    },
                    sendFormEventKey: `sendform--${RQ.downloadFile}`,
                    updateFormEventKey: `updateform--${RQ.downloadFile}`,
                    selected: r2.ppGetSelectedFile().key
                },
                deleteFile: {
                    id: RQ.deleteFile,
                    requests: {},
                    options: {
                        showSend: true,
                        showResultList: false,
                        showResultJson: true
                    },
                    sendFormEventKey: `sendform--${RQ.deleteFile}`,
                    updateFormEventKey: `updateform--${RQ.deleteFile}`,
                    selected: null
                },
                addFileToDataset: {
                    // TODO discuss edge cases and messages, e.g. when file is moved from one ds to another
                    // or meaning of noving back to STAGE / pool
                    id: RQ.addFileToDataset,
                    requests: {},
                    options: {
                        showSend: true,
                        showResultList: false,
                        showResultJson: true
                    },
                    sendFormEventKey: `sendform--${RQ.addFileToDataset}`,
                    updateFormEventKey: `updateform--${RQ.addFileToDataset}`,
                    selected: null
                }
            }
        }
    },
    components: {
        ActionCell
    },
    created() {
        const ds = r2.ppGetSelectedDataset()
        this.zones.getDatasets.selected = ds.vsKey
        this.zones.startChangeMetadata.selected = ds.vsKey
        globals.eventBus.$on('onLoadResults', this.updateResults)
        // TODO all init here!
        this.loadData()
    },
    methods: {
        update(updateKey = 'uKey') {
            this[updateKey] = this[updateKey] > 1000 ? 1 : ++this[updateKey]
        },
        setViewMode(viewKey = VIEWMODE.DEFAULT) {
            this.viewMode = viewKey
        },
        updateResults(evt) {
            if (evt.key === RQ.getDatasets) {
                const options = r2.getDatasets(evt.result.data, {
                    as: 'option-list'
                })
                const cfg = this.zones.addFileToDataset
                cfg.requests[cfg.id].form['dataset-id'].options = options
            }
        },
        onClickDatasetListItem(evt) {
            let cfg = null
            if (evt.item.key === null) {
                cfg = this.zones.createDataset
                const form = cfg.requests[cfg.id].form
                form['dataset-id'].selected = 'new-dataset'
                form['metadata'].setup = {
                    key: 'metadata',
                    data: cfg.initalData,
                    schema: form.metadata.schema
                }
                cfg.data.metadata = cfg.initalData
                globals.eventBus.$emit(cfg.updateFormEventKey)
                return this.setViewMode(VIEWMODE.CREATE_DATASET)
            }
            this.setSelectedDataset(evt.item.key, evt.item.version, null)
            cfg = this.zones.getDataset
            globals.eventBus.$emit(cfg.sendFormEventKey, cfg.id)
        },
        async onClickFileListItem(evt) {
            this.setSelectedFile(evt.item.key)
            const viewMode = evt.item.key ? VIEWMODE.INSPECT_FILE : VIEWMODE.UPLOAD_FILE
            if (viewMode === VIEWMODE.UPLOAD_FILE) {
                globals.eventBus.$emit('onLoadResults', {
                    key: RQ.uploadFile,
                    filteredResult: { result: null }
                })
            }
            this.setViewMode(viewMode)
        },
        onClickFormButton(evt) {
            let cfg
            switch (true) {
                case evt.action === 'back':
                    switch (evt.key) {
                        case RQ.uploadFile:
                        case RQ.downloadFile:
                        case RQ.deleteFile:
                        case RQ.addFileToDataset:
                            return this.setViewMode(VIEWMODE.INSPECT_FILE)
                    }
                    break
                case evt.key === RQ.createDataset && evt.action === 'close':
                    // clear form (fix the DOM multiple id error) and update the dataset list here
                    cfg = this.zones.createDataset
                    cfg.requests[cfg.id].form['metadata'].selected = null
                    globals.eventBus.$emit(cfg.updateFormEventKey)
                    cfg = this.zones.getDatasets
                    globals.eventBus.$emit(cfg.sendFormEventKey, cfg.id)
                    break
                case evt.key === RQ.startChangeMetadata && evt.action === 'edit-metadata':
                    return this.setViewMode(VIEWMODE.CHANGE_METADATA)
                case evt.key === RQ.inspectFile:
                    switch (evt.action) {
                        case 'update':
                            return this.setViewMode(VIEWMODE.UPLOAD_FILE)
                        case 'download':
                            return this.setViewMode(VIEWMODE.DOWNLOAD_FILE)
                        case 'delete':
                            return this.setViewMode(VIEWMODE.DELETE_FILE)
                        case 'addFileToDataset':
                            return this.setViewMode(VIEWMODE.ADD_FILE_TO_DATASET)
                    }
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
            if (evt.id === RQ.getDataset) {
                setTimeout(() => {
                    const data = r2.getDataOfDataset(evt.raw)
                    if (data) {
                        //
                        cfg = this.zones.startChangeMetadata
                        form = cfg.requests[cfg.id].form
                        form['dataset-id'].selected = r2.ppGetSelectedDataset().vsKey
                        form['metadata'].selected = data.metadata
                        globals.eventBus.$emit(cfg.updateFormEventKey)
                        //
                        cfg = this.zones.changeMetadata
                        form = cfg.requests[cfg.id].form
                        // changeMetadata uses the unversioned key!!
                        form['dataset-id'].selected = r2.ppGetSelectedDataset().key // !!
                        form['metadata'].setup = {
                            key: 'metadata',
                            data: data.metadata,
                            schema: form.metadata.schema
                        }
                        cfg.data.modificationDate = data.modificationDate
                        cfg.data.metadata = data.metadata
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
        setSelectedDataset(key, version = null, data = null) {
            r2.ppSetSelectedDataset(key, version, data)
            const ds = r2.ppGetSelectedDataset()
            //
            let cfg
            //
            cfg = this.zones.getDatasets
            cfg.selected = ds.vsKey
            //
            cfg = this.zones.getDataset
            cfg.requests[cfg.id].form['ds-select'].selected = ds.vsKey
            globals.eventBus.$emit(`update--${cfg.id}`)
            //
            cfg = this.zones.startChangeMetadata
            cfg.requests[cfg.id].form['dataset-id'].selected = ds.vsKey
            cfg.requests[cfg.id].form['metadata'].selected = null
            globals.eventBus.$emit(`update--${cfg.id}`)
            //
            cfg = this.zones.changeMetadata
            cfg.selected = ds.key
            cfg.requests[cfg.id].form['dataset-id'].selected = ds.vsKey
            globals.eventBus.$emit(cfg.updateFormEventKey)
            //
            cfg = this.zones.createDataset
            cfg.selected = ds.key
            cfg.requests[cfg.id].form['dataset-id'].selected = null
            // cfg.requests[cfg.id].form['send-data'].selected = cfg.initalData
            cfg.requests[cfg.id].form['metadata'].selected = cfg.initalData
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
                // delete File
                cfg = this.zones.deleteFile
                cfg.selected = ds.key
                cfg.requests[cfg.id].form['dataset-id'].selected = ds.key
                cfg.requests[cfg.id].form['file-id'].selected = fileKey
                cfg.requests[cfg.id].form['file-name'].selected = fProps.filename
                globals.eventBus.$emit(cfg.updateFormEventKey)
                // addFileToDataset
                cfg = this.zones.addFileToDataset
                cfg.selected = ds.key
                cfg.requests[cfg.id].form['dataset-id'].selected = null
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
        &.change-metadata,
        &.inspect-file {
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
                    height: 200px;
                    // min-height: 350px;
                    // max-height: 350px;
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
