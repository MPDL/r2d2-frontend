<template>
    <div class="background">
        <Layer1 />
        <div class="logo heidi-cool"></div>
        <div class="logo heidi-splash"></div>
        <div class="logo dev-store-splash"></div>
    </div>
</template>

<script>
import Layer1 from '@/assets/bg-gradient-1.svg'

export default {
    name: 'Background',
    components: {
        Layer1
    },
    props: {
        icon: String
    },
    created() {
        // this.icon = this.icon || 'tuccy'
    }
}
</script>

<style lang="scss" scoped>
.background {
    // border: 4px solid green;
    ::v-deep {
        svg {
            transform-origin: top left;
            transform: scale(2.5);
        }
    }
    .logo {
        background-repeat: no-repeat;
        width: 100%;
        height: 100%;
        position: absolute;
        // visibility: hidden;
        &.heidi-cool {
            $url: '~@/assets/heidi-cool.png';
            background-image: url($url);
            background-size: 300px;
            left: calc(100vw - 230px);
            top: 10px;
        }
        &.heidi-splash {
            $url: '~@/assets/heidi-splash.png';
            background-image: url($url);
            background-size: 180px;
            left: calc(100vw - 296px);
            top: 30px;
        }
        &.dev-store-splash {
            $url: '~@/assets/dev-store-splash.png';
            background-image: url($url);
            background-size: 80px;
            left: calc(100vw - 206px);
            top: 95px;
        }
    }
}
//
</style>
