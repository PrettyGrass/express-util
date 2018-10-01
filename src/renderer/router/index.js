import Vue from 'vue'
import Router from 'vue-router'
/* Layout */
import Layout from '../views/layout/Layout'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)


/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
 **/
export const constantRouterMap = [
  // { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  {path: '/404', component: () => import('@/views/404'), hidden: true},

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: 'Dashboard',
    hidden: true,
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index')
    }]
  },
  /**
   {
     path: '/form',
     component: Layout,
     children: [
       {
         path: 'index',
         name: '表单',
         component: () => import('@/views/form/index'),
         meta: {title: '表单', icon: 'form'}
       }
     ]
   },
   {
     path: '/test',
     component: Layout,
     children: [
       {
         path: 'test',
         name: '测试',
         component: () => import('@/views/test/index'),
         meta: {title: '测试', icon: 'form'}
       }
     ]
   },
   */
  /**
   * xcode 项目相关
   * */
  {
    path: '/xcode',
    component: Layout,
    redirect: '/xcode/table',
    name: 'XCode工具',
    meta: {title: 'XCode工具', icon: 'xcode'},
    children: [
      {
        path: 'table',
        name: '新建项目',
        component: () => import('@/views/table/index'),
        meta: {title: '新建项目', icon: 'create_new_folder'}
      },
      {
        path: 'form',
        name: '新建模块',
        component: () => import('@/views/tree/index'),
        meta: {title: '新建模块', icon: 'create_new_folder'}
      },
      {
        path: 'rename',
        name: '重命名',
        component: () => import('@/views/tree/index'),
        meta: {title: '重命名', icon: 'create_new_folder'}
      }
    ]
  },
  /**
   * xcode 项目相关
   * */
  {
    path: '/component',
    component: Layout,
    redirect: '/component/open',
    name: 'iOS组件',
    meta: {title: 'iOS组件', icon: 'xcode'},
    children: [
      {
        path: 'open',
        name: '开源组件',
        component: () => import('@/views/table/index'),
        meta: {title: '开源组件', icon: 'create_new_folder'}
      },
      {
        path: 'close',
        name: '闭源组件',
        component: () => import('@/views/tree/index'),
        meta: {title: '闭源组件', icon: 'create_new_folder'}
      },
      {
        path: 'rename',
        name: '自研组件',
        component: () => import('@/views/tree/index'),
        meta: {title: '自研组件', icon: 'create_new_folder'}
      }
    ]
  },
  {
    path: '/setting',
    component: Layout,
    redirect: '/setting/app',
    name: '配置',
    meta: {title: '配置', icon: 'xcode'},
    children: [
      {
        path: 'app',
        name: '配置管理',
        component: () => import('@/views/config/index'),
        meta: {title: '配置管理', icon: 'setting'}
      }
    ]
  },
  {
    path: '/test',
    component: Layout,
    redirect: '/test/table',
    name: '测试功能区',
    meta: {title: '测试功能区', icon: 'example'},
    children: [
      {
        path: 'table',
        name: 'Table',
        component: () => import('@/views/table/index'),
        meta: {title: 'Table', icon: 'table'}
      },
      {
        path: 'tree',
        name: 'Tree',
        component: () => import('@/views/tree/index'),
        meta: {title: 'Tree', icon: 'tree'}
      },
      {
        path: 'test',
        name: '测试',
        component: () => import('@/views/test/index'),
        meta: {title: '测试', icon: 'form'}
      },
      {
        path: 'index',
        name: '表单',
        component: () => import('@/views/form/index'),
        meta: {title: '表单', icon: 'form'}
      }
    ]
  },
  {path: '*', redirect: '/404', hidden: true}
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({y: 0}),
  routes: constantRouterMap
})

