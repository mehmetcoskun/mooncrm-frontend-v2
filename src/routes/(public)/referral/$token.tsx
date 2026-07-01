import { createFileRoute } from '@tanstack/react-router';
import { ReferralForm } from '@/features/referrals/referral-form';

export const Route = createFileRoute('/(public)/referral/$token')({
  component: ReferralForm,
});
