export type EventStatus = 'scheduled' | 'completed' | 'canceled';

export type EventOption = {
    id: number;
    name: string;
};

export type CalendarEvent = {
    id: number;
    client_id: number | null;
    offering_id: number | null;
    client: EventOption | null;
    offering: EventOption | null;
    title: string;
    date: string;
    start_time: string;
    end_time: string | null;
    notes: string | null;
    status: EventStatus;
};
