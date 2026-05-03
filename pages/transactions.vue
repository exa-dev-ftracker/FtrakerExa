<script setup lang="ts">
import { transactionViewOptions } from '~/constants';

useHead({
  title: 'FTraker - Finance Tracker',
  meta: [
    { name: 'description', content: 'View your financial summary, including income and expenses.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
})

import type { Transaction, TransactionResponse } from '~/types'

const toast = useToast()
const router = useRouter()
const store = useDefaultStore()
const isModalOpen = ref(false)
const isLoading = ref(false)
const isEdit = ref(false)
const selectedView = ref(transactionViewOptions[2])
const transactionDetail = reactive<Transaction>({
  createdAt: `${new Date().toISOString().split('T')[0]}`,
  description: '',
  type: '',
  amount: 0,
  _id: '',
  updatedAt: '',
})
const { data, status, error, refresh, clear } = useAsyncData<TransactionResponse>(
  'transactionsUser',
  async () => {
    const jwt = useCookie('jwt')
    return await $fetch<TransactionResponse>(`/api/transaction?view=${selectedView.value}`, {
      headers: {
        Authorization: `Bearer ${jwt.value}`,
      }
    })
  }
)

const isHydrated = ref(false)
onMounted(() => {
  isHydrated.value = true
})

const loading = computed(() => {
  return status.value !== 'success'
})

const transactionByDate = computed(() => {
  let transactionGroup: Record<string, Transaction[]> = {}
  for (let transaction of data.value?.body?.current || []) {
    const date = new Date(transaction.createdAt).toISOString().split('T')[0]
    if (transactionGroup[date]) {
      transactionGroup[date].push(transaction)
    } else {
      transactionGroup = {
        ...transactionGroup,
        [date]: [transaction]
      }
    }
  }
  return transactionGroup
})

const income = computed(() => {
  if (!data.value?.body) return []
  return data.value.body.current.filter((transaction: Transaction) => transaction.type.toLowerCase() === 'income')
})

if (error.value && isHydrated.value) {
  toast.add({
    title: 'Error',
    description: 'An error occurred while trying to fetch the transactions',
  })
}

const lastIncome = computed(() => {
  if (!data.value?.body) return []
  return data.value.body.last.filter((transaction: Transaction) => transaction.type.toLowerCase() === 'income')
})

const lastExpanse = computed((): Transaction[] => {
  if (!data.value?.body) return []
  return data.value.body.last.filter((transaction: Transaction) => {
    const type = transaction.type.toLowerCase()
    return type === 'expanse' || type === 'expense'
  })
})

const lastIncomeTotal = computed(() => {
  if (!lastIncome.value) return 0
  return useTotal(lastIncome.value).total.value
})

const lastExpanseTotal = computed(() => {
  if (!lastExpanse.value) return 0
  return useTotal(lastExpanse.value).total.value
})

const incomeTotal = computed(() => {
  if (!income.value) return 0
  return useTotal(income.value).total.value
})

const expanse = computed(() => {
  if (!data.value?.body) return []
  return data.value.body.current.filter((transaction: Transaction) => {
    const type = transaction.type.toLowerCase()
    return type === 'expanse' || type === 'expense'
  })
})

const expanseTotal = computed(() => {
  if (!expanse.value) return 0
  return useTotal(expanse.value).total.value
})

const handleDeleteTransaction = async (id: string) => {
  if (isLoading.value) return
  try {
  const res = await fetch(`/api/transaction`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${store.jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  })
  if (res.ok) {
    toast.add({
      title: 'Success',
      description: 'Transaction deleted successfully',
    })
    refresh()
  } else {
    toast.add({
      title: 'Error',
      description: 'An error occurred while trying to delete the transaction',
    })
  }
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: 'An error occurred while trying to delete the transaction',
    })
  } finally {
    isLoading.value = false
  }
}

