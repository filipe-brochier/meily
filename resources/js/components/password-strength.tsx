import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    password: string;
    className?: string;
};

const requirements = [
    {
        label: 'Mínimo de 8 caracteres',
        isMet: (password: string) => password.length >= 8,
    },
    {
        label: 'Letras maiúsculas e minúsculas',
        isMet: (password: string) =>
            /\p{Lu}/u.test(password) && /\p{Ll}/u.test(password),
    },
    {
        label: 'Pelo menos um número',
        isMet: (password: string) => /\d/.test(password),
    },
];

const levels = [
    { label: 'Muito fraca', bar: 'bg-destructive', text: 'text-destructive' },
    { label: 'Fraca', bar: 'bg-orange-500', text: 'text-orange-600' },
    { label: 'Razoável', bar: 'bg-yellow-500', text: 'text-yellow-600' },
    { label: 'Boa', bar: 'bg-lime-500', text: 'text-lime-600' },
    { label: 'Forte', bar: 'bg-emerald-500', text: 'text-emerald-600' },
];

function strengthLevel(password: string): number {
    if (password === '') {
        return -1;
    }

    const metRequirements = requirements.filter(({ isMet }) =>
        isMet(password),
    ).length;
    const bonus =
        Number(/[^\p{L}\d]/u.test(password)) + Number(password.length >= 12);
    const score = metRequirements + bonus;

    if (score <= 1) {
        return 0;
    }

    return Math.min(score - 1, levels.length - 1);
}

export default function PasswordStrength({ password, className }: Props) {
    const level = strengthLevel(password);
    const current = level >= 0 ? levels[level] : null;

    return (
        <div className={cn('space-y-2', className)} aria-live="polite">
            <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-1" aria-hidden>
                    {levels.map((item, index) => (
                        <div
                            key={item.label}
                            className={cn(
                                'h-1.5 flex-1 rounded-full bg-muted transition-colors',
                                current && index <= level && current.bar,
                            )}
                        />
                    ))}
                </div>
                <span
                    className={cn(
                        'w-20 text-right text-xs font-medium',
                        current?.text ?? 'text-muted-foreground',
                    )}
                >
                    {current ? current.label : 'Força da senha'}
                </span>
            </div>

            <ul className="grid gap-1 text-xs">
                {requirements.map(({ label, isMet }) => {
                    const met = isMet(password);

                    return (
                        <li
                            key={label}
                            className={cn(
                                'flex items-center gap-2',
                                met
                                    ? 'text-emerald-600'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {met ? (
                                <Check className="size-3.5" />
                            ) : (
                                <Circle className="size-3.5" />
                            )}
                            {label}
                        </li>
                    );
                })}
            </ul>

            <p className="text-xs text-muted-foreground">
                Dica: símbolos (!@#$) e 12 ou mais caracteres deixam a senha
                mais forte.
            </p>
        </div>
    );
}
