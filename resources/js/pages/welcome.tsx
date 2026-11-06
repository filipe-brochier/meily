import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    Check,
    CreditCard,
    LayoutGrid,
    Package,
    TrendingUp,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { dashboard, login, register } from '@/routes';

type Feature = {
    title: string;
    description: string;
    icon: LucideIcon;
};

const features: Feature[] = [
    {
        title: 'Clientes na palma da mão',
        description:
            'Guarde contatos, histórico de atendimentos e observações de cada cliente em um só lugar.',
        icon: Users,
    },
    {
        title: 'Produtos e serviços',
        description:
            'Cadastre o que você vende, com preços organizados, e agilize cada novo lançamento.',
        icon: Package,
    },
    {
        title: 'Agenda sem bagunça',
        description:
            'Compromissos, entregas e atendimentos organizados para você nunca esquecer um cliente.',
        icon: CalendarDays,
    },
    {
        title: 'Controle financeiro simples',
        description:
            'Registre entradas e saídas em segundos e acompanhe o histórico do seu negócio.',
        icon: CreditCard,
    },
    {
        title: 'Visão geral do negócio',
        description:
            'Um painel direto ao ponto mostra como o seu mês está andando, sem planilhas complicadas.',
        icon: LayoutGrid,
    },
    {
        title: 'Feito para o MEI',
        description:
            'Sem termos contábeis difíceis: tudo pensado para quem toca o próprio negócio no dia a dia.',
        icon: TrendingUp,
    },
];

const steps = [
    {
        title: 'Crie sua conta',
        description: 'Leva menos de um minuto, sem cartão de crédito.',
    },
    {
        title: 'Cadastre clientes e serviços',
        description: 'Monte a base do seu negócio com poucos cliques.',
    },
    {
        title: 'Lance e acompanhe',
        description:
            'Registre vendas e despesas e veja os resultados crescerem.',
    },
];

const chartBars = [38, 52, 44, 68, 60, 82, 94];

