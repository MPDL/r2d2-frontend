const DynamicFormHandler = function() {
    //
    const LY = {
        START: '_START',
        END: '_END',
        ADD: '_ADD',
        REMOVE: '_REMOVE',
        ACTIONS: '_ACTIONS',
        START_OF_LIST: '_START_OF_LIST',
        END_OF_LIST: '_END_OF_LIST'
    }
    //
    let sortingTree = null
    let indexTree = null
    let sortedData = null
    let sortedDataWithLayoutElements = null
    let form = null
    let schema = {}
    //
    const createNewForm = (rawFormData, $schema) => {
        if (_.isPlainObject($schema)) {
            schema = $schema
        }
        // TEST ON
        // rawFormData = metaRawData1
        // rawFormData = {}
        // schema = schema1
        //
        //
        form = {}
        sortedData = []
        sortedDataWithLayoutElements = []
        sortingTree = []
        indexTree = {}
        createSortingTree(schema, sortingTree)
        // console.log('INIT:CST: sortingTree = ', sortingTree)
        // console.log('INIT:CST: schema = ', schema)
        // 2. move all raw data into correct order by schema
        sortRawDataByTree(rawFormData, sortedData, sortingTree)
        const d = _.cloneDeep(sortedData) // TODO check if still needed ?
        // 3. create the index-tree for list-length tracking by following recursive functions
        createIndexTree(d)
        // 4. add the basic layout tags (list start/end)
        addLayoutElements(d, sortedDataWithLayoutElements)
        // 5. create the final form and add the add/remove tags (uses the index-tree)
        scanAndCreateForm(sortedDataWithLayoutElements, form)
        return form
    }
    //
    this.getForm = (data = null, schema = null) => (data ? createNewForm(data, schema) : form)
    // this.getForm = () => {} // TEST ON
    //
    this.getData = () => collectData()

    //
    const createSortingTree = (source = {}, target = []) => {
        _.each(source, (elm, key) => {
            if (key !== '__0') {
                let node = null
                if (_.isArray(elm) && _.isPlainObject(elm[0]) && elm[0].__0 && elm[0].__0.sublist) {
                    node = { key, sub: [[]] }
                    target.push(node)
                    createSortingTree(elm[0], node.sub[0])
                } else {
                    node = { key, value: _.isUndefined(elm.default) ? null : elm.default }
                    target.push(node)
                }
            }
        })
    }

    const sortRawDataByTree = (srcNnode, tgNode = [], reference = []) => {
        if (_.isArray(srcNnode)) {
            if (srcNnode.length === 0) {
                srcNnode[0] = _.cloneDeep(reference)
            }
            let index = -1
            _.each(srcNnode, elm => {
                if (!_.isNil(elm)) {
                    index++
                    tgNode[index] = []
                    sortRawDataByTree(elm, tgNode[index], reference[0])
                }
            })
        }
        const missingKeys = {}
        _.each(reference, (rfObj, index) => {
            const key = rfObj.key
            if (_.isNil(srcNnode)) {
                srcNnode = {}
            }
            if (Object.keys(srcNnode).indexOf(key) > -1) {
                tgNode[index] = { key }
                if (rfObj.sub) {
                    tgNode[index].sub = []
                    sortRawDataByTree(srcNnode[key], tgNode[index].sub, rfObj.sub)
                } else {
                    tgNode[index].value = srcNnode[key]
                }
            } else {
                if (!_.isArray(srcNnode)) {
                    missingKeys[key] = { key, index }
                }
            }
        })
        _.each(missingKeys, msObj => {
            // this creates the complete structure below every missing node!
            // no need to start a recursion here
            let cloned = _.cloneDeep(reference[msObj.index])
            if (cloned.sub) {
                cloned.sub = [cloned.sub]
            }
            tgNode[msObj.index] = cloned
        })
    }

    // this holds the index data of all levels
    // needed to recursive detect when a list ends

    const createIndexTree = (source, parentTree = null) => {
        let key = null
        const setIndexInfo = (node, key) => {
            if (_.isString(node.key)) {
                indexTree[key] = {
                    nodeLength: node.sub.length,
                    index: 0
                }
            }
        }
        if (_.isArray(source)) {
            _.each(source, (node, index) => {
                if (_.isArray(node)) {
                    _.each(node, obj => {
                        if (obj.sub) {
                            const idx = index + 0
                            key = parentTree ? `${parentTree}.${idx}` : idx.toString()
                            createIndexTree(obj, key)
                        }
                    })
                } else if (node.sub) {
                    key = parentTree ? `${parentTree}.${node.key}` : node.key
                    setIndexInfo(node, key)
                    createIndexTree(node.sub, key)
                }
            })
        } else if (source.sub) {
            key = parentTree ? `${parentTree}.${source.key}` : source.key
            setIndexInfo(source, key)
            createIndexTree(source.sub, key)
        }
    }

    const addLayoutElements = (source, target = []) => {
        const start = { layout: LY.START_OF_LIST, label: 'Start' }
        const end = { layout: LY.END_OF_LIST, label: 'End' }
        let node2add
        if (_.isArray(source)) {
            target.push(start)
            _.each(source, node => {
                if (_.isArray(node)) {
                    const targetL2 = []
                    target.push(targetL2)
                    targetL2.push(start)
                    _.each(node, nodeL2 => {
                        // TODO check if this block could be replaced by a direct recursion,
                        // looks a bit redundant !
                        if (_.isArray(nodeL2)) {
                            // go deeper
                            addLayoutElements(nodeL2, targetL2)
                        } else if (nodeL2.sub) {
                            node2add = { key: nodeL2.key, sub: [] }
                            targetL2.push(node2add)
                            // go deeper
                            addLayoutElements(nodeL2.sub, node2add.sub)
                        } else {
                            // finalize recursion here
                            targetL2.push(_.cloneDeep(nodeL2))
                        }
                    })
                    targetL2.push(end)
                } else if (_.isArray(node.sub)) {
                    node2add = { key: node.key, sub: [] }
                    target.push(node2add)
                    // go deeper
                    addLayoutElements(node.sub, node2add.sub)
                } else {
                    // finalize recursion here
                    target.push(_.cloneDeep(node))
                }
            })
            target.push(end)
        }
    }

    const getLayoutItem = (tree, args) => {
        tree = args.treeAdd ? [...tree, args.treeAdd] : [...tree]
        const item = {
            type: 'LY',
            label: '',
            spLabel: tree.join('.'),
            __strc: {
                level: args.level,
                class: `level-${args.level}`,
                tree
            }
        }
        const props = 'startNode,endNode,addNode,removeNode,shift2FirstNode,shift1UpNode,shift1DownNode,shift2LastNode'.split(
            ','
        )
        _.each(props, key => {
            item[key] = args[key] === true
        })

        return item
    }

    const getTree = tree => {
        // TODO cleanup this, contains some not longer used results
        tree = tree.length === 0 ? [''] : tree
        tree = _.isString(tree) ? tree.split('.') : [...tree]
        _.each(tree, (val, index) => {
            tree[index] = isNaN(parseInt(val)) ? val : parseInt(val)
        })

        const schemaTree = []
        _.each(tree, val => {
            schemaTree.push(isNaN(val) ? val : 0)
        })

        const res = {
            tree: [...tree],
            schemaTree,
            objectPath: tree.reduce((acc, val) => (isNaN(val) ? `${acc}.${val}` : acc)),
            arrayPath: tree.reduce((acc, val) => `${acc}.${val.toString()}`)
        }
        //
        const t0 = [...tree]
        const val1 = t0.pop()
        const val2 = t0.pop()
        res.lastIndex = !isNaN(val1) ? val1 : !isNaN(val2) ? val2 : -1
        res.lastKey = _.isString(val1) ? val1 : val2
        //
        const t1 = [...tree]
        res.keyEndingTree = t1
        res.keyEndingArrayPath = res.arrayPath
        if (_.isNumber(_.last(t1))) {
            t1.pop()
            res.keyEndingTree = t1
            res.keyEndingArrayPath = ''
            if (t1.length > 0) {
                res.keyEndingArrayPath = t1.reduce((acc, val) => `${acc}.${val.toString()}`)
            }
        }
        //
        const t2 = [...tree]
        res.indexEndingTree = t2
        res.indexEndingArrayPath = res.arrayPath
        if (_.isString(_.last(t2))) {
            t2.pop()
            res.indexEndingTree = t2
            res.indexEndingArrayPath = ''
            if (t2.length > 0) {
                res.indexEndingArrayPath = t2.reduce((acc, val) => `${acc}.${val.toString()}`)
            }
        }
        let t
        let n = null
        t = [...res.indexEndingTree].reverse()
        while (t.length > 1) {
            const v = t.pop()
            if (_.isString(v)) {
                n = n ? `${n}.${v}` : v
            } else {
                n = `${n}[${v}]`
            }
        }
        let e = null
        t = [...res.tree].reverse()
        while (t.length > 0) {
            const v = t.pop()
            if (_.isString(v)) {
                e = e ? `${e}.${v}` : v
            } else {
                e = `${e}[${v}]`
            }
        }

        res.nodeGetPath = n
        res.endPointGetPath = e
        return res
    }

    const scanAndCreateForm = (source, target = {}, tree = []) => {
        const getCombinedTree = ($tree, $add = []) => {
            const tr = $tree.length > 0 ? [...$tree, ...$add] : [...$add]
            return getTree(tr)
        }
        const getLabelItem = $t => {
            return getFormItem($t.tree, null, {
                level: $t.tree.length,
                type: 'label',
                label: $t.arrayPath
            })
        }
        let t = null
        let index = -1
        let level = null
        _.each(source, node => {
            if (_.isArray(node)) {
                index++
                t = getCombinedTree(tree, [index])
                target[t.arrayPath] = getLabelItem(t)
                scanAndCreateForm(node, target, t.tree) // OK
            } else if (_.isArray(node.sub)) {
                t = getCombinedTree(tree, [node.key])
                target[t.arrayPath] = getLabelItem(t)
                scanAndCreateForm(node.sub, target, t.tree)
            } else if (node.layout) {
                const items = []
                let ly = null
                level = tree.length
                t = getCombinedTree(tree)
                const indexInfo = indexTree[t.keyEndingArrayPath]
                const sh = _.get(schema, t.schemaTree)
                // TODO check why 'sh' sometimes gets undefined here, should not happen!!
                const layout = sh && sh.__0 && sh.__0.sublist ? node.layout : null
                switch (layout) {
                    case LY.START_OF_LIST:
                        ly = getLayoutItem(tree, { level, addNode: true, treeAdd: LY.ADD })
                        level > 1 ? items.push(ly) : null
                        //
                        ly = getLayoutItem(tree, { level, startNode: true, treeAdd: LY.START })
                        items.push(ly)
                        let canUp = false
                        let canDown = false
                        if (indexInfo && indexInfo.nodeLength > 1) {
                            canUp = indexInfo.index > 0
                            canDown = indexInfo.index < indexInfo.nodeLength - 1
                        }
                        //
                        ly = getLayoutItem(tree, {
                            level,
                            removeNode: true,
                            shift1UpNode: canUp,
                            shift2FirstNode: canUp,
                            shift1DownNode: canDown,
                            shift2LastNode: canDown,
                            treeAdd: LY.ACTIONS
                        })
                        level > 1 ? items.push(ly) : null
                        break
                    case LY.END_OF_LIST:
                        ly = getLayoutItem(tree, { level, startNode: true, treeAdd: LY.END })
                        items.push(ly)
                        //
                        if (indexInfo) {
                            indexInfo.index++
                            ly = getLayoutItem(tree, { level, addNode: true, treeAdd: LY.ADD })
                            level > 1 ? items.push(ly) : null
                            // set a additional add (+1) tag ad the end of the list
                            if (indexInfo.index >= indexInfo.nodeLength) {
                                const tr = [...tree]
                                let last = tr.pop()
                                last++
                                if (!isNaN(last) && level > 1) {
                                    tr.push(last)
                                    ly = getLayoutItem(tr, { level, addNode: true, treeAdd: LY.ADD })
                                    items.push(ly)
                                }
                            }
                            indexInfo.index >= indexInfo.nodeLength
                        }
                        break
                }
                _.each(items, item => {
                    target[item.__strc.tree.join('.')] = item
                })
            } else {
                t = getCombinedTree(tree, [node.key])
                target[t.arrayPath] = getFormItem(t.tree, node.value, { level: tree.length })
            }
        })
    }

    const getFormItem = (tree, value, args) => {
        const res = _.get(schema, getTree(tree).schemaTree)
        const key = tree.join('--')
        const defaultItem = {
            type: 'input',
            label: tree.join('.')
        }
        let item = res && _.isPlainObject(res.__0) && _.isString(res.__0.type) ? res.__0 : defaultItem
        item = _.cloneDeep(item)
        const add = {
            __strc: {
                level: args.level,
                class: `level-${args.level}`,
                tree
            },
            selected: value,
            key,
            sendKey: key, // ??
            label: tree
                .join('.')
                .split('.')
                .pop() // TEST
        }
        item = { ...item, ...add }

        // overrides
        if (_.isString(args.type)) {
            item.type = args.type
        }
        if (_.isString(args.label)) {
            item.label = args.label
        }
        //
        item.label = `${item.label}:` // mock hardcoded, TODO: generate i18n id here!
        //
        if (item.type === 'dropdown') {
            item = globals.setupDropdownFormCell(item)
        } else {
            // MOCK just remove the annoying bootstrap propz error :-((
            // TODO get this working
            item.selected = _.isArray(item.selected) ? item.selected.join(',') : item.selected
        }
        //
        item.show = true
        return item
    }
    //
    const collectData = () => {
        const res = {}
        const filtered = {}
        const depthSorted = []
        _.each(form, (obj, key) => {
            if (obj.type !== 'LY' && obj.type !== 'label') {
                filtered[key] = obj
            }
        })
        // sort by depth
        // this takes care that later appearing, less-depth nodes
        // DON'T overwrite already written deeper nodes!
        const depthSortOnLevel = (source, depth = 1) => {
            _.each(source, (obj, key) => {
                if (key.split('.').length === depth) {
                    depthSorted.push({ key, obj })
                    delete source[key]
                }
            })
            if (Object.keys(source).length > 0) {
                depthSortOnLevel(source, depth + 1)
            }
        }
        depthSortOnLevel(filtered)
        //
        _.each(depthSorted, obj => {
            const value = form[obj.key]
            const t = getTree(obj.key)
            const tree = t.tree.reverse()
            const sTree = t.schemaTree.reverse()
            const path = []
            const sPath = []
            while (tree.length) {
                const p1 = tree.pop()
                const p2 = tree.pop()
                const sp1 = sTree.pop()
                const sp2 = sTree.pop()
                path.push(p1)
                sPath.push(sp1)
                if (_.isArray(_.get(schema, sPath))) {
                    path.push(p2)
                    sPath.push(sp2)
                }
            }
            // TODO set the collect-data-format(schema) optionally here!
            // _.set(res, path, { selected: value.selected })
            _.set(res, path, value.selected)
        })
        return res
    }

    const nodeJob = (action, data, tree, args = {}) => {
        // add at index
        // shift by index delta
        const tr = [...tree]
        const key = tr.pop()
        let node = data
        const isArrayNode = !isNaN(key)

        tr.reverse()
        while (tr.length) {
            const n = tr.pop()
            node = node[n]
        }

        // console.log('NJ: tree = ', tree)
        // console.log('NJ: key = ', key)
        // console.log('NJ: node = ', node)

        switch (action) {
            case 'remove': // ok
                isArrayNode ? node.splice(key, 1) : delete node[key]
                break
            case 'add': // ok
                isArrayNode ? node.splice(key, 0, true) : null
                break
            case 'shift': // ok
                if (isArrayNode) {
                    let key2 = key + args.delta
                    key2 = args.delta === '2first' ? 0 : key2
                    key2 = args.delta === '2last' ? node.length - 1 : key2
                    key2 = key2 < 0 ? 0 : key2
                    key2 = key2 > node.length - 1 ? node.length - 1 : key2
                    const elm = node.splice(key, 1)[0]
                    node.splice(key2, 0, elm)
                }
                break
        }
        return true
    }

    this.modifyForm = args => {
        const meta = collectData()
        args.tree.pop()
        if (args.action === 'removeNode') {
            nodeJob('remove', meta, args.tree)
        }
        switch (args.action) {
            case 'removeNode':
                nodeJob('remove', meta, args.tree)
                break
            case 'addNode':
                nodeJob('add', meta, args.tree)
                break
            case 'shift1UpNode':
                nodeJob('shift', meta, args.tree, { delta: -1 })
                break
            case 'shift1DownNode':
                nodeJob('shift', meta, args.tree, { delta: 1 })
                break
            case 'shift2FirstNode':
                nodeJob('shift', meta, args.tree, { delta: '2first' })
                break
            case 'shift2LastNode':
                nodeJob('shift', meta, args.tree, { delta: '2last' })
                break
        }
        console.log('MF:END meta = ', meta)
        createNewForm(meta)
    }

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++ TEST & MOCKDATA
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    const metaRawData1 = {
        title: 'test metadata',
        authors: [
            {
                givenName: 'author 1',
                familyName: 'foo 1',
                nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
                affiliations: [
                    {
                        id: 'affy-1',
                        organization: '',
                        department: 1 // select by index test
                    }
                ]
            },
            {
                givenName: 'author 2',
                familyName: 'foo 2',
                nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
                affiliationsXX: [
                    {
                        id: null,
                        organization: '',
                        department: 0 // select by index test
                    }
                ]
            },
            {
                givenName: 'author 3',
                familyName: 'foo 3',
                nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
                affiliations: [
                    {
                        id: null,
                        organization: '',
                        department: 'department 2'
                    },
                    {
                        id: 'zzk-22',
                        organization: 'fzdgduzfg',
                        department: 'area 51'
                    },
                    {
                        id: 'msg-5555',
                        organization: 'tizoiho',
                        department: '42'
                    }
                ]
            }
        ],
        // doi: '12345',
        description: 'fourth try to create a dataset via drag',
        genres: ['g1', 'g2'],
        keywords: ['kw1', 'kw2'],
        correspondingPapers: [
            {
                title: 'paper 1',
                url: null,
                type: null,
                identifier: null,
                identifierType: 'identifierType paper 1'
            },
            {
                title: 'paper 2',
                url: null,
                type: null,
                identifier: null,
                identifierType: 'identifierType paper 2'
            }
        ],
        license: 'lcs 123',
        language: ['de', 'ru']
    }

    const schema1 = {
        title: {
            __0: {
                type: 'input',
                label: 'title',
                default: 'dedault title'
            }
        },
        description: {},
        language: {},
        doi: {
            default: 'doiiii-123'
        },
        license: {},
        genres: {},
        keywords: {},

        authors: [
            {
                __0: {
                    sublist: true
                },
                givenName: {},
                familyName: {},
                nameIdentifier: {},
                affiliations: [
                    {
                        __0: {
                            sublist: true
                        },
                        department: {
                            __0: {
                                // TESTDATA
                                type: 'dropdown',
                                label: 'authors.affiliations.department TEST',
                                sendKey: '',
                                options: ['a', 'b', 'c', 'd']
                            },
                            default: 2
                        },
                        organization: { default: 'affy-orgaaa' },
                        id: {
                            default: '1234-oo'
                        }
                    }
                ]
            }
        ],

        correspondingPapers: [
            {
                __0: {
                    sublist: true
                },
                url: {},
                type: {},
                identifier: {},
                identifierType: {}
            }
        ]
    }

    // simple structure test

    const metaRawData2 = {
        correspondingPapers: [
            {
                title: 'paper 1',
                url: null,
                type: null,
                identifier: null,
                identifierType: 'identifierType paper 1',
                sub2test: [
                    {
                        val1: '1-123',
                        val2: '1-456'
                    }
                ]
            },
            {
                title: 'paper 2',
                url: null,
                type: null,
                identifier: null,
                // identifierType: 'identifierType paper 2',
                sub2test: [
                    {
                        val1: '2-123',
                        val2: '2-456'
                    }
                ]
            }
        ]
    }

    const schema2 = {
        correspondingPapers: [
            {
                __0: {
                    sublist: true
                },
                url: { default: '123' },
                type: {},
                identifier: {},
                identifierType: { default: '456' },
                sub2test: [
                    {
                        __0: {
                            sublist: true
                        },
                        val1: {},
                        val2: {}
                    }
                ]
            }
        ]
    }

    //

    const metaRawData3 = {
        title: 'test metadata',
        authors: [
            // {
            //     givenName: 'author 1',
            //     familyName: 'foo 1',
            //     nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
            //     affiliations: [
            //         {
            //             id: 'affy-1',
            //             organization: '',
            //             department: 1 // select by index test
            //         }
            //     ]
            // },
            // {
            //     givenName: 'author 2',
            //     familyName: 'foo 2',
            //     nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
            //     affiliationsXX: [
            //         {
            //             id: null,
            //             organization: '',
            //             department: 0 // select by index test
            //         }
            //     ]
            // },
            {
                givenName: 'author 3',
                familyName: 'foo 3',
                nameIdentifier: 'https://orcid.org/1234-1234-1234-1234',
                affiliations: [
                    {
                        id: 'aff-0-id-set',
                        organization: '',
                        department: 'aff department 2'
                    },
                    null,
                    {
                        id: 'aff-1-id-set',
                        organization: 'fzdgduzfg',
                        department: 'area 51'
                    },
                    {
                        id: 'aff-2-id-set',
                        organization: 'tizoiho',
                        department: 'aff dp 42'
                    }
                ]
            }
        ]
    }

    const schema3 = {
        description: {
            default: 'default description'
        },
        authors: [
            {
                __0: {
                    sublist: true
                },
                // test1: {},
                // test2: {},
                // test3: {},
                // test4: {},
                // givenName: {},
                // familyName: {},
                givenName: {
                    default: 'default: name-id'
                },
                affiliations: [
                    {
                        __0: {
                            sublist: true
                        },
                        // department: {
                        //     __0: {
                        //         // TESTDATA
                        //         type: 'dropdown',
                        //         label: 'authors.affiliations.department TEST',
                        //         sendKey: '',
                        //         options: ['a', 'b', 'c', 'd']
                        //     },
                        //     default: 2
                        // },
                        // organization: { default: 'affy-orgaaa' },
                        id: {
                            default: 'default: affy-id'
                        }
                    }
                ]
            }
        ]
    }
}

export default DynamicFormHandler
