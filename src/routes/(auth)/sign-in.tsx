import { z } from 'zod';
import { createFileRoute } from '@tanstack/react-router';
import { isAuthenticated } from '@/services/auth-service';
import { SignIn } from '@/features/auth/sign-in';

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/(auth)/sign-in')({
  component: () => {
    if (isAuthenticated()) {
      window.location.href = '/';
      return null;
    }
    return <SignIn />;
  },
  validateSearch: searchSchema,
});
