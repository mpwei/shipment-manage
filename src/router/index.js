import { createRouter, createWebHistory } from 'vue-router'

const Routes = [
    {
        path: '/',
        component: () => import('../layout/main'),
        redirect: '/dashboard',
        children: [
            { path: '/dashboard', component: () => import('../page/index') },
            { path: '/device', component: () => import('../page/device') },
            { path: '/record', component: () => import('../page/record') },
            { path: '/settings', component: () => import('../page/settings') },
            { path: '/create', component: () => import('../page/create') }
        ]
    },
    { path: '/login', component: () => import('../page/login') }
]

export default createRouter({
    history: createWebHistory(),
    routes: Routes,
})
