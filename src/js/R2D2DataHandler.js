const R2D2DataHandler = function() {
    this.getDatasets = (dta, options = {}) => {
        console.log('R2:getDatasets +++++++++ options = ', options)
        console.log('R2:getDatasets dta = ', dta)
        console.log('R2:getDatasets dta.data.hits = ', dta.data.hits)

        const res = {}

        if (options.as === 'key-list') {
            _.each(dta.data.hits.hits, (value, index) => {
                console.log('R2:getDatasets:EACH value = ', value)
                const d = {
                    key: value._id,
                    title: value._source.metadata.title
                }
                d.label = `${d.title} | ${d.key}`
                res[value._id] = d
            })
        }

        return res

        //    {ts: 1591111137075, data: {…}, key: "r2d2-get-datasets", api: {…}}
        //     ts: 1591111137075
        //     data:
        //     took: 3
        //     timed_out: false
        //     _shards: {total: 1, successful: 1, skipped: 0, failed: 0}
        //     hits:
        //     total: {value: 4, relation: "eq"}
        //     max_score: 1
        //     hits: Array(4)
    }

    this.getFilesOfDataset = (dta, options = {}) => {
        console.log('R2:getFilesOfDataset +++++++++ options = ', options)
        console.log('R2:getFilesOfDataset dta = ', dta)

        const res = {}

        if (options.as === 'key-list') {
            _.each(dta.data.files, (value, index) => {
                console.log('R2:getFilesOfDataset:EACH value = ', value)
                const d = {
                    key: value.id,
                    title: value.filename
                }
                d.label = `${d.title} | ${d.key}`
                res[value._id] = d
            })
        }

        const dtxx = {
            "id" : "a6124f2a-9a06-489d-a7e2-40b583ebbd24",
            "creationDate" : "2020-05-11T16:50:16.036511Z",
            "modificationDate" : "2020-06-01T20:30:19.476795Z",
            "creator" : {
              "id" : "2d0dd850-eabb-43fe-8b8f-1a1b54018738",
              "name" : "Test Admin"
            },
            "modifier" : {
              "id" : "2d0dd850-eabb-43fe-8b8f-1a1b54018738",
              "name" : "Test Admin"
            },
            "versionNumber" : 1,
            "state" : "PUBLIC",
            "publicationDate" : null,
            "metadata" : {
              "title" : "Test title 22222bbb",
              "authors" : [ {
                "givenName" : "",
                "familyName" : "",
                "nameIdentifier" : "",
                "affiliations" : [ {
                  "id" : "",
                  "organization" : "",
                  "department" : ""
                } ]
              } ],
              "doi" : "",
              "description" : "",
              "genres" : [ "" ],
              "keywords" : [ "" ],
              "license" : "",
              "language" : "",
              "correspondingPapers" : [ {
                "title" : "",
                "url" : null,
                "type" : null,
                "identifier" : null,
                "identifierType" : null
              } ]
            },
            "files" : [ {
              "id" : "7bee7b29-77e6-4763-add6-932a7d46abf0",
              "creationDate" : "2020-05-26T13:37:44.774282Z",
              "modificationDate" : "2020-05-26T13:37:44.774282Z",
              "creator" : {
                "id" : "2d0dd850-eabb-43fe-8b8f-1a1b54018738",
                "name" : "Test Admin"
              },
              "modifier" : {
                "id" : "2d0dd850-eabb-43fe-8b8f-1a1b54018738",
                "name" : "Test Admin"
              },
              "state" : "COMPLETE",
              "stateInfo" : {
                "currentChecksum" : null,
                "chunks" : [ ],
                "expectedNumberOfChunks" : 0
              },
              "filename" : "Upload Konzept.docx",
              "storageLocation" : null,
              "checksum" : "c82e1bcb67132b031b7785769a065101",
              "format" : null,
              "size" : 22189
            }, {
              "id" : "4873f868-1542-4f9e-830a-ff676976865f",
              "creationDate" : "2020-05-26T13:55:53.027256Z",
              "modificationDate" : "2020-05-26T13:55:53.027256Z",
              "creator" : {
                "id" : "2d0dd850-eabb-43fe-8b8f-1a1b54018738",
                "name" : "Test Admin"
              },
              "modifier" : {
                "id" : "2d0dd850-eabb-43fe-8b8f-1a1b54018738",
                "name" : "Test Admin"
              },
              "state" : "COMPLETE",
              "stateInfo" : {
                "currentChecksum" : null,
                "chunks" : [ ],
                "expectedNumberOfChunks" : 0
              },
              "filename" : "how-to-hand-code-svg-master.zip",
              "storageLocation" : null,
              "checksum" : "6e509119829f98e4b31709ec2e61894f",
              "format" : null,
              "size" : 4830
            }, {
              "id" : "3fc44fdd-33b1-4fb2-b2b3-39fd2468b152",
              "creationDate" : "2020-05-26T18:28:33.180564Z",
              "modificationDate" : "2020-05-26T18:28:33.180564Z",
              "creator" : {
                "id" : "2d0dd850-eabb-43fe-8b8f-1a1b54018738",
                "name" : "Test Admin"
              },
              "modifier" : {
                "id" : "2d0dd850-eabb-43fe-8b8f-1a1b54018738",
                "name" : "Test Admin"
              },
              "state" : "COMPLETE",
              "stateInfo" : {
                "currentChecksum" : null,
                "chunks" : [ ],
                "expectedNumberOfChunks" : 0
              },
              "filename" : "Upload Konzept.docx",
              "storageLocation" : null,
              "checksum" : "c82e1bcb67132b031b7785769a065101",
              "format" : null,
              "size" : 22189
            }, {
              "id" : "f8f10ddc-9f8b-4c5f-830f-3417a340b869",
              "creationDate" : "2020-05-26T18:35:36.897463Z",
              "modificationDate" : "2020-05-26T18:35:36.897463Z",
              "creator" : {
                "id" : "2d0dd850-eabb-43fe-8b8f-1a1b54018738",
                "name" : "Test Admin"
              },
              "modifier" : {
                "id" : "2d0dd850-eabb-43fe-8b8f-1a1b54018738",
                "name" : "Test Admin"
              },
              "state" : "COMPLETE",
              "stateInfo" : {
                "currentChecksum" : null,
                "chunks" : [ ],
                "expectedNumberOfChunks" : 0
              },
              "filename" : "wwf.svg",
              "storageLocation" : null,
              "checksum" : "9a485453d8ffe6ba4d7fa3ad8eb49c18",
              "format" : null,
              "size" : 10235
            } ],
            "parent" : {
              "id" : "9cdb1d04-8527-4c32-8e00-4e4730861cbc",
              "creationDate" : "2020-05-11T16:50:16.035195Z",
              "modificationDate" : "2020-06-01T20:30:19.476795Z",
              "creator" : {
                "id" : "2d0dd850-eabb-43fe-8b8f-1a1b54018738",
                "name" : "Test Admin"
              },
              "modifier" : {
                "id" : "2d0dd850-eabb-43fe-8b8f-1a1b54018738",
                "name" : "Test Admin"
              },
              "state" : "PUBLIC",
              "datamanager" : [ ]
            }
          }

          return res
    }



    // let enabled = true
    // let timeoutPreloadStart = null
    // let timeoutPreloadCanStop = null
    // let loading = false

    // if (typeof config.store !== 'object') {
    //     console.error('PreloadAnimationController: no store set!')
    //     enabled = false
    // }
    // if (typeof config.finalize !== 'function') {
    //     console.error('PreloadAnimationController: no finalize-callback set!')
    //     enabled = false
    // }

    // const setPreloadBodyBackgroundColor = yes => {
    //     // keep both, as they will have different styles on scss setup!
    //     yes ? $('body .vimp-config').addClass('preload-active') : $('body .vimp-config').removeClass('preload-active')
    //     yes ? $('body .vimp').addClass('preload-active') : $('body .vimp').removeClass('preload-active')
    // }

    // const resetState = () => {
    //     config.store.dispatch('setPreloadActiveState', false)
    //     clearTimeout(timeoutPreloadStart)
    //     clearTimeout(timeoutPreloadCanStop)
    //     timeoutPreloadStart = null
    //     timeoutPreloadCanStop = null
    //     loading = false
    //     setPreloadBodyBackgroundColor(false)
    // }

    // const startPreloader = () => {
    //     config.store.dispatch('setPreloadActiveState', true)
    //     setPreloadBodyBackgroundColor(true)
    //     timeoutPreloadCanStop = setTimeout(preloaderCanStop, datasource.getConfig().preloaderMinShowTimeMsec)
    // }

    // // once the preloader is started, there is a minimum time before it can stop.
    // // reason: smooth user-experience, avoid too short, nervous blinking of the preloader
    // const preloaderCanStop = () => {
    //     timeoutPreloadCanStop = null
    //     if (!loading) {
    //         finalize()
    //     }
    // }

    // const finalize = () => {
    //     resetState()
    //     setPreloadBodyBackgroundColor(false)
    //     if (typeof config.finalize === 'function') {
    //         config.finalize()
    //     }
    // }

    // const startPreloadControl = () => {
    //     if (enabled) {
    //         resetState()
    //         loading = true
    //         timeoutPreloadStart = setTimeout(startPreloader, datasource.getConfig().preloaderStartDelayMsec)
    //     }
    // }

    // // this breaks the first cycle
    // const contentLoaded = () => {
    //     if (enabled) {
    //         loading = false
    //         clearTimeout(timeoutPreloadStart)
    //         if (timeoutPreloadCanStop === null) {
    //             finalize()
    //         }
    //     }
    // }

    // // public functions
    // this.startPreloadControl = startPreloadControl
    // this.contentLoaded = contentLoaded
}
export default R2D2DataHandler
