<script setup lang="ts">
import type { Transaction } from '~/types'
import { displayTransactionType } from '~/types'

const toast = useToast()
const props = defineProps<{ data: Transaction, loading: boolean }>()
const icon = computed(() => {
    return props.data?.type.toLowerCase() === 'income' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'
})
const emit = defineEmits(['edit', 'delete'])

const action = [
    [{
        label: 'Edit',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => {
            emit('edit', props.data.createdAt.split('T')[0], props.data._id)
            return toast.clear()
        }
    }],
    [{
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        click: () => {
            toast.add({
                title: 'Delete',
                description: 'Are you sure you want to delete this transaction?',
                actions: [
                    {
                        label: 'Yes',
                        click: () => {
                            emit('delete', props.data._id)
                            return toast.clear()
                        }
                    },
                    {
                        label: 'No',
                        click: () => {
                            return toast.clear()
                        }
                    }
                ]
            })
        }
    }]
]

const color = computed(() => {
    return props.data?.type.toLowerCase() === 'income' ? 'green' : 'red'
})
</script>

<template>
    <div class="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500">
        <!-- Animated background gradient on hover -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300"></div>

        <div class="relative p-5 md:p-6">
            <div class="flex items-center justify-between gap-4">
                <!-- Left Side: Icon & Details -->
                <div class="flex items-center flex-1 min-w-0 gap-4">
                    <!-- Icon -->
                    <div class="flex-shrink-0 p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg" 
                        :class="color === 'green' 
                            ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40' 
                            : 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40'">
                        <UIcon :name="icon" :class="[color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400', 'w-6 h-6 transition-transform duration-300 group-hover:scale-125']" />
                    </div>

                    <!-- Description & Date -->
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base md:text-lg">
                            {{ props.data.description }}
                        </p>
                        <div class="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <i class="i-material-symbols-calendar-today text-sm"></i>
                            <span>{{ new Date(props.data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Right Side: Amount, Badge & Actions -->
                <div class="flex items-center gap-3 flex-shrink-0">
                    <!-- Type Badge -->
                    <UBadge 
                        :color="color === 'green' ? 'green' : 'red'" 
                        variant="subtle"
                        size="md" 
                        :label="displayTransactionType(props.data.type)"
                        class="group-hover:scale-110 transition-transform duration-300 whitespace-nowrap hidden sm:inline-block"
                    />

                    <!-- Amount -->
                    <div class="text-right min-w-max">
                        <p class="font-black text-lg md:text-xl transition-all duration-300 group-hover:scale-110" 
                            :class="color === 'green' 
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent' 
                                : 'bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent'">
                            {{ color === 'green' ? '+' : '-' }}{{ currency(props.data.amount) }}
                        </p>
                    </div>

                    <!-- Actions Menu -->
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0">
                        <UDropdown :items="action" :popper="{ placement: 'bottom-end' }">
                            <UButton 
                                color="gray" 
                                size="sm" 
                                variant="ghost" 
                                icon="i-heroicons-ellipsis-horizontal"
                                :loading="props.loading" 
                                class="hover:scale-110 transition-transform duration-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                            />
                        </UDropdown>
                    </div>
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