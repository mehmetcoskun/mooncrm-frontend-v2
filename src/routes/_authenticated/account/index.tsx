import { createFileRoute } from '@tanstack/react-router';
import { Profile } from '@/features/account/profile';

export const Route = createFileRoute('/_authenticated/account/')({
  component: Profile,
});
