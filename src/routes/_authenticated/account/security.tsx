import { createFileRoute } from '@tanstack/react-router';
import { Security } from '@/features/account/security';

export const Route = createFileRoute('/_authenticated/account/security')({
  component: Security,
});

