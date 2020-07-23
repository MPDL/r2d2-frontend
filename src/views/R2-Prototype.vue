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
            <ActionCell class="view login" :config="zones.login" />
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
import ActionCell from '@/components/ActionCell.vue'
const r2 = globals.getDataHandler('r2d2')
//

const VM = {
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
            VM,
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
            viewMode: VM.DEFAULT,
            zones: {
                login: {
                    id: 'r2d2-login',
                    requests: r2.ppGetRequests()
                },
                getDatasets: {
                    // this.zones.getDatasets.getResult()
                    id: 'r2d2-get-datasets',
                    requests: r2.ppGetRequests(),
                    getResult: (data, me = this.zones.getDatasets) => {
                        const ds = me.initialRequest ? this.getSelectedDataset() : { key: null, data: null }
                        // this.setSelectedDataset(ds.key, null)
                        me.initialRequest = false
                        // console.log('R2P:getDatasets:getResult ds = ', ds)
                        // console.log('R2P:getDatasets:getResult data = ', data)
                        return r2.getDatasets(data, { as: 'key-list' })
                    },
                    sendFormEventKey: 'sendform--get-datasets',
                    selected: this.getSelectedDataset().key,
                    initialRequest: true
                },
                getDataset: {
                    id: 'r2d2-get-dataset',
                    requests: r2.ppGetRequests(),
                    options: {
                        showSend: false
                    },
                    getResult: (data, me = this.zones.getDataset) => {
                        console.log('R2P:getDataset:getResult data = ', data)
                        this.setSelectedDataset(data.id, data)
                        // const key = me.initialRequest ? this.getSelectedFile().key : null
                        // this.setSelectedFile(key, data)
                        // me.initialRequest = false
                        return r2.getFilesOfDataset(data, { as: 'key-list' })
                    },
                    sendFormEventKey: 'sendform--get-dataset',
                    selected: this.getSelectedFile().key,
                    initialRequest: true
                },
                startChangeMetadata: {
                    id: 'r2d2-pp-start-change-metadata',
                    requests: r2.ppGetRequests(),
                    options: {
                        showSend: false,
                        showResultList: false
                    },
                    getResult: (data, me = this.zones.getDataset) => {
                        const key = me.initialRequest ? this.getSelectedFile(key) : null
                        // this.setSelectedFile(key)
                        me.initialRequest = false
                        return r2.getFilesOfDataset(data, { as: 'key-list' })
                    },
                    updateFormEventKey: 'updateform--start-change-metadata',
                    selected: this.getSelectedFile().key,
                    initialRequest: true
                },
                changeMetadata: {
                    id: 'r2d2-pp-change-metadata',
                    requests: r2.ppGetRequests(),
                    options: {
                        showSend: true,
                        showResultList: false,
                        showResultJson: true
                    },
                    collectData: data => {
                        // TODO make this generic and realtime
                        console.log('changeMetadata:CB:collectData data = ', data)
                        data['send-data'].metadata.title = data.title
                        data['send-data'].metadata.description = data.description
                        return data
                    },
                    sendFormEventKey: 'sendform--change-metadata',
                    updateFormEventKey: 'updateform--change-metadata'
                },
                createDataset: {
                    id: 'r2d2-pp-create-dataset',
                    requests: r2.ppGetRequests(),
                    options: {
                        showSend: true,
                        showResultList: false,
                        showResultJson: true
                    },
                    collectData: data => {
                        // TODO make this generic and realtime
                        console.log('createDataset:CB:collectData data = ', data)
                        data['send-data'].metadata.title = data.title
                        data['send-data'].metadata.description = data.description
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
                    requests: r2.ppGetRequests(),
                    options: {
                        showSend: false,
                        showResultList: false,
                        showResultJson: true
                    },
                    sendFormEventKey: 'sendform--upload-file',
                    updateFormEventKey: 'updateform--upload-file',
                    selected: this.getSelectedFile().key
                },
                inspectFile: {
                    id: 'r2d2-pp-inspect-file',
                    requests: r2.ppGetRequests(),
                    options: {
                        showSend: false,
                        showResultList: false,
                        showResultJson: true
                    },
                    sendFormEventKey: 'sendform--upload-file',
                    updateFormEventKey: 'updateform--upload-file',
                    selected: this.getSelectedFile().key
                },

                // r2d2-pp-get-file

                updateFile: {
                    id: 'r2d2-pp-update-file',
                    requests: r2.ppGetRequests(),
                    options: {
                        showSend: true,
                        showResultList: false,
                        showResultJson: true
                    },
                    sendFormEventKey: 'sendform--update-file',
                    updateFormEventKey: 'updateform--update-file',
                    selected: this.getSelectedFile().key
                },
                downloadFile: {
                    id: 'r2d2-pp-download-file',
                    requests: r2.ppGetRequests(),
                    options: {
                        showSend: true,
                        showResultList: false,
                        showResultJson: true
                    },
                    sendFormEventKey: 'sendform--download-file',
                    updateFormEventKey: 'updateform--download-file',
                    selected: this.getSelectedFile().key
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
        setViewMode(viewKey = VM.DEFAULT) {
            console.log('R2P:setViewMode viewKey = ', viewKey)
            this.viewMode = viewKey
        },
        onClickDatasetListItem(evt) {
            console.log('R2P:onClickDatasetListItem evt = ', evt)
            if (evt.item.key === null) {
                return this.setViewMode(VM.CREATE_DATASET)
            }
            this.setSelectedDataset(evt.item.key, null)
            const cfg = this.zones.getDataset
            globals.eventBus.$emit(cfg.sendFormEventKey, cfg.id)
        },
        async onClickFileListItem(evt) {
            this.setSelectedFile(evt.item.key)
            this.setViewMode(evt.item.key ? VM.INSPECT_FILE : VM.UPLOAD_FILE)
        },
        onClickEditMetadata(evt) {
            this.setViewMode(VM.CHANGE_METADATA)
        },
        onClickFormButton(evt) {
            console.log('R2P:onClickFormButton evt.key = ', evt.key)
            let cfg
            switch (evt.key) {
                case 'create-dataset':
                    cfg = this.zones.getDatasets
                    return globals.eventBus.$emit(cfg.sendFormEventKey, cfg.id)
                case 'r2d2-pp-inspect-file--update':
                    return this.setViewMode(VM.UPLOAD_FILE)
                case 'r2d2-pp-inspect-file--download':
                    return this.setViewMode(VM.DOWNLOAD_FILE)
            }
            this.setViewMode(VM.DEFAULT)
            cfg = this.zones.getDataset
            globals.eventBus.$emit(cfg.sendFormEventKey, cfg.id)
            console.log('R2P:onClickFormButton evt.key = ', evt.key)
        },
        setNavigation(nav) {
            this.navigation = nav
        },
        onZoneUpdateResults(evt) {
            let cfg, form
            if (evt.id === 'r2d2-get-dataset') {
                // console.log('R2P:onZoneUpdateResults evt = ', evt)
                setTimeout(() => {
                    const data = r2.getDataOfDataset(evt.raw)
                    if (data) {
                        //
                        cfg = this.zones.startChangeMetadata
                        form = cfg.requests[cfg.id].form
                        form['dataset-id'].selected = this.getSelectedDataset().key
                        form['metadata'].selected = data.metadata
                        globals.eventBus.$emit(cfg.updateFormEventKey)
                        //
                        cfg = this.zones.changeMetadata
                        form = cfg.requests[cfg.id].form
                        form['dataset-id'].selected = this.getSelectedDataset().key
                        form['send-data'].selected = {
                            modificationDate: data.modificationDate,
                            metadata: data.metadata
                        }
                        form['title'].selected = data.metadata.title
                        form['description'].selected = data.metadata.description
                        globals.eventBus.$emit(cfg.updateFormEventKey)
                    }
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
        // computed prop dont works for that
        setSelectedDataset(key, data = null) {
            r2.ppSetSelectedDataset(key, data)
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
            cfg = this.zones.startChangeMetadata
            cfg.selected = key
            cfg.requests[cfg.id].form['dataset-id'].selected = key
            cfg.requests[cfg.id].form['metadata'].selected = null
            globals.eventBus.$emit(`update--${cfg.id}`)
            //
            cfg = this.zones.changeMetadata
            cfg.selected = key
            cfg.requests[cfg.id].form['dataset-id'].selected = key
            globals.eventBus.$emit(cfg.updateFormEventKey)
            //
            cfg = this.zones.createDataset
            cfg.selected = key
            cfg.requests[cfg.id].form['dataset-id'].selected = null
            cfg.requests[cfg.id].form['send-data'].selected = cfg.initalData
            globals.eventBus.$emit(cfg.updateFormEventKey)
            //
            cfg = this.zones.uploadFile
            cfg.selected = key
            cfg.requests[cfg.id].form['dataset-id'].selected = key
            cfg.requests[cfg.id].form['file-id'].selected = null
            globals.eventBus.$emit(cfg.updateFormEventKey)
            //
            // cfg = this.zones.updateFile
            // cfg.selected = key
            // cfg.requests[cfg.id].form['dataset-id'].selected = key
            // cfg.requests[cfg.id].form['file-id'].selected = null
            // globals.eventBus.$emit(cfg.updateFormEventKey)
        },
        getSelectedDataset() {
            return r2.ppGetSelectedDataset()
        },
        setSelectedFile(fileKey = null) {
            // r2.ppSetSelectedFile(fileKey)
            const ds = this.getSelectedDataset()
            console.log('R2P:setSelectedFile fileKey = ', fileKey)
            console.log('R2P:setSelectedFile ds = ', ds)
            console.log('R2P:setSelectedFile ds.key = ', ds.key)
            console.log('R2P:setSelectedFile ds.data = ', ds.data)
            let cfg
            if (fileKey) {
                const fProps = r2.ppGetFileProperties(fileKey)
                console.log('R2P:setSelectedFile fProps = ', fProps)
                //
                cfg = this.zones.inspectFile
                cfg.requests[cfg.id].form['dataset-id'].selected = ds.key
                cfg.requests[cfg.id].form['file-id'].selected = fileKey
                cfg.requests[cfg.id].form['file-name'].selected = fProps.filename
                console.log('R2P:setSelectedFile cfg = ', cfg)
                globals.eventBus.$emit(cfg.updateFormEventKey)
                //
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
                    height: 370px;
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
