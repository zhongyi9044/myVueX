export let Vue

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

export default install