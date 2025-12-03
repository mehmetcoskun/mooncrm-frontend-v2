import { createFileRoute } from '@tanstack/react-router';
import { WebFormIframe } from '@/features/web-forms/web-form-iframe';

export const Route = createFileRoute('/(public)/web-form/iframe/$uuid')({
  component: WebFormIframe,
});
