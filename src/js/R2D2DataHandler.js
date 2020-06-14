const R2D2DataHandler = function() {
    //
    this.getDatasets = (data, options = {}) => {
        console.log('R2:getDatasets data = ', data)
        const res = {}
        if (options.as === 'key-list') {
            _.each(data.hits.hits, (value, index) => {
                const d = {
                    key: value._id,
                    title: value._source.metadata.title
                }
                d.label = `${d.title} | ${d.key}`
                res[value._id] = d
            })
        }
        return res
    }
    //
    this.getFilesOfDataset = (data, options = {}) => {
        console.log('R2:getFilesOfDataset data = ', data)
        const res = {}
        if (options.as === 'key-list') {
            _.each(data.files, (value, index) => {
                const d = {
                    key: value.id,
                    title: value.filename
                }
                d.label = `${d.title} | ${d.key}`
                res[value.id] = d
            })
        }
        return res
    }

    // this.getMetadataOfDataset = (data, options = {}) => data.metadata || null

    const metadata = {
        title: 'drag 4',
        authors: [
            {
                givenName: 'Markus',
                familyName: 'Haarländer',
                nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
                affiliations: [
                    {
                        id: null,
                        organization: '',
                        department: ''
                    }
                ]
            }
        ],
        doi: 'n(a',
        description: 'fourth try to create a dataset via drag',
        genres: [''],
        keywords: [''],
        license: '',
        language: '',
        correspondingPapers: [
            {
                title: '',
                url: null,
                type: null,
                identifier: null,
                identifierType: null
            }
        ]
    }

    this.getMetadataOfDataset = (data, options = {}) => metadata

    // ++++++++++++++++++++++++++
    // +++++++ prototype page
    // ++++++++++++++++++++++++++

    const ppStates = {
        selectedDataset: null,
        selectedFile: null
    }
    this.ppSetSelectedDataset = (key = null) => (ppStates.selectedDataset = key)
    this.ppGetSelectedDataset = () => ppStates.selectedDataset

    this.ppSetSelectedFile = (key = null) => (ppStates.selectedFile = key)
    this.ppGetSelectedFile = () => ppStates.selectedFile

    this.ppGetRequests = async () => {
        const raw = datasource.getRequests()
        const requests = {}
        let rq
        let id
        // login
        // clone request as its inner data gets mutated !
        id = 'r2d2-login'
        rq = requests[id] = _.cloneDeep(raw[id])
        console.log('R2:getPrototypePageRequests rq = ', rq)
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
        id = 'r2d2-get-datasets'
        rq = requests[id] = _.cloneDeep(raw[id])
        rq.form['keys'].label = 'query:'
        rq.form['keys'].type = 'value-cell'
        rq.api.schema.data = ''
        rq.description = 'lists all datasets'
        // get files
        // clone request as its inner data gets mutated !
        id = 'r2d2-get-dataset'
        rq = requests[id] = _.cloneDeep(raw[id])
        rq.form['file-id-select'].label = 'dataset-id:'
        rq.form['file-id-select'].type = 'value-cell'
        rq.form['file-id-select'].updateEventKey = `update--${id}`
        rq.description = 'lists all files of a dataset'
        console.log('R2:getPrototypePageRequests requests = ', requests)
        // change metadata
        // clone request as its inner data gets mutated !
        id = 'r2d2-pp-change-metadata'
        rq = requests[id] = _.cloneDeep(raw[id])
        rq.form['file-id'].updateEventKey = `update--${id}`
        rq.form['metadata'].updateEventKey = `update--${id}`
        //
        console.log('R2:getPrototypePageRequests requests = ', requests)
        return requests
    }
}
export default R2D2DataHandler
