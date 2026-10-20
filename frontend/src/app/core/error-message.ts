import { HttpErrorResponse } from '@angular/common/http';

export function friendlyError(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) return 'CivicPulse could not reach the server. Check that the backend is running, then try again.';
  if (error.status === 400) return 'Please check the highlighted fields and try again.';
  if (error.status === 401) return error.url?.includes('/api/auth/login')
    ? 'Email or password is incorrect.'
    : 'Your session has expired. Please sign in again.';
  if (error.status === 403) return 'You do not have permission to perform this action.';
  if (error.status === 404) return 'This complaint could not be found.';
  if (error.status === 409) return safeMessage(error.error?.message) ?? 'This request conflicts with existing data.';
  if (error.status >= 500) return 'The server is temporarily unavailable. Please try again.';
  return safeMessage(error.error?.message) ?? fallback;
}

function safeMessage(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const message = value.trim();
  if (!message || message.length > 240 || /<|>|\{|\}|exception|stack trace|sqlstate/i.test(message)) return null;
  return message;
}
