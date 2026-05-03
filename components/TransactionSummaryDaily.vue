<script setup lang="ts">
interface transaction {
    type: string
    amount: number
    description: string
    createdAt: string
    updatedAt: string
}
interface props {
    transaction: transaction[]
    date: string
}

const props = defineProps<props>()

const totalDay = computed((): number => {
    let total = 0
    for (let transaction of props.transaction) {
        if (transaction.type.toLowerCase() === 'income') {
            total += transaction.amount
        } else {
            total -= transaction.amount
        }
    }
    return total
})

const incomeTotal = computed((): number => {
    let total = 0
    for (let transaction of props.transaction) {
        if (transaction.type.toLowerCase() === 'income') {
            total += transaction.amount
        }
    }
    return total
})

const expenseTotal = computed((): number => {
    let total = 0
    for (let transaction of props.transaction) {
        const type = transaction.type.toLowerCase()
        if (type === 'expense' || type === 'expanse') {
            total += transaction.amount
        }
    }
    return total
})

const color = computed(() => totalDay.value > 0 ? 'green' : totalDay.value < 0 ? 'red' : 'gray')
const icon = computed(() => totalDay.value > 0 ? 'i-material-symbols-trending-up' : totalDay.value < 0 ? 'i-material-symbols-trending-down' : 'i-material-symbols-equal')

</script>

<template>
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <!-- Total for Day -->
        <div class="flex items-center gap-3">
            <div class="inline-flex items-center justify-center p-2 rounded-lg" :class="{
                'bg-green-100 dark:bg-green-900/30': color === 'green',
                'bg-red-100 dark:bg-red-900/30': color === 'red',
                'bg-gray-100 dark:bg-gray-800': color === 'gray'
            }">
                <i :class="[icon, 'text-xl', {
                    'text-green-600 dark:text-green-400': color === 'green',
                    'text-red-600 dark:text-red-400': color === 'red',
                    'text-gray-600 dark:text-gray-400': color === 'gray'
                }]"></i>
            </div>
            <div>
                <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">Daily Net</p>
                <p class="text-xl md:text-2xl font-black transition-all" :class="{
                    'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent': color === 'green',
                    'bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent': color === 'red',
                    'text-gray-900 dark:text-white': color === 'gray'
                }">
                    {{ totalDay > 0 ? '+' : '' }}{{ currency(totalDay) }}
                </p>
            </div>
        </div>

        <!-- Income & Expense Breakdown -->
        <div class="flex items-center gap-4">
            <div class="text-right">
                <p class="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">Income</p>
                <p class="text-lg md:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    +{{ currency(incomeTotal) }}
                </p>
            </div>
            <div class="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
            <div class="text-right">
                <p class="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">Expense</p>
                <p class="text-lg md:text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                    -{{ currency(expenseTotal) }}
                </p>
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

.gray {
    @apply text-gray-600 dark:text-gray-400;
}
</style>