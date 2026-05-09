<script setup lang="ts">
import type { Transaction } from '~/types'
import { displayTransactionType } from '~/types'

const toast = useToast()
const props = defineProps<{ data: Transaction, loading: boolean }>()
const emit = defineEmits(['edit', 'delete'])

const isIncome = computed(() => props.data?.type.toLowerCase() === 'income')
const icon = computed(() => isIncome.value ? 'i-heroicons-arrow-up-right' : 'i-heroicons-arrow-down-left')
const colorClass = computed(() => isIncome.value ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10')

const action = [
    [{
        label: 'Edit Transaction',
        icon: 'i-heroicons-pencil-square',
        click: () => emit('edit', props.data.createdAt.split('T')[0], props.data._id)
    }],
    [{
        label: 'Delete Forever',
        icon: 'i-heroicons-trash',
        class: 'text-rose-500',
        click: () => {
            toast.add({
                title: 'Confirm Deletion',
                description: 'This action cannot be undone.',
                color: 'red',
                actions: [{ label: 'Delete', color: 'red', click: () => emit('delete', props.data._id) }]
            })
        }
    }]
]
</script>

<template>
    <div class="group relative overflow-hidden bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-white/5 rounded-[2rem] transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/30">
        <!-- Interactive Gradient Hover -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/[0.02] group-hover:via-purple-500/[0.02] group-hover:to-pink-500/[0.02] transition-all duration-500"></div>

        <div class="relative p-6 sm:p-8">
            <div class="flex items-center justify-between gap-6">
                <!-- Left: Visual & Identity -->
                <div class="flex items-center gap-5 flex-1 min-w-0">
                    <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3', colorClass]">
                        <UIcon :name="icon" class="w-7 h-7" />
                    </div>

                    <div class="flex-1 min-w-0">
                        <h4 class="text-lg font-black text-gray-900 dark:text-white truncate transition-colors group-hover:text-blue-600">
                            {{ props.data.description }}
                        </h4>
                        <div class="flex items-center gap-3 mt-1.5">
                            <span class="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-500">{{ displayTransactionType(props.data.type) }}</span>
                            <span class="text-xs font-bold text-gray-400">{{ new Date(props.data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Right: Financials & Menu -->
                <div class="flex items-center gap-6">
                    <div class="text-right">
                        <p :class="['text-xl font-black tracking-tight transition-all duration-500 group-hover:scale-105', isIncome ? 'text-emerald-500' : 'text-rose-500']">
                            {{ isIncome ? '+' : '-' }}{{ currency(props.data.amount) }}
                        </p>
                    </div>

                    <UDropdown :items="action" :popper="{ placement: 'bottom-end' }">
                        <UButton 
                            color="gray" 
                            variant="ghost" 
                            icon="i-heroicons-ellipsis-vertical" 
                            class="rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/10"
                        />
                    </UDropdown>
                </div>
            </div>
        </div>
    </div>
</template>


<style scoped>
.green {
    @apply text-green-600 dark:text-green-400;
}

.red {
    @apply text-red-600 dark:text-red-400;
}
</style>