import Vue from 'vue'
import VueRouter from 'vue-router'
const COMPONENTS = {
    DefaultView: () => import('../views/DefaultView.vue'),
    DevStore: () => import('../views/DevStore.vue'),
    'R2-Prototype': () => import('../views/R2-Prototype.vue')
}

const root = {
    mode: 'hash',
    scrollBehavior: () => ({ y: 0 }),
    routes: null
}

const createDynamicConfig = config => {
    root.routes = config.root
    const rt = _.find(root.routes, { children: 'structure' })
    rt.component = COMPONENTS[rt.component] || COMPONENTS.DefaultPage
    rt.children = config.routes
    _.each(rt.children, (value, index) => {
        rt.children[index].component = COMPONENTS[rt.children[index].component] || null

    })
    // root.routes.push(
    //     {
    //         path: '/admin',
    //         beforeEnter: (to, from, next) => {
    //             globals.touchedAdmin()
    //             setTimeout(() => next('/'), 100)
    //         }
    //     },
    //     {
    //         path: '/auth-confirm/:token',
    //         beforeEnter: (to, from, next) => {
    //             console.log('obj:fc to = ',to)
    //             const token = to.path.split('/').pop()
    //             datasource.authenticationConfirm(token)
    //             setTimeout(() => next('/'), 100)
    //         }
    //     }
    // )
    return root
}
const getRouter = config => {
    Vue.use(VueRouter)
    const router = new VueRouter(createDynamicConfig(config))
    globals.registerRouter(router)
    return router
}
export default getRouter
