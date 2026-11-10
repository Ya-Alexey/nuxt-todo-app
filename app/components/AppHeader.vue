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

    <div class="app-header__title">Дела делишки</div>
  </header>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-items: center;
  column-gap: 16px;
  padding: 16px;
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
