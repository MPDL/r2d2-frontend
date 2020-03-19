import Vue from 'vue'
import VueRouter from 'vue-router'
import DefaultPage from '../views/DefaultPage.vue'

const root = {
    mode: 'hash',
    scrollBehavior: () => ({ y: 0 }),
    routes: null
}

const createDynamicConfig = config => {
    root.routes = config.root
    const rt = _.find(root.routes, { children: 'structure' })
    rt.component = DefaultPage
    rt.children = config.routes
    root.routes.push(
        {
            path: '/admin',
            beforeEnter: (to, from, next) => {
                globals.touchedAdmin()
                setTimeout(() => next('/'), 100)
            }
        },
        {
            path: '/auth-confirm/:token',
            beforeEnter: (to, from, next) => {
                console.log('obj:fc to = ',to)
                const token = to.path.split('/').pop()
                datasource.authenticationConfirm(token)
                setTimeout(() => next('/'), 100)
            }
        }
    )
    return root
}
const getRouter = config => {
    Vue.use(VueRouter)
    const router = new VueRouter(createDynamicConfig(config))
    globals.registerRouter(router)
    return router
}
export default getRouter
