<template>
  <footer class="app-footer">
    <p
      v-once
      class="app-footer__text"
    >
      © {{ currentYear }} TODO-шечная
    </p>
    <a
      class="app-footer__link"
      target="_blank"
      rel="noopener noreferrer"
      href="https://github.com/Ya-Alexey/nuxt-todo-app"
    >
      <SvgIcon name="github" />
    </a>
  </footer>
</template>

<script lang="ts" setup>
const currentYear = new Date().getFullYear();
</script>

<style lang="scss" scoped>
.app-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: var(--n-10);
  box-shadow: 0 -1px 2px #3f7ac233;
  border-radius: 8px 8px 0 0;
  &__text {
    margin: 0;
    font-size: 18px;
  }
  &__link {
    width: 32px;
    height: 32px;
  }
}
</style>
