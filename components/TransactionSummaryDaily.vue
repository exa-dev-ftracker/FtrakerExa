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
    <div class="w-full sm:w-auto grid grid-cols-3 sm:flex items-center justify-between sm:justify-end gap-1 sm:gap-6 bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/5 p-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm transition-all hover:shadow-md">
        
        <!-- Income -->
        <div class="text-center sm:text-right overflow-hidden">
            <p class="text-[8px] sm:text-[10px] text-gray-500 font-black uppercase tracking-tighter sm:tracking-widest truncate">Income</p>
            <p class="text-[9px] sm:text-sm font-bold text-emerald-500 truncate">
                +{{ currency(incomeTotal) }}
            </p>
        </div>

        <!-- Expense -->
        <div class="text-center sm:text-right border-x border-gray-100 dark:border-gray-800 sm:border-0 px-1 sm:px-0 overflow-hidden">
            <p class="text-[8px] sm:text-[10px] text-gray-500 font-black uppercase tracking-tighter sm:tracking-widest truncate">Expense</p>
            <p class="text-[9px] sm:text-sm font-bold text-rose-500 truncate">
                -{{ currency(expenseTotal) }}
            </p>
        </div>

        <!-- Net -->
        <div class="text-center sm:text-right sm:border-l sm:border-gray-100 sm:dark:border-gray-800 sm:pl-6 overflow-hidden">
            <p class="text-[8px] sm:text-[10px] text-gray-500 font-black uppercase tracking-tighter sm:tracking-widest truncate">Net</p>
            <p class="text-[10px] sm:text-base font-black tracking-tight truncate" :class="{
                'text-emerald-500': color === 'green',
                'text-rose-500': color === 'red',
                'text-gray-900 dark:text-white': color === 'gray'
            }">
                {{ totalDay > 0 ? '+' : '' }}{{ currency(totalDay) }}
            </p>
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