import install, { Vue } from './install'

function forEachValue(obj, cb) {
  Object.keys(obj).forEach((key) => {
    //key和key对应的所有属性
    cb(key, obj[key])
  })
}
class Module {
  constructor(module) {
    ; (this._raw = module), (this._childen = {}), (this.state = module.state)
  }
  get nameSpaced() {
    return !!this._raw.nameSpaced
  }
  //添加孩子
  addChild(key, module) {
    this._childen[key] = module
  }
  //获取孩子
  getChild(key) {
    return this._childen[key]
  }
  //循环操作mutation
  forEachMutation(cb) {
    if (this._raw.mutations) {
      forEachValue(this._raw.mutations, cb)
    }
  }
  //循环操作action
  forEachAction(cb) {
    if (this._raw.actions) {
      forEachValue(this._raw.actions, cb)
    }
  }
  // 循环操作getter
  forEachGetter(cb) {
    if (this._raw.getters) {
      forEachValue(this._raw.getters, cb)
    }
  }
  //往孩子递归操作
  forEachModule(cb) {
    forEachValue(this._childen, cb)
  }
}
class ModuleCollection {
  //构建ast语法树，把父子关系构建出来
  constructor(options) {
    this.root = null //ast语法树的根

    // 传入一个空数组用于拼接合并父子关系,并且不影响同级,和根,就是我们最终要得到的ast语法树没有任何关系,只是用来和并父子关系
    this.register([], options)
  }

  //根据路径返回命名空间
  getNameSpaced(path) {
    let module = this.root
    //从根开始看有没有namespaced属性，有的话进行拼接
    return path.reduce((str, key) => {
      module = module.getChild(key)
      return str + (module.nameSpaced ? `${key}/` : '')
    }, '')
  }

