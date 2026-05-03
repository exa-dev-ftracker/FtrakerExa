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

<template>
  <NuxtLayout name="default">
    <section class="flex justify-between ">
      <UNotifications />
      <h1 class="text-4xl font-extrabold">Summary</h1>
      <USelectMenu v-model="selectedView" :options="transactionViewOptions" />
    </section>
    <section v-if="isHydrated" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-16 mb-10">
      <Trend title="Income" type="Income" :selectedView="selectedView" :amount="incomeTotal"
        :last-amount="lastIncomeTotal" :periode="selectedView" color="green" :loading="loading" />
      <Trend title="Expense" type="Expense" :selectedView="selectedView" :amount="expanseTotal"
        :last-amount="lastExpanseTotal" :periode="selectedView" color="red" :loading="loading" />
    </section>
    <section>
      <div v-if="isHydrated" class="flex my-8 justify-between">
        <div>
          <h2 class="text-3xl mb-4 font-bold">Transactions</h2>
          <p class="text-gray-500">You have {{ income.length }} incomes and {{ expanse.length }} expenses this {{
            selectedView }}
          </p>
        </div>
        <div>
          <UButton @click="handleOpenModal(true)" icon="i-material-symbols-add-circle-outline-rounded" size="sm"
            color="gray" variant="solid" label="Add" :trailing="false" />
        </div>
      </div>
    </section>
    <section>
      <Modal
          :isEdit="isEdit"
          v-model:isModalOpen="isModalOpen"
          :data="isEdit ? transactionDetail : undefined"
          @submit="handleSubmit"
      />
    </section>
    <section v-if="!loading">
      <div class="mb-8" v-for="(transactionOnDay, date) in transactionByDate" :key="date">
        <TransactionSummaryDaily :transaction="transactionOnDay" :date="date.toString()" />
        <Transaction v-for="(transactionUser, index) in transactionOnDay" :key="index" :data="transactionUser"
          :Day="transactionByDate" :loading="loading" @delete="handleDeleteTransaction" @edit="handleEdit" />
      </div>
    </section>
    <div v-else>
      <USkeleton v-for="i in 3" :key="i" class="h-8 w-full mb-2" />
    </div>
  </NuxtLayout>
</template>
