import Vue from 'vue'
import Vuex from '../myVuex/index.copy.js'

// import Vuex from 'vuex'

Vue.use(Vuex)

const persists = function (store) {
  let state = localStorage.getItem('VUEX')
  if (state) {
    store.replaceState(JSON.parse(state))
  }
  store.subscribe(function (mutationKey, rootState) {
    localStorage.setItem('VUEX', JSON.stringify(rootState))
  })
}

const store = new Vuex.Store({
  strict: true,
  plugins: [persists],
  state: {
    age: 13,
    long: 20
  },
  getters: {
    myAge(state) {
      console.log('a')
      return state.age + 20
    }
  },
  mutations: {
    add(state, payload) {
      state.age += payload
    }
  },
  actions: {
    add({ commit }, payload) {
      // setTimeout(() => {
      //   commit('add', payload)
      // }, 1000);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          commit('add', payload)
          // resolve()
        }, 1000);
      })
    }
  },
  modules: {
    b: {
      nameSpaced: true,
      state: {
        age: 15,
        long: 25
      },
      getters: {
        mybAge(state) {
          return state.age + 20
        }
      },
      mutations: {
        add(state, payload) {
          state.age += payload
        }
      },
      actions: {
        add({ commit }, payload) {
          setTimeout(() => {
            commit('add', payload)
          }, 1000);
        }
      },
      modules: {
        d: {
          state: {
            age: 35,
            long: 65
          },
          getters: {
            mydAge(state) {
              return state.age + 20
            }
          },
          mutations: {
            add(state, payload) {
              state.age += payload
            }
          },
          actions: {
            add({ commit }, payload) {
              setTimeout(() => {
                commit('add', payload)
              }, 1000);
            }
          },
        },
        e: {
          nameSpaced: true,
          state: {
            age: 45,
            long: 75
          },
          getters: {
            myeAge(state) {
              return state.age + 20
            }
          },
          mutations: {
            add(state, payload) {
              state.age += payload
            }
          },
          actions: {
            add({ commit }, payload) {
              setTimeout(() => {
                commit('add', payload)
              }, 1000);
            }
          },
          modules: {
            f: {
              nameSpaced: true,
              state: {
                age: 75,
                long: 95
              },
              getters: {
                myfAge(state) {
                  return state.age + 20
                }
              },
              mutations: {
                add(state, payload) {
                  state.age += payload
                }
              },
              actions: {
                add({ commit }, payload) {
                  setTimeout(() => {
                    commit('add', payload)
                  }, 1000);
                }
              },
            },
            g: {
              state: {
                age: 85,
                long: 105
              },
              getters: {
                mygAge(state) {
                  return state.age + 20
                }
              },
              mutations: {
                add(state, payload) {
                  state.age += payload
                }
              },
              actions: {
                add({ commit }, payload) {
                  setTimeout(() => {
                    commit('add', payload)
                  }, 1000);
                }
              },

            }
          }
        }
      }
    },
    c: {
      state: {
        age: 20,
        long: 45
      },
      getters: {
        mycAge(state) {
          return state.age + 20
        }
      },
      mutations: {
        add(state, payload) {
          state.age += payload
        }
      },
      actions: {
        add({ commit }, payload) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              commit('add', payload)
              // resolve()
            }, 1000);
          })
        }
      },
    }
  }
})


store.registerModule(['b', 'h'], {
  nameSpaced: true,
  state: {
    age: 'e100'
  },
  getters: {
    myhAge(state) {
      return state.age + '200'
    }
  },
  mutations: {
    add(state) {
      state.age += '!'
    }
  },
  actions: {
    add({ commit }, payload) {
      setTimeout(() => {
        commit('add', payload)
      }, 1000);
    }
  },
})

export default store
