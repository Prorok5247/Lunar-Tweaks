import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    fileChoosed: false,
    lunarFilePath: ""
  },
  mutations: {
    markFileAsChoosed(state, bool) {
      state.fileChoosed = bool
    },
    setLunarFilePath(state, lunarFilePath) {
      state.lunarFilePath = lunarFilePath;
    }
  }
});