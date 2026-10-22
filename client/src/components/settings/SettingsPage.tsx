import { type FormEvent } from "react";
import { LogOut, Users, X } from "lucide-react";
import { CURRENCIES, type Currency, type User } from "../../lib/subscriptions";
import { Button } from "../subtrack/Button";
import { Field } from "../subtrack/Field";

interface ProfileUpdate {
  name: string;
  email: string;
  password?: string;
  defaultCurrency: Currency;
}

interface SettingsPageProps {
  user: User;
  onUpdateProfile: (update: ProfileUpdate) => Promise<void>;
  onSignOut: () => void;
  onDeleteAccount: () => void;
}

export function SettingsPage({
  user,
  onUpdateProfile,
  onSignOut,
  onDeleteAccount,
}: SettingsPageProps) {
  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    await onUpdateProfile({
      name: String(form.get("name")),
      email: String(form.get("email")),
      defaultCurrency: String(form.get("defaultCurrency") ?? "ZAR") as Currency,
      ...(password ? { password } : {}),
    });
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PREFERENCES</div>
          <h1>Settings</h1>
          <p>Manage your account details and preferences.</p>
        </div>
      </div>
      <div className="settings-layout">
        <div className="settings-content">
          <section className="panel settings-panel">
            <div className="settings-title">
              <span className="settings-badge">
                <Users size={17} />
              </span>
              <div>
                <h2>Account and currency preferences</h2>
                <p>Update your profile and preferred display currency.</p>
              </div>
            </div>
            <form onSubmit={event => void submitProfile(event)}>
              <div className="settings-form-grid">
                <Field label="Full name">
                  <input name="name" defaultValue={user.name ?? ""} required />
                </Field>
                <Field label="Email address">
                  <input
                    name="email"
                    type="email"
                    defaultValue={user.email ?? ""}
                    required
                  />
                </Field>
                <Field label="New password">
                  <input
                    name="password"
                    type="password"
                    placeholder="Leave blank to keep current"
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="Default currency">
                  <select
                    name="defaultCurrency"
                    defaultValue={user.defaultCurrency ?? "ZAR"}
                  >
                    {CURRENCIES.map(currency => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="settings-note">
                <span>
                  Subscription amounts and totals are converted to this currency
                  using daily exchange rates.{" "}
                  <a
                    href="https://www.exchangerate-api.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Rates By Exchange Rate API
                  </a>
                </span>
              </div>
              <div className="settings-footer">
                <span>Changes are saved to your account.</span>
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </section>
          <section className="panel settings-panel">
            <div className="settings-title">
              <span className="settings-badge badge-amber">
                <LogOut size={17} />
              </span>
              <div>
                <h2>Session</h2>
                <p>Sign out of this workspace.</p>
              </div>
            </div>
            <div className="api-connection-row">
              <div>
                <strong>Signed in</strong>
                <p>{user.email}</p>
              </div>
              <Button kind="light" onClick={onSignOut}>
                <LogOut size={15} /> Sign out
              </Button>
            </div>
          </section>
          {user.role !== "admin" && (
            <section className="panel settings-panel danger-zone">
              <div className="settings-title">
                <span className="settings-badge badge-amber">
                  <X size={17} />
                </span>
                <div>
                  <h2>Delete account</h2>
                  <p>Permanently remove your account from this backend.</p>
                </div>
              </div>
              <div className="api-connection-row">
                <div>
                  <strong>This cannot be undone</strong>
                  <p>
                    Your backend may also retain related subscription records.
                  </p>
                </div>
                <Button kind="danger" onClick={onDeleteAccount}>
                  Delete account
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
