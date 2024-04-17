<template>
  <div id="app">
    {{ $store.state.age }}
    {{ $store.getters.myAge }}
    {{ $store.getters.myAge }}
    <button @click="$store.commit('add', 3)">mutations</button>
    <button @click="$store.dispatch('add', 3)">actions</button>
    <button @click="$store.state.age++">gai</button>
    </br>
    </br>
    {{ $store.state.b.age }}
    {{ $store.getters['b/mybAge'] }}
    <button @click="$store.commit('b/add', 3)">mutations</button>
    <button @click="$store.dispatch('b/add', 3)">actions</button>
    <button @click="$store.state.age++">gai</button>
    </br>
    </br>
    {{ $store.state.c.age }}
    {{ $store.getters['mycAge'] }}
    <button @click="$store.commit('add', 3)">mutations</button>
    <button @click="$store.dispatch('add', 3)">actions</button>
    <button @click="$store.state.age++">gai</button>
    </br>
    </br>
    {{ $store.state.b.d.age }}
    {{ $store.getters['b/mydAge'] }}
    <button @click="$store.commit('b/add', 3)">mutations</button>
    <button @click="$store.dispatch('b/add', 3)">actions</button>
    <button @click="$store.state.age++">gai</button>
    </br>
    </br>
    {{ $store.state.b.e.age }}
    {{ $store.getters['b/e/myeAge'] }}
    <button @click="$store.commit('b/e/add', 3)">mutations</button>
    <button @click="$store.dispatch('b/e/add', 3)">actions</button>
    <button @click="$store.state.age++">gai</button>
    </br>
    </br>
    {{ $store.state.b.e.f.age }}
    {{ $store.getters['b/e/f/myfAge'] }}
    <button @click="$store.commit('b/e/f/add', 3)">mutations</button>
    <button @click="$store.dispatch('b/e/f/add', 3)">actions</button>
    <button @click="$store.state.age++">gai</button>
    </br>
    </br>
    {{ $store.state.b.e.g.age }}
    {{ $store.getters['b/e/mygAge'] }}
    <button @click="$store.commit('b/e/add', 3)">mutations</button>
    <button @click="$store.dispatch('b/e/add', 3)">actions</button>
    <button @click="$store.state.age++">gai</button>
     </br>
    </br>
    {{ $store.state.b.h.age }}
    {{ $store.getters['b/h/myhAge'] }}
    <button @click="$store.commit('b/h/add', 3)">mutations</button>
    <button @click="$store.dispatch('b/h/add', 3)">actions</button>
    <button @click="$store.state.age++">gai</button>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log(this.$store)
  },
}
</script>

<style></style>
