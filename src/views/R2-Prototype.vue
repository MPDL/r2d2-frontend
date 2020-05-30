<template>
    <div class="r2-prototype">R2-Prototype</div>
</template>

<script>
// @ is an alias to /src
// import ResultZone from '@/components/ResultZone.vue'

export default {
    name: 'R2-Prototype',
    data() {
        return {
            // content: {
            //     label: 'mock-content',
            //     data: null
            // },
            // searchZone: {
            //     'search-1': {}
            // },
            // navigation: {},
            // uKey: 1
        }
    },
    components: {
        // ResultZone,
        // RequestZone
    },
    created() {
        this.loadData()
    },
    methods: {
        update() {
            this.uKey = this.uKey > 1000 ? 1 : ++this.uKey
        },
        setNavigation(nav) {
            // this.navigation = nav
        },
        async loadData() {
            // const strc = await datasource.getStructure()
            // this.setNavigation(strc.navigation)
            // globals.defaultPageReady()
        }
    }
}
</script>

<style lang="scss" scoped>
.r2-prototype {
    //
}
</style>
