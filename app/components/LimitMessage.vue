<template>
  <div
    class="limit-message"
    :class="classes"
  >
    <div class="limit-message__count">
      <span class="limit-message__current">{{ currentValueLength }}</span>
      / {{ limitValue }}
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  limitValue: number;
  currentValue: string | number;
}>();

const currentValueLength = computed(() => {
  return props.currentValue.toString().length;
});

const isSuccessLimit = computed(() => {
  const length = currentValueLength.value;
  return length > 0 && length <= props.limitValue;
});

const classes = computed(() => ({
  'limit-message--is-success': isSuccessLimit.value,
  'limit-message--is-error': !isSuccessLimit.value,
}));
</script>

<style lang="scss" scoped>
.limit-message {
  font-size: 12px;
  color: var(--n-80);
  display: flex;
  justify-content: space-between;
  &--is-success {
    .limit-message__current {
      color: var(--a-20);
    }
  }
  &--is-error {
    .limit-message__label {
      display: block;
    }
    .limit-message__current {
      color: var(--a-30);
    }
  }
  &__label {
    color: var(--a-30);
    display: none;
  }
  &__count {
    margin-left: auto;
    text-align: right;
  }
}
</style>
