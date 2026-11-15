<template>
  <label
    class="base-checkbox"
    :class="classes"
  >
    <span class="base-checkbox__label">
      <slot></slot>
    </span>
    <input
      v-model="checked"
      type="checkbox"
      class="base-checkbox__control"
      :disabled="isDisabled"
    />
    <span class="base-checkbox__box">
      <SvgIcon
        name="mark"
        class="base-checkbox__mark"
      />
    </span>
  </label>
</template>

<script lang="ts" setup>
const { isDisabled = false, isShortView = false } = defineProps<{
  isDisabled?: boolean;
  isShortView?: boolean;
}>();

const checked = defineModel<boolean>({
  required: true,
});

const classes = computed(() => ({
  'base-checkbox--is-checked': checked.value,
  'base-checkbox--is-disabled': isDisabled,
  'base-checkbox--is-short': isShortView,
}));
</script>

<style lang="scss" scoped>
.base-checkbox {
  --bg-primary: var(--n-00);
  --bg-box: var(--n-10);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  column-gap: 8px;
  cursor: pointer;
  background-color: var(--bg-primary);
  @include transition-default(background-color);
  @include mediaHover {
    --bg-primary: var(--n-10);
    --bg-box: var(--n-00);
  }
  &--is-checked {
    .base-checkbox__mark {
      opacity: 1;
    }
  }
  &--is-short {
    overflow: hidden;
    .base-checkbox__label {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  &.base-checkbox--is-disabled {
    cursor: default;
    --bg-primary: var(--n-00);
    --bg-box: var(--n-10);
  }
  &__label {
    padding: 4px 0;
  }
  &__control {
    width: 0;
    height: 0;
    overflow: hidden;
    position: absolute;
  }
  &__box {
    width: 24px;
    height: 24px;
    padding: 2px;
    flex-shrink: 0;
    border: 1px solid var(--n-20);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-box);
    border-radius: 6px;
    @include transition-default(background-color);
  }
  &__mark {
    opacity: 0;
    fill: var(--a-20);
    @include transition-default(opacity);
  }
}
</style>
