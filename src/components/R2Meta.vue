<template>
    <div class="meta-component">
        <FormCell class="form" :request="metaFormConfig"></FormCell>
    </div>
</template>

<script>
//
let r2
//
export default {
    name: 'Metadata',
    props: {
        config: Object,
        form: Object
    },
    data() {
        return {
            metaFormConfig: {
                form: {}
            }
        }
    },
    created() {
        r2 = globals.getDataHandler('r2d2')
        this.metaFormConfig.form = r2.getMetaFormHandler().getForm()

    },
    mounted() {
        this.formKey++
    },
    methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.meta-component {
    .form {
        border: 1px solid #86b1bd;
        border-radius: 5px;
        padding: 12px;
    }
}
</style>
