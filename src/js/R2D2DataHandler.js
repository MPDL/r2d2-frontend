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
}
export default R2D2DataHandler
