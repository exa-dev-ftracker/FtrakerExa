export type dataUserRedis = {
    id: string;
    name: string;
    email: string;
}

export interface Category {
    _id: string
    user: string
    name: string
    type: 'income' | 'expense' | null
    color: string
    icon: string
    createdAt: string
    updatedAt: string
}

export interface Transaction {
    type: string
    amount: number
    description: string
    createdAt: string
    _id: string
    updatedAt: string
    category?: Category | string | null
}

export interface TransactionResponse {
    statusCode: number
    body: {
        current: Transaction[]
        last: Transaction[]
    }
}

export type TransactionType = 'income' | 'expense' | 'expanse'

export const normalizeTransactionType = (type: string): TransactionType => {
    const normalized = type.toLowerCase()
    if (normalized === 'income' || normalized === 'expense' || normalized === 'expanse') {
        return normalized as TransactionType
    }
    return 'expense'
}

export const displayTransactionType = (type: string): string => {
    const normalized = normalizeTransactionType(type)
    if (normalized === 'income') return 'Income'
    return 'Expense' // Both 'expense' and 'expanse' display as 'Expense'
}