const handleEdit = (date: string, _id: string) => {
  isEdit.value = true
  const transaction = transactionByDate.value[date].find((transaction: Transaction) => transaction._id === _id)
  if (!transaction) return
  transactionDetail.createdAt = transaction.createdAt.split('T')[0]
  transactionDetail.description = transaction.description
  transactionDetail.type = transaction.type
  transactionDetail.amount = transaction.amount
  transactionDetail._id = transaction._id
  isModalOpen.value = true
}

watch(selectedView, async () => {
  await refresh()
  if (error.value?.statusCode === 401 && isHydrated.value ) {
    toast.add({
      title: 'Unauthorized',
      description: 'You need to login to view your transactions',
    })
    router.push('/login')
  } else if (error.value && isHydrated.value) {
    toast.add({
      title: 'Error',
      description: 'An error occurred while trying to fetch the transactions',
    })
  }
}
)

const handleOpenModal = (value: boolean) => {
  isEdit.value = false
  isModalOpen.value = value
}

const handleSubmit = () => {
  refresh()
}

</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease-out;
}

.animate-slideInUp {
  animation: slideInUp 0.5s ease-out;
}

.animate-pulse-glow {
  animation: pulse-glow 2s infinite;
}

.scale-102 {
  transform: scale(1.02);
}

/* Smooth transitions */
:deep(.group:hover) .group-hover\:scale-102 {
  transform: scale(1.02);
}
</style>

