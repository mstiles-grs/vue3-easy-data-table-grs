<template>
  <div
    class="easy-checkbox"
    @click.stop.prevent="toggleChecked"
  >
    <input
      type="checkbox"
      :checked="isChecked"
      :class="status"
      :disabled="disabled"
    >
    <label for="checbox" />
  </div>
</template>

<script setup lang="ts">
import { PropType, computed, inject } from 'vue';

const emits = defineEmits(['change']);

const props = defineProps({
  status: { type: String as PropType<'noneSelected' | 'partSelected' | 'allSelected'>, required: true },
  disabled: { type: Boolean, default: false },
});

const isChecked = computed(() => props.status === 'allSelected');

const toggleChecked = () => {
  if (!props.disabled) {
    emits('change', !isChecked.value);
  }
};

const themeColor = inject('themeColor');
</script>

<style lang="scss" scoped>
@import '../scss/checbox.scss';

$checkbox-checked-color: v-bind(themeColor);

.easy-checkbox {
  input[type="checkbox"] {
    &.allSelected, &.partSelected {
      + label:before{
        background: $checkbox-checked-color;
      }
    }

    &[disabled] {
      + label:before {
        background-color: gray;
      }
    }
  }
}
</style>
