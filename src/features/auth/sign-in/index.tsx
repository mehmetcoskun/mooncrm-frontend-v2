import { useState } from 'react';
import { useSearch } from '@tanstack/react-router';
import { ChangePasswordForm } from './components/change-password-form';
import { TwoFactorForm } from './components/two-factor-form';
import { UserAuthForm } from './components/user-auth-form';

type AuthStep = 'login' | 'two-factor' | 'change-password';

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' });
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [userId, setUserId] = useState<number | null>(null);

  const handleTwoFactorRequired = (id: number) => {
    setUserId(id);
    setAuthStep('two-factor');
  };

  const handlePasswordChangeRequired = () => {
    setAuthStep('change-password');
  };

  const handleBackToLogin = () => {
    setAuthStep('login');
    setUserId(null);
  };

  return (
    <div className="relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col p-10 text-white lg:flex">
        <div className="dark:bg-background absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img src="/images/logo.png" width={180} height={36} alt="MoonCRM" />
        </div>

        <div className="relative z-20 mt-auto flex flex-1 flex-col justify-center">
          <div className="space-y-2">
            <h3 className="text-6xl font-light">Müşteri İlişkileri</h3>
            <h3 className="text-6xl font-bold text-indigo-400">Yönetiminde</h3>
            <h3 className="text-6xl font-light">Yeni Nesil</h3>
            <h3 className="text-6xl font-bold text-indigo-400">Yaklaşım</h3>
          </div>
        </div>

        <div className="relative z-20 mt-auto">
          <p className="text-xs text-zinc-500">
            © 2025 MoonCRM. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-left">
            <h1 className="text-2xl font-semibold tracking-tight">
              {authStep === 'login' && 'Giriş Yap'}
              {authStep === 'two-factor' && 'İki Faktörlü Doğrulama'}
              {authStep === 'change-password' && 'Şifre Değiştir'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {authStep === 'login' &&
                'Hesabınıza giriş yapmak için kurum kodunuzu, e-posta ve şifrenizi giriniz.'}
              {authStep === 'two-factor' &&
                'Güvenliğiniz için lütfen doğrulama kodunuzu giriniz.'}
              {authStep === 'change-password' &&
                'Güvenliğiniz için şifrenizi değiştirmeniz gerekmektedir.'}
            </p>
          </div>

          {authStep === 'login' && (
            <UserAuthForm
              redirectTo={redirect}
              onTwoFactorRequired={handleTwoFactorRequired}
              onPasswordChangeRequired={handlePasswordChangeRequired}
            />
          )}

          {authStep === 'two-factor' && userId && (
            <TwoFactorForm
              userId={userId}
              redirectTo={redirect}
              onBack={handleBackToLogin}
              onPasswordChangeRequired={handlePasswordChangeRequired}
            />
          )}

          {authStep === 'change-password' && (
            <ChangePasswordForm redirectTo={redirect} />
          )}
        </div>
      </div>
    </div>
  );
}
