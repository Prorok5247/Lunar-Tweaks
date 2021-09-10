<template>
  <v-app>
    <AppBar/>
    <v-main>
      <FileChooser v-if="!$store.state.fileChoosed"/>
      <Patcher v-else/>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from './components/AppBar.vue';
import FileChooser from './components/FileChooser.vue';
import Patcher from './components/Patcher.vue';

export default {
  name: 'App',
  components: {
    AppBar,
    FileChooser,
    Patcher
  },
  data: () => ({
  }),
};
</script>

<style>
  * {
    font-family: 'Roboto', 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    user-select: none;
  }

  ::-webkit-scrollbar {
    display: none;
  }
</style>