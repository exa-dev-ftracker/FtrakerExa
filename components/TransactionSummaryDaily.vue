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
    <div class="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4 sm:gap-6 bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/5 p-3 sm:px-5 sm:py-3 rounded-2xl shadow-sm transition-all hover:shadow-md">
        <!-- Breakdown -->
        <div class="flex items-center gap-3 sm:gap-5">
            <div class="text-left sm:text-right">
                <p class="text-[9px] sm:text-[10px] text-gray-500 font-black uppercase tracking-widest">Income</p>
                <p class="text-xs sm:text-sm font-bold text-emerald-500">
                    +{{ currency(incomeTotal) }}
                </p>
            </div>
            <div class="w-px h-6 bg-gray-100 dark:bg-gray-800"></div>
            <div class="text-left sm:text-right">
                <p class="text-[9px] sm:text-[10px] text-gray-500 font-black uppercase tracking-widest">Expense</p>
                <p class="text-xs sm:text-sm font-bold text-rose-500">
                    -{{ currency(expenseTotal) }}
                </p>
            </div>
        </div>

        <div class="w-px h-8 bg-gray-100 dark:bg-gray-800"></div>

        <!-- Net -->
        <div class="text-right flex items-center gap-2">
            <div>
                <p class="text-[9px] sm:text-[10px] text-gray-500 font-black uppercase tracking-widest">Net</p>
                <p class="text-sm sm:text-base font-black tracking-tight" :class="{
                    'text-emerald-500': color === 'green',
                    'text-rose-500': color === 'red',
                    'text-gray-900 dark:text-white': color === 'gray'
                }">
                    {{ totalDay > 0 ? '+' : '' }}{{ currency(totalDay) }}
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