<template>
  <NuxtLayout name="default">
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <UNotifications />

      <!-- Hero Section with Header -->
      <section class="mb-12 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-700 dark:via-purple-700 dark:to-blue-700 text-white rounded-2xl shadow-xl p-8 md:p-12">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <div class="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <i class="i-material-symbols-trending-up text-white text-2xl"></i>
              </div>
              <h1 class="text-4xl md:text-5xl font-black">Financial Summary</h1>
            </div>
            <p class="text-blue-100 text-lg">Track, manage, and analyze your transactions</p>
          </div>
          <div class="flex items-center gap-3 flex-wrap justify-end">
            <UButton 
              @click="refresh" 
              icon="i-material-symbols-refresh" 
              color="white"
              variant="ghost"
              :loading="loading"
              size="lg"
              class="bg-white/10 hover:bg-white/20"
            />
            <USelectMenu 
              v-model="selectedView" 
              :options="transactionViewOptions"
              color="white"
              class="bg-white/10"
            />
          </div>
        </div>
      </section>

      <!-- Summary Stats Section -->
      <section v-if="isHydrated" class="mb-12">
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <USkeleton v-for="i in 2" :key="i" class="h-40 rounded-2xl" />
        </div>
        <div v-else class="animate-fadeIn">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Income Card -->
            <div class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-102">
              <div class="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 opacity-100"></div>
              <div class="absolute inset-0 bg-gradient-to-tr from-green-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative p-8 text-white">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-xl font-bold">💰 Income</h3>
                  <div class="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <i class="i-material-symbols-trending-up-outline text-white text-2xl"></i>
                  </div>
                </div>
                <div class="space-y-2">
                  <div>
                    <p class="text-green-100 text-sm font-medium">This {{ selectedView }}</p>
                    <p class="text-3xl font-black">+{{ incomeTotal }}</p>
                  </div>
                  <div class="pt-4 border-t border-white/20">
                    <p class="text-green-100 text-xs">Previous {{ selectedView }}: +{{ lastIncomeTotal }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Expense Card -->
            <div class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-102">
              <div class="absolute inset-0 bg-gradient-to-br from-red-400 via-red-500 to-rose-600 opacity-100"></div>
              <div class="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative p-8 text-white">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-xl font-bold">🏷️ Expenses</h3>
                  <div class="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <i class="i-material-symbols-trending-down-outline text-white text-2xl"></i>
                  </div>
                </div>
                <div class="space-y-2">
                  <div>
                    <p class="text-red-100 text-sm font-medium">This {{ selectedView }}</p>
                    <p class="text-3xl font-black">-{{ expanseTotal }}</p>
                  </div>
                  <div class="pt-4 border-t border-white/20">
                    <p class="text-red-100 text-xs">Previous {{ selectedView }}: -{{ lastExpanseTotal }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Transactions Section -->
      <section v-if="isHydrated" class="mb-12">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3 mb-2">
              <span class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-2xl">
                📋
              </span>
              Transaction List
            </h2>
            <p class="text-gray-600 dark:text-gray-400 flex items-center gap-4 text-lg">
              <span class="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold">
                <i class="i-material-symbols-add-circle-outline"></i>
                {{ income.length }} Income
              </span>
              <span class="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full font-semibold">
                <i class="i-material-symbols-remove-circle-outline"></i>
                {{ expanse.length }} Expenses
              </span>
            </p>
          </div>
          <UButton 
            @click="handleOpenModal(true)" 
            icon="i-material-symbols-add-circle-outline-rounded" 
            size="xl"
            color="blue"
            variant="soft"
            label="+ Add Transaction" 
            class="w-full md:w-auto px-8 py-4 text-base font-bold"
          />
        </div>

        <!-- Modal -->
        <Modal
            :isEdit="isEdit"
            v-model:isModalOpen="isModalOpen"
            :data="isEdit ? transactionDetail : undefined"
            @submit="handleSubmit"
        />

        <!-- Empty State -->
        <div v-if="!loading && Object.keys(transactionByDate).length === 0" class="text-center py-24 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
          <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl mb-6">
            <i class="i-material-symbols-inbox-outline text-5xl text-blue-500 dark:text-blue-400"></i>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">No transactions yet</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">Start tracking your finances by adding your first transaction. It takes less than a minute!</p>
          <UButton 
            @click="handleOpenModal(true)" 
            icon="i-material-symbols-add-circle-outline-rounded"
            size="lg"
            color="blue"
            label="Add Your First Transaction" 
            class="px-8 py-3"
          />
        </div>

        <!-- Transactions List -->
        <div v-else-if="!loading" class="space-y-6 animate-fadeIn">
          <div v-for="(transactionOnDay, date) in transactionByDate" :key="date" class="group">
            <!-- Date Header -->
            <div class="sticky top-4 z-20 mb-4 transform transition-all duration-200">
              <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-md p-4 md:p-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <i class="i-material-symbols-calendar-today text-2xl"></i>
                    <div>
                      <p class="text-sm font-medium opacity-90">
                        {{ new Date(date).toLocaleDateString('en-US', { weekday: 'long' }) }}
                      </p>
                      <p class="text-lg font-bold">
                        {{ new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                      </p>
                    </div>
                  </div>
                  <TransactionSummaryDaily :transaction="transactionOnDay" :date="date.toString()" />
                </div>
              </div>
            </div>

            <!-- Transactions Cards -->
            <div class="grid grid-cols-1 gap-4 pl-0 md:pl-6">
              <Transaction 
                v-for="(transactionUser, index) in transactionOnDay" 
                :key="index" 
                :data="transactionUser"
                :Day="transactionByDate" 
                :loading="loading" 
                @delete="handleDeleteTransaction" 
                @edit="handleEdit" 
                class="group/card transform transition-all duration-300 hover:shadow-xl hover:scale-105 origin-left"
              />
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else class="space-y-6">
          <div class="space-y-4">
            <USkeleton class="h-16 rounded-2xl" />
            <div class="grid grid-cols-1 gap-4 pl-0 md:pl-6">
              <USkeleton v-for="i in 4" :key="i" class="h-24 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      <!-- Hydration Loading -->
      <section v-else class="text-center py-20">
        <USkeleton class="h-96 rounded-2xl mb-4" />
        <USkeleton class="h-64 rounded-2xl" />
      </section>
    </div>
  </NuxtLayout>
</template>
