import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, Moon, WalletCards, Sun } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "../subtrack/Button";
import { Field } from "../subtrack/Field";

interface AuthPageProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
}

export function AuthPage({
  theme,
  onToggleTheme,
  mode,
  onModeChange,
  onSubmit,
  busy,
}: AuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = mode === "login";

  return (
    <div className="auth-page">
      <Toaster position="top-right" richColors theme={theme} />
      <section className="auth-story">
        <div className="auth-brand">
          <div className="brand-icon">
            <span />
            <span />
          </div>
          <span>subtrack</span>
        </div>
        <div className="auth-story-copy">
          <span className="auth-kicker">YOUR MONEY, IN FOCUS</span>
          <h1>Make room for what matters.</h1>
          <p>
            See every subscription clearly, stay ahead of renewals, and feel
            more in control of your monthly spending.
          </p>
          <div className="auth-story-stat">
            <span className="auth-stat-icon">
              <WalletCards size={19} />
            </span>
            <span>
              <strong>One clear view</strong>
              <small>Your recurring costs, all together</small>
            </span>
          </div>
        </div>
        <span className="auth-story-footer">
          A little clarity goes a long way.
        </span>
      </section>
      <main className="auth-main">
        <button
          className="auth-theme-toggle"
          type="button"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          onClick={onToggleTheme}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <section className="auth-card">
          <div className="auth-card-heading">
            <span className="auth-kicker">
              {isLogin ? "WELCOME BACK" : "GET STARTED"}
            </span>
            <h2>{isLogin ? "Sign in to Subtrack" : "Create your account"}</h2>
            <p>
              {isLogin
                ? "Enter your details to access your subscriptions."
                : "Create an account to start tracking your subscriptions."}
            </p>
          </div>
          <button
            className="google-signin"
            type="button"
            onClick={() =>
              toast.message(
                "Google sign-in is not configured on this backend yet."
              )
            }
          >
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.9c-.58 2.96-2.25 5.48-4.73 7.18l7.66 5.94c4.47-4.13 7.15-10.2 7.15-17.59Z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19Z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.9-5.86l-7.66-5.94c-2.13 1.43-4.86 2.27-8.24 2.27-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
              />
            </svg>
            {isLogin ? "Continue with Google" : "Sign up with Google"}
          </button>
          <div className="auth-divider">
            <span>or continue with email</span>
          </div>
          <form className="auth-form" onSubmit={onSubmit}>
            {!isLogin && (
              <Field label="Full name">
                <input
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="Alex Morgan"
                />
              </Field>
            )}
            <Field label="Email address">
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password">
              <div className="auth-password">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  minLength={8}
                  required
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(value => !value)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>
            {isLogin && (
              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  toast.message(
                    "Password reset is not available because this backend has no reset endpoint yet."
                  )
                }
              >
                Forgot password?
              </button>
            )}
            <Button type="submit" disabled={busy}>
              {busy ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
              <ArrowRight size={16} />
            </Button>
          </form>
          <p className="auth-mode-switch">
            {isLogin ? "New to Subtrack?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => onModeChange(isLogin ? "register" : "login")}
            >
              {isLogin ? "Create an account" : "Sign in"}
            </button>
          </p>
        </section>
        <p className="auth-privacy">
          Your account is securely managed by your connected backend.
        </p>
      </main>
    </div>
  );
}
