<template>
  <header class="app-header">
    <NuxtLink
      class="app-header__link"
      to="/"
      aria-label="главная"
    >
      <SvgIcon
        name="target"
        class="app-header__svg"
      />
    </NuxtLink>

    <div class="app-header__title">TODO-шечная</div>
  </header>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-items: center;
  column-gap: 16px;
  padding: 16px;
  position: sticky;
  top: 0;
  z-index: var(--z-layout-sticky);
  background-color: var(--n-10);
  box-shadow: 0 1px 2px #3f7ac233;
  &__link {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }
  &__title {
    font-size: 22px;
  }
  &__svg {
    fill: var(--a-1);
  }
}
</style>
nuxt-todo-app
