<template>
    <div class="dev-store">
        <RequestZone class="view" :uKey="uKey" />
        <ResultZone class="view" />
    </div>
</template>

<script>
// @ is an alias to /src
import ResultZone from '@/components/ResultZone.vue'
import RequestZone from '@/components/RequestZone.vue'

export default {
    name: 'Devstore',
    data() {
        return {
            content: {
                label: 'mock-content',
                data: null
            },
            searchZone: {
                'search-1': {}
            },
            navigation: {},
            uKey: 1
        }
    },
    components: {
        ResultZone,
        RequestZone
    },
    created() {
        this.loadData()
    },
    methods: {
        update() {
            this.uKey = this.uKey > 1000 ? 1 : ++this.uKey
        },
        setNavigation(nav) {
            this.navigation = nav
        },
        async loadData() {
            const strc = await datasource.getStructure()
            this.setNavigation(strc.navigation)
            globals.defaultPageReady()
        }
    }
}
</script>

<style lang="scss" scoped>
.dev-store{
    .view {
        top: 120px;
        height: calc(100vh - 170px);
    }
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
