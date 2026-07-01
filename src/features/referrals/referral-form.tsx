import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import {
  getReferralByToken,
  submitReferral,
} from '@/services/referral-service';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { Loader2Icon } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ReferralInfo = {
  referrer_name: string | null;
};

export function ReferralForm() {
  const { token } = useParams({ from: '/(public)/referral/$token' });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error' | 'rate_limit'
  >('idle');
  const [userCountry, setUserCountry] = useState<string>('');

  const {
    data: referral,
    isLoading,
    isError,
  } = useQuery<ReferralInfo>({
    queryKey: ['referral', token],
    queryFn: () => getReferralByToken(token),
    retry: false,
  });

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((response) => response.json())
      .then((data) => {
        if (data.country_code) {
          setUserCountry(data.country_code.toLowerCase());
        }
      })
      .catch(() => {});
  }, []);

  const submitMutation = useMutation({
    mutationFn: () => submitReferral(token, { name, phone, email }),
    onSuccess: () => {
      setSubmitStatus('success');
      setName('');
      setPhone('');
      setEmail('');
      setErrors({});
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 429) {
        setSubmitStatus('rate_limit');
      } else {
        setSubmitStatus('error');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'This field is required.';
    }

    if (!phone.trim()) {
      newErrors.phone = 'This field is required.';
    } else {
      try {
        const phoneUtil = PhoneNumberUtil.getInstance();
        if (!phoneUtil.isValidNumber(phoneUtil.parse(phone))) {
          newErrors.phone = 'Invalid phone number.';
        }
      } catch {
        newErrors.phone = 'Invalid phone number.';
      }
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Invalid email address.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitStatus('idle');
    submitMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !referral) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Invalid Link</h2>
          <p className="text-muted-foreground mt-2">
            This referral link is invalid or may have been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="bg-background w-full max-w-md rounded-xl border p-6 shadow-sm md:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Application Form</h1>
          {referral.referrer_name && (
            <p className="text-muted-foreground mt-2 text-sm">
              <span className="font-medium">{referral.referrer_name}</span>{' '}
              invited you. Leave your details and we'll get in touch with you.
            </p>
          )}
        </div>

        {submitStatus === 'success' ? (
          <div className="rounded-lg bg-green-50 p-4 text-center text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Your application has been received. Thank you!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {submitStatus === 'error' && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
                An error occurred. Please try again.
              </div>
            )}

            {submitStatus === 'rate_limit' && (
              <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                Too many attempts. Please try again later.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: '' }));
                }}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <PhoneInput
                defaultCountry={userCountry || 'tr'}
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                  setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                style={{ width: '100%' }}
                inputStyle={{
                  width: '100%',
                  height: '40px',
                  fontSize: '14px',
                }}
                inputClassName={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: '' }));
                }}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
