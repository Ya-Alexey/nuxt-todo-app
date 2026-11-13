<template>
  <NuxtLayout>
    <div
      v-if="error"
      class="error-page"
    >
      <div class="error-page__title">{{ errorData.message }}</div>
      <BaseBtn
        tag="NuxtLink"
        to="/"
      >
        Вернутся на главную
      </BaseBtn>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
const errorList = {
  notFound: {
    message: 'Похоже такой странички нет...',
  },
  other: {
    message: 'Что-то пошло не так...',
  },
} as const;

const error = useError();

const errorData = computed(() => {
  if (error.value?.status === 404) {
    return errorList['notFound'];
  }
  return errorList['other'];
});
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  &__title {
    font-size: 24px;
    margin-bottom: 16px;
  }
}
</style>
