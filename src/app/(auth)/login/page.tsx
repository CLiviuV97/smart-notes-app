import { LoginForm } from '@/features/auth/components/LoginForm';
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton';

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-[28px] italic font-semibold text-ink">Smart Notes</h1>
          <p className="mt-1 text-[14px] text-ink-3">Sign in to your account</p>
        </div>

        <LoginForm />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-rule" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-paper px-2 text-ink-3">or</span>
          </div>
        </div>

        <GoogleSignInButton />
      </div>
    </div>
  );
}
