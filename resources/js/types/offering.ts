export type Category = {
    id: number;
    name: string;
};

export type Offering = {
    id: number;
    category_id: number | null;
    category: Category | null;
    name: string;
    description: string | null;
    price: string;
    active: boolean;
};
