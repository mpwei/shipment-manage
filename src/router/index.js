import { createRouter, createWebHistory } from 'vue-router'

const Routes = [
    {
        path: '/',
        component: () => import('../layout/main'),
        redirect: '/dashboard',
        children: [
            { path: '/dashboard', component: () => import('../page/index') },
            {
                path: '/record',
                component: () => import('../page/record/index'),
                children: [
                    { path: '/record/list', component: () => import('../page/record/list') },
                    { path: '/record/device', component: () => import('../page/record/device') },
                    { path: '/record/settings', component: () => import('../page/record/settings') },
                    { path: '/record/qrcode', component: () => import('../page/record/qrcode') },
                    { path: '/record/create', component: () => import('../page/record/create') }
                ]
            },
            {
                path: '/shipment',
                component: () => import('../page/shipment/index'),
                children: [
                    { path: '/shipment/list', component: () => import('../page/shipment/list') },
                    { path: '/shipment/get', component: () => import('../page/shipment/get') }
                ]
            }
        ]
    },
    { path: '/login', component: () => import('../page/login') }
]

export default createRouter({
    history: createWebHistory(),
    routes: Routes,
})
