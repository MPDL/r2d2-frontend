<template>
    <div class="head-navigation">
        <div class="left">
            <router-link to="/devstore" active-class="active">devstore</router-link>
            <span>{{ span }}</span>
            <router-link to="/prototype" active-class="active">prototype</router-link>
        </div>
        <!-- <div class="left" v-html="$t('head.title')"></div> -->
        <!-- <div class="right">
            <div class="logo">
                <div class="image"></div>
            </div>
            <div class="legal" v-html="right"></div>
        </div> -->
    </div>
</template>

<script>
export default {
    name: 'HeadNavigation',
    data() {
        return {
            tx: 299,
            span: '  ::  '
        }
    },
    computed: {
        right() {
            const keyz = 'terms,sp,imprint,sp,disclaimer'.split(',')
            const trns = []
            _.each(keyz, key => {
                const i18n = this.$t(`head.${key}`)
                trns.push(`<a href='#/welcome/${key}'>${i18n}</a>`)
            })
            return trns.join(' ')
        }
    }
}
</script>

<style lang="scss">
.head-navigation {
    //
    position: absolute;
    top: 0px;
    height: 24px;
    width: 100vw;
    line-height: 26px;
    font-size: 14px;
    font-weight: 500;
    background: linear-gradient(
        to right,
        rgba(232, 250, 255, 0.6) 0%,
        rgba(201, 242, 241, 0.6) calc(100% - 200px),
        rgba(201, 242, 241, 0) calc(100% - 80px),
        rgba(125, 185, 232, 0) 100%
    );

    // TODO make this centralized and dynamic, due to length of translated texts!
    // @media (max-width: 760px) {
    //     height: 48px;
    // }
    a {
        color: #9b9697;
        text-decoration: none;
        &:hover {
            color: #7d7c7c;
            text-decoration: none;
        }
        &.active {
            color: #2b6565;
            text-decoration: none;
        }

        // cursor: pointer;
    }

    .left {
        float: left;
        margin-left: 10px;
        cursor: pointer;
        font-weight: 400;
    }

    .right {
        float: right;
        .legal {
            float: right;
            margin-right: 10px;
            cursor: pointer;
            // TODO see top
            // @media (max-width: 760px) {
            //     position: absolute;
            //     left: 10px;
            //     top: 20px;
            // }
        }
        .logo {
            float: right;
            width: 175px;
            height: 56px;
            background-color: #f9f9f1;
            border-radius: 0 0 0 10px;
            // TODO see top
            // @media (max-width: 530px) {
            //     right: unset;
            //     left: calc(530px - 175px);
            // }
            // TODO see top
            // @media (max-width: 760px) {
            //     position: absolute;
            //     float: unset;
            //     right: 0px;
            // }
            .image {
                position: absolute;
                $url: '../assets/mpdl-logo.png';
                // background-image: url($url);
                background-repeat: no-repeat;
                background-size: contain;
                width: 160px;
                height: 60px;
                margin: 5px;
            }
        }
    }
}
</style>
