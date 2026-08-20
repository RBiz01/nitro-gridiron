import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
      <div className="w-full max-w-sm space-y-4">
        <Link to="/" className="text-sm text-muted">
          Back
        </Link>
        <h1 className="font-display text-3xl tracking-wide">Sign in</h1>
        <p className="text-sm text-muted">Save your coach name across sessions. Play still works as a guest.</p>
        {authEnabled ? (
          GROK_PROVIDERS.map((p) => (
            <button
              key={p.providerId}
              type="button"
              onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              className="min-h-12 w-full rounded-md border border-border bg-surface px-4 text-sm font-medium text-fg"
            >
              Continue with {p.label}
            </button>
          ))
        ) : (
          <p className="text-sm text-muted">Sign-in is disabled.</p>
        )}
      </div>
    </main>
  );
}
