<template>
    <div class="result-zone">
        <b-tabs :key="uKey">
            <b-tab v-for="(result, index) in results" :key="index" class="tab hide-scrollbar">
                <template v-slot:title>
                    <div class="title">
                        <div class="tiny-close" @click="onClickRemove(result.key)">
                            <div class="icon">x</div>
                        </div>
                        {{ result.key }}
                    </div>
                </template>
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
            results: [],
            uKey: 0
        }
    },
    created() {
        globals.eventBus.$on('onLoadResults', this.updateResults)
        this.updateResults()
    },
    methods: {
        update() {
            this.uKey = this.uKey > 1000 ? 1 : ++this.uKey
        },
        updateResults(evt) {
            this.results = datasource.getResults()
            this.update()
        },
        onClickRemove() {},
        getResult(index) {
            console.log('CT:getResult this.results[index] = ', this.results[index])
            console.log('CT:getResult this.results[index].data = ', this.results[index].data)
            return this.results[index] && _.isPlainObject(this.results[index].data) ? this.results[index].data : null
        }
    },
    mounted() {
        console.log('C:mounted:route  = ')
    },
    computed: {}
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
