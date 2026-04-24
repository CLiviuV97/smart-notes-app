import { type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export function FormField({ id, label, error, className, ...inputProps }: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink-2">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'mt-1 block w-full rounded-lg border border-rule px-3 py-2 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent bg-transparent text-ink',
          error && 'border-margin-red',
          className,
        )}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-margin-red">
          {error}
        </p>
      )}
    </div>
  );
}
