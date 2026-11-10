<template>
  <component
    :is="componentTag"
    class="base-btn reset-btn"
    :class="classes"
    :type="defaultBtnType"
  >
    <span
      v-if="$slots.icon"
      class="base-btn__icon"
    >
      <slot name="icon"></slot>
    </span>
    <slot></slot>
  </component>
</template>

<script lang="ts" setup>
const {
  theme = 'default',
  state = 'default',
  tag = 'button',
} = defineProps<{
  theme?: 'default' | 'action' | 'danger';
  state?: 'default' | 'active' | 'disabled';
  tag?: 'button' | 'NuxtLink' | 'a' | 'div';
}>();

const componentTag = useDynamicHtmlTag(() => tag);
const defaultBtnType = useDefaultButtonType(() => tag === 'button');

const classes = computed(() => ({
  [`base-btn--theme-${theme}`]: theme !== 'default',
  [`base-btn--state-${state}`]: state !== 'default',
}));
</script>

<style lang="scss" scoped>
.base-btn {
  --text-color: var(--n-90);
  --border-color: var(--n-20);
  --icon-color: var(--text-color);
  --inverse-color: var(--n-00);
  color: var(--text-color);
  padding: 5px 10px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 12px;
  background-color: var(--n-00);
  @include transition-default(background-color, color, border-color);
  @include mediaHover() {
    background-color: var(--border-color);
  }
  &:active {
    --icon-color: var(--inverse-color);
    border-color: var(--text-color);
    background-color: var(--text-color);
    color: var(--inverse-color);
  }
  &:disabled {
    --icon-color: var(--text-color);
    background-color: var(--border-color);
    border-color: var(--border-color);
    color: var(--text-color);
    opacity: 0.5;
    cursor: default;
  }
  &--theme-action {
    --text-color: var(--a-10);
    --border-color: var(--a-15);
  }
  &--theme-danger {
    --text-color: var(--a-30);
    --border-color: var(--a-35);
  }
  &__icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    fill: var(--icon-color);
    @include transition-default(fill);
  }
}
</style>