function DashboardPreview() {
    return (
        <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] bg-linear-to-br from-violet-500/30 via-blue-500/20 to-emerald-400/30 blur-2xl" />

            <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-violet-900/10 dark:border-white/10 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Faturamento do mês
                        </p>
                        <p className="mt-1 text-3xl font-bold tracking-tight text-[#0b1650] dark:text-white">
                            R$ 8.450,00
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        <ArrowUpRight className="size-3.5" />
                        +18%
                    </span>
                </div>

                <div className="mt-6 flex h-28 items-end gap-2">
                    {chartBars.map((height, index) => (
                        <div
                            key={index}
                            style={{ height: `${height}%` }}
                            className={
                                index === chartBars.length - 1
                                    ? 'flex-1 rounded-t-lg bg-linear-to-t from-emerald-500 to-emerald-300'
                                    : 'flex-1 rounded-t-lg bg-linear-to-t from-violet-600 to-blue-500 opacity-70'
                            }
                        />
                    ))}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Despesas
                        </p>
                        <p className="mt-1 font-semibold text-[#0b1650] dark:text-white">
                            R$ 2.130,00
                        </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Clientes ativos
                        </p>
                        <p className="mt-1 font-semibold text-[#0b1650] dark:text-white">
                            42
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-white/10">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                        <CalendarDays className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#0b1650] dark:text-white">
                            Entrega para Maria Souza
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Hoje, 15:00
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Gestão simples para o seu MEI" />

            <div className="min-h-screen overflow-x-hidden bg-white text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
                    <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
                        <Link href="/" className="flex items-center">
                            <img
                                src="/images/logo.png"
                                alt="Meily"
                                className="h-20 w-auto rounded-xl dark:bg-white dark:px-2"
                            />
                        </Link>

                        <nav className="flex items-center gap-2 text-sm font-medium">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-white shadow-lg shadow-violet-600/25 transition hover:brightness-110"
                                >
                                    Ir para o painel
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-full px-5 py-2.5 text-[#0b1650] transition hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
                                    >
                                        Entrar
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="hidden rounded-full bg-linear-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-white shadow-lg shadow-violet-600/25 transition hover:brightness-110 sm:inline-flex"
                                    >
                                        Criar conta grátis
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main>
                    <section className="relative">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-linear-to-b from-violet-500/10 to-transparent" />

                        <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 py-16 lg:grid-cols-2 lg:py-24">
                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
                                    <span className="size-2 rounded-full bg-emerald-500" />
                                    Gestão para MEI, sem complicação
                                </span>

                                <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#0b1650] sm:text-5xl lg:text-6xl dark:text-white">
                                    Seu negócio{' '}
                                    <span className="bg-linear-to-r from-violet-600 via-blue-600 to-emerald-500 bg-clip-text text-transparent">
                                        crescendo
                                    </span>
                                    , do seu jeito.
                                </h1>

                                <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                                    Clientes, agenda, produtos e finanças em um
                                    só lugar. O Meily ajuda você, MEI, a
                                    organizar o dia a dia e ter mais tempo para
                                    o que realmente importa: vender.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={
                                            auth.user ? dashboard() : register()
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-violet-600 to-blue-600 px-7 py-3.5 font-semibold text-white shadow-xl shadow-violet-600/30 transition hover:brightness-110"
                                    >
                                        {auth.user
                                            ? 'Abrir meu painel'
                                            : 'Começar agora'}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                    {!auth.user && (
                                        <Link
                                            href={login()}
                                            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-7 py-3.5 font-semibold text-[#0b1650] transition hover:bg-slate-50 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
                                        >
                                            Já tenho conta
                                        </Link>
                                    )}
                                </div>

                                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    {[
                                        'Fácil de usar',
                                        'Sem planilhas',
                                        'Funciona no celular',
                                    ].map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-center gap-2"
                                        >
                                            <Check className="size-4 text-emerald-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <DashboardPreview />
                        </div>
                    </section>

                    <section className="bg-slate-50 py-20 dark:bg-slate-900/50">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-bold tracking-tight text-[#0b1650] sm:text-4xl dark:text-white">
                                    Tudo o que o seu MEI precisa
                                </h2>
                                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                                    Ferramentas essenciais, reunidas de forma
                                    simples para você gerenciar sem dor de
                                    cabeça.
                                </p>
                            </div>

                            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {features.map(
                                    ({ title, description, icon: Icon }) => (
                                        <div
                                            key={title}
                                            className="group rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/5 dark:border-white/10 dark:bg-slate-900"
                                        >
                                            <span className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-600/25">
                                                <Icon className="size-6" />
                                            </span>
                                            <h3 className="mt-5 text-lg font-semibold text-[#0b1650] dark:text-white">
                                                {title}
                                            </h3>
                                            <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-400">
                                                {description}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="py-20">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-bold tracking-tight text-[#0b1650] sm:text-4xl dark:text-white">
                                    Comece em três passos
                                </h2>
                            </div>

                            <ol className="mt-14 grid gap-8 md:grid-cols-3">
                                {steps.map((step, index) => (
                                    <li
                                        key={step.title}
                                        className="relative rounded-3xl border border-slate-200 p-7 dark:border-white/10"
                                    >
                                        <span className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                            {index + 1}
                                        </span>
                                        <h3 className="mt-5 text-lg font-semibold text-[#0b1650] dark:text-white">
                                            {step.title}
                                        </h3>
                                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                                            {step.description}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>

                    {!auth.user && (
                        <section className="px-6 pb-20">
                            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-linear-to-br from-violet-700 via-indigo-700 to-blue-600 px-8 py-16 text-center text-white shadow-2xl shadow-violet-900/20">
                                <div className="absolute -top-20 -right-20 size-72 rounded-full bg-emerald-400/20 blur-3xl" />
                                <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-fuchsia-400/20 blur-3xl" />

                                <div className="relative">
                                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                        Pronto para fazer seu MEI crescer?
                                    </h2>
                                    <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                                        Crie sua conta e organize seus clientes,
                                        agenda e finanças hoje mesmo.
                                    </p>
                                    <Link
                                        href={register()}
                                        className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-[#0b1650] transition hover:bg-emerald-50"
                                    >
                                        Criar minha conta
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                    © {new Date().getFullYear()} Meily · Gestão para MEI
                </footer>
            </div>
        </>
    );
}
