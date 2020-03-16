<template>
    <div class="default-view">
        <!-- <b-nav>
            <b-nav-item active>Active</b-nav-item>
            <b-nav-item>Link</b-nav-item>
            <b-nav-item disabled>Disabled</b-nav-item>
        </b-nav> -->
        <RequestZone class="view" :config="searchZone" :uKey="uKey" />
        <Content class="view" :config="content" />
    </div>
</template>

<script>
// @ is an alias to /src
import Content from '@/components/Content.vue'
import RequestZone from '@/components/RequestZone.vue'

export default {
    name: 'default-view',
    data() {
        return {
            content: {
                label: 'mock-content'
            },
            searchZone: {
                'search-1': {}
            },
            navigation: {},
            uKey: 1
        }
    },
    components: {
        Content,
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
.default-view {
    .view {
        top: 120px;
        height: calc(100vh - 170px);
    }
    .request-zone {
        position: absolute;
        left: 10px;
        width: 400px;
        ::v-deep {
            .tab {
                // TODO find a better, inner-search-zone css for this!
                height: calc(100vh - 170px - 50px);
            }
            .scroll-area {
                // height: calc(100vh - 170px - 100px);
                width: 390px;
                overflow-y: auto;
                scrollbar-width: none;
                &::-webkit-scrollbar {
                    display: none;
                }
                .form-elements {
                    width: 378px;
                }
                .ps__thumb-x,
                .ps__thumb-y {
                    background-color: #b2d8d7;
                }
            }
        }
    }
    .content {
        position: absolute;
        top: 120px;
        left: 420px;
        width: calc(100vw - 400px - 20px - 170px);
        // height: calc(100vh - 165px - 80px);
        background-color: white;
    }
}
</style>
