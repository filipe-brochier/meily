import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { code as verifyCode } from '@/routes/verification';

const CODE_LENGTH = 4;

export default function VerifyEmail() {
    const [code, setCode] = useState<string>('');

    return (
        <>
            <Head title="Verificação de acesso" />

            <Form
                {...verifyCode.form()}
                className="space-y-6 text-center"
                resetOnError
                onError={() => setCode('')}
            >
                {({ errors, processing }) => (
                    <>
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <InputOTP
                                name="code"
                                maxLength={CODE_LENGTH}
                                value={code}
                                onChange={setCode}
                                disabled={processing}
                                pattern={REGEXP_ONLY_DIGITS}
                                autoFocus
                            >
                                <InputOTPGroup>
                                    {Array.from(
                                        { length: CODE_LENGTH },
                                        (_, index) => (
                                            <InputOTPSlot
                                                key={index}
                                                index={index}
                                            />
                                        ),
                                    )}
                                </InputOTPGroup>
                            </InputOTP>
                            <InputError message={errors.code} />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing || code.length < CODE_LENGTH}
                        >
                            {processing && <Spinner />}
                            Confirmar código
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            Sair
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Código de acesso',
    description:
        'Digite o código de 4 dígitos que enviamos para você para liberar o seu acesso.',
};
