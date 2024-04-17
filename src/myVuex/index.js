export let Vue

class Store {
  constructor(options) {
    let state = options.state
    let getters = options.getters
    let mutations = options.mutations
    let actions = options.actions
    this.getters = {}
    const computed = {}
    //getter代理
    Object.keys(getters).forEach(getterKey => {
      //因为getters和计算属性相似，我们可以把getters代理到vue的计算属性上，这样取值的时候渲染就不会重复取值，值不会取一次计算一次，直接给值就行
      computed[getterKey] = () => {
        return getters[getterKey](state)
      }
      Object.defineProperty(this.getters, getterKey, {
        get:()=>{
          return this._vm[getterKey]//如果不用箭头函数，那么this指向的是this.getters，_vm在Store实例上，所以应该用箭头函数
        }
      })
    })
    //把state变成响应式
    this._vm = new Vue({
      data: {
        $$state: state//在vue里$,_不会放到$data里,vm.state就调用不了，隐蔽性高，可以用this._vm._data.$$state调用
      },
      computed
    })
    this.mutations = mutations
    this.actions = actions
  }
  get state() {//属性访问器
    return this._vm._data.$$state
  }
  //使用箭头函数让this指向Store类
  commit = (type, payload) => {
    this.mutations[type](this.state, payload)//从mutation对象取对应的函数
  }
  dispatch = (type, payload) => {
    this.actions[type](this, payload)//从action对象取对应的函数方法
  }
}

const install = _Vue => {
  Vue = _Vue
  Vue.mixin({//让每个实例都有￥store，共享store,和router差不多一个道理
    beforeCreate() {
      if (this.$options.store) {
        this.$store = this.$options.store
      } else if (this.$parent && this.$parent.$store) {
        this.$store = this.$parent.$store
      }
    }
  })
}

export default {
  Store,
  install
}