  register(path, rootModule) {
    //首先将一个节点的属性赋值

    // let newModule = {
    //   _raw: rootModule,//各种方法，getter，mutation等
    //   _childen: {},//孩子
    //   state: rootModule.state//state
    // }
    let newModule = new Module(rootModule)
    rootModule.newModule = newModule
    if (this.root === null) {
      this.root = newModule
    } else {
      // 合并孩子

      //slice也不会修改原数组,从拼接的数组删掉最后一项,就是当前项,然后通过reduce从根开始,如果删掉最后一项就空了就说明根就是他父亲,直接放.如果不是空的那就把current作为key找孩子并且作为下一次的start,其实孩子就是path的下一项,刚好就对应上了.比如从根开始,root.chilidren[b],下一次就是b.children[e],因为d,e是同级,自然当前path数组只有b,e而不是b,d,e
      let parent = path.slice(0, -1).reduce((start, current) => {
        return start.getChild(current)
      }, this.root)
      parent.addChild(path[path.length - 1], newModule)
    }
    if (rootModule.modules) {
      forEachValue(rootModule.modules, (moduleName, moduleValue) => {
        //必须要箭头函数,让this指向该类
        //concat返回的是新的数组,和原数组没关系,所以一个节点拼接到数组的时候,不会影响另一个节点,只会和他的孩子不断进行拼接,不影响同级
        this.register(path.concat(moduleName), moduleValue)
      })
    }
  }
}
function getState(store, path) {
  return path.reduce((start, current) => {
    return start[current]
  }, store.state)
}
function installModule(store, rootState, path, rootModule) {
  if (path.length > 0) {
    //不是根,和ModuleCollection的register一样的操作
    let parent = path.slice(0, -1).reduce((start, current) => {
      return start[current]
    }, rootState)
    store._withCommiting(() => {
      Vue.set(parent, path[path.length - 1], rootModule.state)
      // parent[path[path.length - 1]] = rootModule.state
    })
  }

  //传入一个函数，此函数需要mutation的key和内容作为参数
  let namespaced = store._modules.getNameSpaced(path)
  rootModule.forEachMutation((mutationKey, mutationValue) => {
    //检查一下store的mutation合集里有没有该mutation同名的数组，如果有就用此数组，没有就新建一个此名字的空数组
    store._mutations[namespaced + mutationKey] = store._mutations[namespaced + mutationKey] || []
    // 加入进去，并且加入的是一个包装过的mutation，方便调用传参
    store._mutations[namespaced + mutationKey].push((payload) => {
      store._withCommiting(() => {
        mutationValue(getState(store, path), payload)//commiting为true才执行
      })
      //执行插件函数的方法
      store.subscribes.forEach(fn => fn({ type: mutationKey, payload }, store.state))
    })
  })

  // 原理同上
  rootModule.forEachAction((actionKey, actionValue) => {
    store._actions[namespaced + actionKey] = store._actions[namespaced + actionKey] || []
    store._actions[namespaced + actionKey].push((payload) => {
      payload = [payload, namespaced]
      let result = actionValue(store, payload)
      return result
    })
  })

  //原理也同上，但是不会创建数组而是直接覆盖
  rootModule.forEachGetter((getterKey, getterValue) => {
    store._wrappedGetters[namespaced + getterKey] = () => {
      return getterValue(getState(store, path))
    }
  })

  //循环module属性操作，module刚好也就是children
  rootModule.forEachModule((moduleKey, module) => {
    installModule(store, rootState, path.concat(moduleKey), module)
  })

}
function resetStoreVM(store, state) {
  let oldVm = store._vm
  store.getters = {}
  const computed = {}
  const wrappedGetters = store._wrappedGetters
  //把计算属性加到Vue的计算属性里
  forEachValue(wrappedGetters, (getterKey, getterValue) => {
    computed[getterKey] = getterValue
    Object.defineProperty(store.getters, getterKey, {
      get: () => {
        return store._vm[getterKey]
      }
    })
  })
  store._vm = new Vue({
    //state放到Vue实例上，并且用$$进行保护
    data: {
      $$state: state
    },
    computed
  })
  if (store.strict) {
    store._vm.$watch(() => store._vm._data.$$state, () => {
      console.assert(store._commiting, 'outside mutation')
    }, { sync: true, deep: true })
  }
  if (oldVm) {
    Vue.nextTick(() => { oldVm.$destroy() })
  }
}
class Store {
  constructor(options) {
    // 构建ast语法树
    this._modules = new ModuleCollection(options)
    //存所有mutation
    this._mutations = Object.create(null)
    // 存所有actions
    this._actions = Object.create(null)
    //存所有getters
    this._wrappedGetters = Object.create(null)
    //存放的插件函数里的方法的数组
    this.subscribes = []
    //存放插件函数
    this.plugins = options.plugins
    //是否是严格模式，只能再mutaion修改
    this.strict = options.strict
    //是否可以修改state内的值,配合严格模式
    this._commiting = false

    // 把根的state暴露出来
    const state = this._modules.root.state
    //初始化所有数据
    installModule(this, state, [], this._modules.root)

    //创建实例，把计算属性和state声明在上面
    resetStoreVM(this, state);

    //立即执行插件
    this.plugins.forEach(plugin => plugin(this))
  }
  _withCommiting(fn) {
    this._commiting = true
    fn()
    this._commiting = false
  }
  replaceState(state) {
    this._withCommiting(() => {
      this._vm._data.$$state = state
    })

  }
  commit = (type, payload) => {
    this._mutations[(payload[1] ? payload[1] : '') + type].forEach(fn => fn.call(this, payload[0] ? payload[0] : payload))
  }
  dispatch = (type, payload) => {

    if (this._actions[type]) {
      return Promise.all(this._actions[type].map(fn => fn.call(this, payload)))
    }
    // this._actions[type].forEach(fn => fn.call(this, payload))
  }
  registerModule(path, module) {
    this._modules.register(path, module)
    installModule(this, this.state, path, module.newModule)
    resetStoreVM(this, this.state)
  }
  get state() {
    return this._vm._data.$$state
  }
  subscribe(fn) {
    this.subscribes.push(fn)
  }
}

export default {
  Store,
  install,
}
