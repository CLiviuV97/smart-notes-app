'use client';

import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import { loginWithEmail } from '@/features/auth/services/authClient';
import { firebaseErrorMessage } from '@/features/auth/utils/firebaseErrors';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string') errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      setError(firebaseErrorMessage(err, 'Login failed. Please try again.'));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="login-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        required
      />

      <FormField
        id="login-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        required
      />

      {error && (
        <p role="alert" className="text-sm text-margin-red">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} className="h-12 w-full">
        Sign In
      </Button>
    </form>
  );
}
