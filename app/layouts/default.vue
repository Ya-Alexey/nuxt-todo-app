<template>
  <div class="app-layout">
    <AppHeader />
    <div class="app-layout__main">
      <slot />
    </div>
    <AppFooter />
  </div>
</template>

<script lang="ts" setup>
const router = useRouter();
const { handleRouteChange } = useOverlayManager();
router.afterEach(handleRouteChange);
</script>

<style lang="scss" scoped>
.app-layout {
  display: grid;
  grid-template-columns: minmax(0px, 1fr);
  grid-auto-rows: min-content;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  &__main {
    padding: 8px;
    display: grid;
    grid-template-columns: minmax(0px, 1fr);
    grid-template-rows: 1fr;
    grid-auto-rows: min-content;
    min-height: 100vh;
    min-height: 100svh;
  }
}
</style>
