<template>
    <div id="app">
        <Background />
        <router-view class="view" />
    </div>
</template>

<script>
import Background from '@/components/Background'

export default {
    name: 'App',
    components: {
        Background
    },
    created() {
        console.log('APP:created this.$route.meta = ', this.$route.meta)
    }
}
</script>

<style lang="scss">
@import 'css/basics.scss';
@import 'css/dev-store.scss';

.background,
.view {
    margin: 0;
    padding: 0;
    position: absolute;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}


</style>
