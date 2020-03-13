import Vue from 'vue'
import VueRouter from 'vue-router'
import DefaultPage from '../views/DefaultPage.vue'
import Globals from './Globals'

const routesXX = [
    {
        path: '*',
        meta: {
            i18nKey: 'navigation.nested'
        },
        component: DefaultPage,
        children: [
            {
                path: 'tools',
                alias: 'tools/*',
                props: true,
                params: {
                    groupKey: 'tools'
                },
                meta: {
                    mainKey: 'tools',
                    subKey: null,
                    i18nKey: 'navigation.tools'
                }
            },
            {
                path: 'running',
                alias: 'running/*',
                props: true,
                params: {
                    groupKey: 'running'
                },
                meta: {
                    mainKey: 'running',
                    subKey: null,
                    i18nKey: 'navigation.running'
                }
            },
            {
                path: 'start',
                props: true,
                params: {
                    groupKey: 'start'
                },
                meta: {
                    mainKey: 'start',
                    subKey: null,
                    i18nKey: 'navigation.start'
                },
                children: [
                    {
                        path: 'management',
                        props: true,
                        params: {
                            groupKey: 'management'
                        },
                        meta: {
                            mainKey: 'start',
                            subKey: 'management',
                            i18nKey: 'navigation.management'
                        }
                    },
                    {
                        path: 'legal',
                        props: true,
                        params: {
                            groupKey: 'legal'
                        },
                        meta: {
                            mainKey: 'start',
                            subKey: 'legal',
                            i18nKey: 'navigation.legal'
                        }
                    }
                ]
            },
            {
                path: 'start/*',
                redirect: 'start'
            },
            {
                path: 'share',
                props: true,
                params: {
                    groupKey: 'share'
                },
                meta: {
                    mainKey: 'share',
                    subKey: null,
                    i18nKey: 'navigation.share'
                }
            }
        ]
    }
]
const rootXX = {
    mode: 'hash',
    linkActiveClass: 'open active',
    scrollBehavior: () => ({ y: 0 }),
    routes: [
        {
            path: '/',
            redirect: '/start'
        },
        {
            path: '*',
            meta: {
                i18nKey: 'navigation.root'
            },
            component: DefaultPage,
            children: []
        }
    ]
}

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

    console.log('RT:createDynamicConfig routes root = ', root)
    return root
}
// mode: ‘history’
const getRouter = config => {
    Vue.use(VueRouter)
    const router = new VueRouter(createDynamicConfig(config))
    globals.registerRouter(router)
    return router
}
export default getRouter
