import { asyncRoutes, constantRoutes } from '@/router'

/**
 * 使用meta.role确定当前用户是否有权限
 * Use meta.role to determine if the current user has permission
 * @param roles 角色数组
 * @param route 路由
 * 判断方式：如果route路由中有meta并且meta中有角色信息，则判断该角色是否和用户的角色相匹配，匹配则返回true不匹配则返回false。如果route路由中没有meta或者meta中没有角色信息，则是通用菜单也返回true。
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * 通过递归过滤异步路由表
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes 异步路由
 * @param roles 角色数组
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

/**
 * 这里导出state后在getters.js中就可以调用state.permission.状态字段了，然后把getters传递给Vuex.Store构造函数后就可以在任何页面获取这个全局状态例了
 * 导出mutations，以方便在其他页面直接调用mutations
 * 导出actions，以方便在其他页面直接调用actions
 */
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
