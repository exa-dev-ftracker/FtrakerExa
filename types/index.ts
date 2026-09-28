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

export interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
}

export interface TransactionSummary {
    totalIncome: number
    totalExpense: number
    balance: number
    totalCount: number
    incomeCount: number
    expenseCount: number
}

export interface TransactionResponse {
    statusCode: number
    body: {
        current: Transaction[]
        last: Transaction[]
        pagination?: PaginationInfo
    }
}

export interface TransactionSummaryResponse {
    statusCode: number
    body: TransactionSummary
}

export interface DashboardMetrics {
    balance: number
    incomeTotal: number
    expenseTotal: number
    transactionCount: number
}

export interface TopExpenseItem {
    name: string
    amount: number
    percentage: number
    color?: string
    icon?: string
}

export interface DashboardData {
    metrics: DashboardMetrics
    recentTransactions: Transaction[]
    topExpenses: TopExpenseItem[]
}

export interface DashboardResponse {
    statusCode: number
    body: DashboardData
}

export interface CategoryBreakdown {
    name: string
    amount: number
    percentage: number
    color?: string
    icon?: string
}

export interface AnalyticsMetrics {
    incomeTotal: number
    expenseTotal: number
    netSavings: number
    transactionCount: number
    averageTransaction: number
    largestTransaction: number
}

export interface AnalyticsData {
    metrics: AnalyticsMetrics
    incomeByCategory: CategoryBreakdown[]
    expenseByCategory: CategoryBreakdown[]
}

export interface AnalyticsResponse {
    statusCode: number
    body: AnalyticsData
}

export type TransactionType = 'income' | 'expense'

export const normalizeTransactionType = (type: string): TransactionType => {
    const normalized = type.toLowerCase()
    if (normalized === 'income' || normalized === 'expense') {
        return normalized as TransactionType
    }
    return 'expense'
}

export const displayTransactionType = (type: string): string => {
    const normalized = normalizeTransactionType(type)
    if (normalized === 'income') return 'Income'
    return 'Expense'
}