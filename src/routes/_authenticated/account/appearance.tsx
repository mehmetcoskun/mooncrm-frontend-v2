import { createFileRoute } from '@tanstack/react-router';
import { Appearance } from '@/features/account/appearance';

export const Route = createFileRoute('/_authenticated/account/appearance')({
  component: Appearance,
});
