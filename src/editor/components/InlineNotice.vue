<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-1"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-1"
  >
    <div
      v-if="text"
      role="status"
      class="mt-2 flex items-center gap-2 rounded-md border px-2 py-1 text-xs"
      :class="noticeClass"
    >
      <span class="inline-block h-1.5 w-1.5 rounded-full" :class="dotClass"></span>
      <span class="leading-5">{{ text }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text: string
  variant?: 'info' | 'success' | 'warn' | 'error'
}>()

const noticeClass = computed(() => {
  switch (props.variant ?? 'info') {
    case 'success':
      return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
    case 'warn':
      return 'border-amber-400/35 bg-amber-500/10 text-amber-200'
    case 'error':
      return 'border-rose-400/35 bg-rose-500/10 text-rose-200'
    default:
      return 'border-sky-400/30 bg-sky-500/10 text-sky-200'
  }
})

const dotClass = computed(() => {
  switch (props.variant ?? 'info') {
    case 'success':
      return 'bg-emerald-300'
    case 'warn':
      return 'bg-amber-300'
    case 'error':
      return 'bg-rose-300'
    default:
      return 'bg-sky-300'
  }
})
</script>
