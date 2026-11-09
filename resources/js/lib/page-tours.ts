import type { DriveStep } from 'driver.js';

export type PageTourConfig = {
    key: string;
    steps: DriveStep[];
};

const clientsSteps: DriveStep[] = [
    {
        popover: {
            title: 'Clientes 👥',
            description:
                'Aqui você organiza todos os seus contatos e consulta o histórico de cada um.',
        },
    },
    {
        element: '[data-tour="clients-search"]',
        popover: {
            title: 'Buscar clientes',
            description: 'Encontre rapidamente por nome, telefone ou e-mail.',
        },
    },
    {
        element: '[data-test="new-client-button"]',
        popover: {
            title: 'Novo cliente',
            description:
                'Cadastre nome, telefone, e-mail e endereço em poucos segundos.',
        },
    },
    {
        element: '[data-tour="clients-table"]',
        popover: {
            title: 'Lista de clientes',
            description:
                'Clique em um cliente para abrir a ficha completa com o histórico dele.',
        },
    },
    {
        element: '[data-tour="clients-row-actions"]',
        popover: {
            title: 'Editar ou excluir',
            description:
                'Use os ícones para editar os dados ou remover um cliente.',
        },
    },
];

const offeringsSteps: DriveStep[] = [
    {
        popover: {
            title: 'Produtos e serviços 📦',
            description:
                'Cadastre tudo o que você vende para agilizar seus lançamentos financeiros.',
        },
    },
    {
        element: '[data-tour="offerings-search"]',
        popover: {
            title: 'Buscar itens',
            description: 'Encontre rapidamente um produto ou serviço.',
        },
    },
    {
        element: '[data-test="new-offering-button"]',
        popover: {
            title: 'Novo item',
            description: 'Cadastre o nome, a categoria e o preço de venda.',
        },
    },
    {
        element: '[data-tour="offerings-grid"]',
        popover: {
            title: 'Seus itens',
            description:
                'Cada cartão mostra o preço, a categoria e se o item está ativo.',
        },
    },
    {
        element: '[data-tour="offerings-row-actions"]',
        popover: {
            title: 'Editar ou excluir',
            description:
                'Use os ícones para editar os dados ou remover um item.',
        },
    },
];

const eventsSteps: DriveStep[] = [
    {
        popover: {
            title: 'Agenda 📅',
            description:
                'Organize atendimentos e compromissos para não esquecer nada.',
        },
    },
    {
        element: '[data-tour="events-calendar"]',
        popover: {
            title: 'Calendário',
            description:
                'Navegue pelos meses e clique em um dia para ver os compromissos dele.',
        },
    },
    {
        element: '[data-test="new-event-button"]',
        popover: {
            title: 'Novo evento',
            description:
                'Agende um atendimento vinculado a um cliente ou produto/serviço.',
        },
    },
    {
        element: '[data-tour="events-list"]',
        popover: {
            title: 'Compromissos do dia',
            description:
                'Veja os detalhes, edite ou exclua um compromisso do dia selecionado.',
        },
    },
];

const transactionsIndexSteps: DriveStep[] = [
    {
        popover: {
            title: 'Histórico financeiro 💰',
            description: 'Acompanhe tudo o que você recebeu e gastou.',
        },
    },
    {
        element: '[data-tour="transactions-search"]',
        popover: {
            title: 'Buscar lançamentos',
            description: 'Busque por descrição ou categoria.',
        },
    },
    {
        element: '[data-tour="transactions-filter"]',
        popover: {
            title: 'Filtrar por tipo',
            description: 'Veja só as receitas ou só as despesas.',
        },
    },
    {
        element: '[data-test="new-transaction-button"]',
        popover: {
            title: 'Novo lançamento',
            description: 'Registre uma venda ou uma despesa.',
        },
    },
    {
        element: '[data-test="transactions-balance"]',
        popover: {
            title: 'Saldo',
            description:
                'O saldo é calculado com base nos lançamentos filtrados aqui.',
        },
    },
    {
        element: '[data-tour="transactions-list"]',
        popover: {
            title: 'Seus lançamentos',
            description:
                'Cancele, reative ou exclua um lançamento sem perder o histórico financeiro.',
        },
    },
];

const transactionsCreateSteps: DriveStep[] = [
    {
        popover: {
            title: 'Novo lançamento ➕',
            description:
                'Registre uma receita ou despesa em menos de 1 minuto.',
        },
    },
    {
        element: '[data-tour="transaction-type"]',
        popover: {
            title: 'Tipo de movimentação',
            description:
                'Escolha se é uma receita (dinheiro que entrou) ou despesa (dinheiro que saiu).',
        },
    },
    {
        element: '#transaction-amount',
        popover: {
            title: 'Valor e data',
            description: 'Informe o valor e a data em que isso aconteceu.',
        },
    },
    {
        element: '#transaction-category',
        popover: {
            title: 'Categoria e situação',
            description:
                'Escolha a categoria e marque se já foi pago/recebido ou se ainda está pendente.',
        },
    },
    {
        element: '#transaction-description',
        popover: {
            title: 'Descrição',
            description:
                'Escreva um resumo curto para lembrar do que se trata.',
        },
    },
    {
        element: '[data-test="save-transaction-button"]',
        popover: {
            title: 'Salvar lançamento',
            description:
                'Pronto! Clique aqui para registrar e começar um novo lançamento.',
        },
    },
];

export const pageTours: Record<string, PageTourConfig> = {
    'clients/index': { key: 'clients', steps: clientsSteps },
    'offerings/index': { key: 'offerings', steps: offeringsSteps },
    'events/index': { key: 'events', steps: eventsSteps },
    'transactions/index': {
        key: 'transactions-index',
        steps: transactionsIndexSteps,
    },
    'transactions/create': {
        key: 'transactions-create',
        steps: transactionsCreateSteps,
    },
};
