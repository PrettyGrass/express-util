<template>
  <div class="app-wrapper" :class="classObj">
    <app-main class="app-main"></app-main>
    <!--<sidebar class="sidebar-container"></sidebar>-->
    <!--<div class="main-container">-->
      <!--<navbar></navbar>-->
      <!--<app-main></app-main>-->
    <!--</div>-->
  </div>
</template>

<script>
import { AppMain } from './components'

export default {
  name: 'layout',
  components: {
    AppMain
  },
  computed: {
    classObj() {
      return {
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "../../styles/mixin.scss";
  .app-wrapper {
    @include clearfix;
    /*position: relative;*/
    height: 100%;
    width: 100%;
  }
  .app-main {
    height: 100%;
    width: 100%;
  }
</style>
