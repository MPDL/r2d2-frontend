<template>
    <div class="result-zone">
        <b-tabs :key="uKey" v-model="tabIndex">
            <b-tab v-for="(result, index) in results" :key="index" class="tab hide-scrollbar">
                <template v-slot:title>
                    <div class="title">
                        <div class="tiny-close" @click="onClickRemove(result.ts)">
                            <div class="icon">x</div>
                        </div>
                        {{ result.key }}
                    </div>
                </template>
                <div class="info">
                    <div class="description">received: {{ getDate(result.ts) }} | from: {{ result.api }}</div>
                </div>
                <div class="scoll-area-edge"></div>
                <vue-custom-scrollbar class="scroll-area">
                    <vue-json-pretty :data="result.data"></vue-json-pretty>
                </vue-custom-scrollbar>
                <div class="scoll-area-edge"></div>
            </b-tab>
        </b-tabs>
    </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
import vueCustomScrollbar from 'vue-custom-scrollbar'

export default {
    name: 'ResultZone',
    components: {
        VueJsonPretty,
        vueCustomScrollbar
    },
    data() {
        return {
            results: {},
            uKey: 0,
            tix: null,
            tme: null
        }
    },
    created() {
        globals.eventBus.$on('onLoadResults', this.updateResults)
        this.tabIndex = null
        this.updateResults()
    },
    methods: {
        update() {
            this.uKey = this.uKey > 1000 ? 1 : ++this.uKey
        },
        updateTabActiveState() {
            // TODO unify this (redundant in result and request zone)
            let $sel = $('.result-zone .nav-item')
            $sel.removeClass('active')
            clearTimeout(this.tme)
            this.tme = setTimeout(() => {
                $sel = $('.result-zone .nav-item')
                $sel.removeClass('active')
                $($sel[this.tabIndex]).addClass('active')
            }, 100)
        },
        updateResults(evt) {
            this.results = _.values(datasource.getResults()).reverse()
            this.update()
            this.updateTabActiveState()
        },
        onClickRemove(ts) {
            datasource.removeResultByTs(ts)
            this.updateResults()
        },
        getResult(index) {
            console.log('RZ:getResult this.results[index] = ', this.results[index])
            console.log('RZ:getResult this.results[index].data = ', this.results[index].data)
            return this.results[index] && _.isPlainObject(this.results[index].data) ? this.results[index].data : null
        },
        getDate(ts) {
            const d = new Date(ts)
                .toISOString()
                .slice(0, 19)
                .split('T')
                .join('  ')
            // console.log('CT:getDate d = ', d)
            return d
        }
    },
    computed: {
        // TODO unify this (redundant in result and request zone)
        tabIndex: {
            get() {
                return this.tix
            },
            set(index) {
                this.tix = index
                this.updateTabActiveState(index)
            }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.result-zone {
    background-color: rgb(235, 250, 255);
    border: 1px solid #b9d3dc;
    border-radius: 5px;
    // this keeps the close buttons visible on top
    // TODO find better solution or dont use bootstrap tabs
    // if you want this look!
    padding-top: 6px;
    margin-top: -6px;
}
</style>
