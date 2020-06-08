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

        // login
        // clone request as its inner data gets mutated !
        rq = requests['r2d2-login'] = _.cloneDeep(raw['r2d2-login'])
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
        rq = requests['r2d2-get-datasets'] = _.cloneDeep(raw['r2d2-get-datasets'])
        rq.form['keys'].label = 'query:'
        rq.form['keys'].type = 'value-cell'
        rq.api.schema.data = ''
        rq.description = 'lists all datasets'
        // get files
        // clone request as its inner data gets mutated !
        rq = requests['r2d2-get-dataset'] = _.cloneDeep(raw['r2d2-get-dataset'])
        // rq = this.cfgGetDataset.requests['r2d2-get-dataset'] = { ...requests['r2d2-get-dataset'] }
        rq.form['file-id-select'].label = 'dataset-id:'
        rq.form['file-id-select'].type = 'value-cell'
        rq.form['file-id-select'].updateEventKey = 'update--r2d2-get-dataset'
        rq.description = 'lists all files of a dataset'
        console.log('R2:getPrototypePageRequests requests = ', requests)

        return requests
    }
}
export default R2D2DataHandler
