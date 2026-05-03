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
    <div class="group bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-900/20 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1">
        <div class="flex items-center justify-between">
            <div class="flex items-center flex-1 gap-3">
                <div class="p-2.5 rounded-lg transition-all duration-300 group-hover:scale-110" :class="color === 'green' ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30' : 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30'">
                    <UIcon :name="icon" :class="[color + ' w-5 h-5 transition-transform group-hover:scale-125',' duration-300']" />
                </div>
                <div class="flex-1">
                    <p class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ props.data.description }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ new Date(props.data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }) }}
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <UBadge 
                    :color="color === 'green' ? 'green' : 'red'" 
                    variant="subtle"
                    size="lg" 
                    :label="displayTransactionType(props.data.type)"
                    class="group-hover:scale-110 transition-transform duration-300"
                />
                <p class="font-bold text-gray-900 dark:text-white min-w-[100px] text-right bg-gradient-to-r" :class="color === 'green' ? 'from-green-600 to-emerald-600 bg-clip-text text-transparent' : 'from-red-600 to-rose-600 bg-clip-text text-transparent'">{{ currency(props.data.amount) }}</p>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <UDropdown :items="action" :popper="{ placement: 'bottom-end' }">
                        <UButton color="gray" size="sm" variant="ghost" trailing-icon="i-heroicons-ellipsis-horizontal"
                            :loading="props.loading" class="hover:scale-110 transition-transform" />
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