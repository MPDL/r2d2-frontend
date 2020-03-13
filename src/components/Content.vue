<template>
    <div class="content">
        <div class="text">
            <p>key: {{ i18nKey }}</p>
        </div>
        <div data-editable :data-name="i18nKey" class="text" v-html="translation"></div>
    </div>
</template>

<script>
export default {
    name: 'Content',
    props: {
        config: Object
    },
    data() {
        return {
            i18nKey: null
        }
    },
    created() {
        const keys = globals.getCurrentRouterPath().keys
        if (this.routeNeedsUpdate(keys)) {
            this.i18nKey = `content.${keys.join('.')}`
        }
    },
    mounted() {
        console.log('C:mounted:route  = ')
    },
    watch: {
        $route(to, from) {
            const keys = globals.getCurrentRouterPath().keys
            if (this.routeNeedsUpdate(keys)) {
                this.i18nKey = `content.${keys.join('.')}`
            }
        }
    },
    computed: {
        translationKey() {
            return `${globals.getLocale()}.${this.i18nKey}`
        },
        // TODO better code for content & translation, optimize!
        content() {
            const keys = globals.getCurrentRouterPath().keys
            const i18nKey = `content.${keys.join('.')}`
            let content = this.$t(i18nKey)
            return content
        },
        translation() {
            const trns = this.$t(this.i18nKey)
            return trns.substring(0, 3) === '<p>' ? trns : globals.cmsWrap(trns)
        }
    },
    methods: {
        routeNeedsUpdate() {
            return true
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.content {
    // height: calc(100vh - 165px - 80px);
    // overflow: scroll;
    // max-width: 800px;
    .text {
        width: calc(100% - 50px);
        margin: 20px;
    }
}
</style>
