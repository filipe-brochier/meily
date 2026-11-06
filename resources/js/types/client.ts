import type { Transaction } from './transaction';

export type Client = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
};

export type ClientProfile = {
    client: Client;
    summary: {
        received: string;
        pending: string;
        services_count: number;
        last_service_on: string | null;
    };
    upcoming_events: {
        id: number;
        title: string;
        date: string;
        start_time: string;
        end_time: string | null;
        offering: { id: number; name: string } | null;
    }[];
    transactions: Transaction[];
};
