import type { Category } from './offering';

export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'paid' | 'pending' | 'canceled';

export type Transaction = {
    id: number;
    type: TransactionType;
    status: TransactionStatus;
    description: string;
    amount: string;
    happened_on: string;
    category: Category | null;
};

export type Paginated<T> = {
    data: T[];
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
