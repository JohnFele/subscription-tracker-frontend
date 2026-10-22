import { useState, type FormEvent } from "react";
import { Activity, CreditCard, Plus, Settings2, Users, X } from "lucide-react";
import { api } from "../../lib/api";
import { type Subscription, type User } from "../../lib/subscriptions";
import { toast } from "sonner";
import { Button } from "../subtrack/Button";
import { Field } from "../subtrack/Field";
import { SubscriptionTable } from "../subscriptions/SubscriptionTable";

interface AdminPageProps {
  currentUser: User | null;
}

export function AdminPage({ currentUser }: AdminPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetSubscriptions, setTargetSubscriptions] = useState<
    Subscription[]
  >([]);
  const [editor, setEditor] = useState<User | null | false>(false);

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await api.users());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load users"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (user: User) => {
    if (
      String(user.id ?? user._id) ===
      String(currentUser?.id ?? currentUser?._id)
    ) {
      toast.error("You cannot delete your own account from administration.");
      return;
    }
    if (!window.confirm(`Delete ${user.name}'s account?`)) return;
    try {
      await api.removeUser(String(user.id ?? user._id));
      setUsers(current => current.filter(item => item !== user));
      if (selectedUser === user) {
        setSelectedUser(null);
        setTargetSubscriptions([]);
      }
      toast.success("User deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete user"
      );
    }
  };

  const selectUser = async (user: User) => {
    setSelectedUser(user);
    try {
      const result = await api.subscriptions(1, 100, user.id ?? user._id);
      setTargetSubscriptions(result.records);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load this user's subscriptions"
      );
    }
  };

  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const password = String(form.get("password") ?? "");
    const role = String(form.get("role"));

    try {
      if (editor) {
        const id = String(editor.id ?? editor._id);
        await api.updateUser(id, {
          name,
          email,
          role,
          ...(password ? { password } : {}),
        });
        if (String(selectedUser?.id ?? selectedUser?._id) === id)
          setSelectedUser({
            ...selectedUser!,
            name,
            email,
            role: role as User["role"],
          });
      } else {
        if (!password)
          throw new Error("A password is required for a new account.");
        await api.createUser({ name, email, password, role });
      }
      await load();
      setEditor(false);
      toast.success(editor ? "User updated" : "User account created");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save user"
      );
    }
  };

  const cancelSubscription = async (subscription: Subscription) => {
    if (
      !selectedUser ||
      !window.confirm(`Cancel ${subscription.name} for ${selectedUser.name}?`)
    )
      return;
    try {
      await api.cancel(subscription._id);
      await selectUser(selectedUser);
      toast.success("Subscription cancelled");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel");
    }
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">WORKSPACE CONTROLS</div>
          <h1>Administration</h1>
          <p>Manage user accounts and subscription records.</p>
        </div>
        <Button kind="light" onClick={() => void load()}>
          <Activity size={16} />
          {loading ? "Loading…" : "Refresh users"}
        </Button>
      </div>
      <div className="admin-layout">
        <section className="panel admin-users">
          <div className="panel-heading">
            <div>
              <h2>User directory</h2>
              <p>{users.length} accounts</p>
            </div>
            <div className="admin-tools">
              <Button kind="light" onClick={() => void load()}>
                <Users size={15} /> Load users
              </Button>
              <Button onClick={() => setEditor(null)}>
                <Plus size={14} /> Add user
              </Button>
            </div>
          </div>
          {editor !== false && (
            <form className="admin-editor" onSubmit={saveUser}>
              <strong>{editor ? "Edit account" : "Create account"}</strong>
              <Field label="Name">
                <input name="name" defaultValue={editor?.name ?? ""} required />
              </Field>
              <Field label="Email">
                <input
                  name="email"
                  type="email"
                  defaultValue={editor?.email ?? ""}
                  required
                />
              </Field>
              <Field
                label={
                  editor ? "New password (optional)" : "Temporary password"
                }
              >
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  required={!editor}
                />
              </Field>
              <Field label="Role">
                <select name="role" defaultValue={editor?.role ?? "user"}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <div className="admin-editor-actions">
                <Button kind="light" onClick={() => setEditor(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editor ? "Save user" : "Create user"}
                </Button>
              </div>
            </form>
          )}
          {users.length === 0 ? (
            <div className="empty-state">
              <Users />
              <strong>No user data loaded</strong>
              <span>Load accounts from the admin-only user endpoint.</span>
            </div>
          ) : (
            users.map(user => (
              <div
                className={`admin-user-row ${selectedUser === user ? "selected-user" : ""}`}
                key={user.id ?? user._id}
              >
                <button
                  className="admin-user-select"
                  onClick={() => void selectUser(user)}
                >
                  <span className="avatar">
                    {user.name
                      .split(" ")
                      .map(part => part[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </span>
                  <span className={`role-chip ${user.role}`}>
                    {user.role ?? "user"}
                  </span>
                </button>
                <button
                  className="admin-edit"
                  title="Edit user"
                  onClick={() => setEditor(user)}
                >
                  <Settings2 size={14} />
                </button>
                <button
                  className="admin-delete"
                  title="Delete user"
                  disabled={
                    String(user.id ?? user._id) ===
                    String(currentUser?.id ?? currentUser?._id)
                  }
                  onClick={() => void deleteUser(user)}
                >
                  <X size={15} />
                </button>
              </div>
            ))
          )}
        </section>
        <section className="panel admin-user-subs">
          <div className="panel-heading">
            <div>
              <h2>
                {selectedUser
                  ? `${selectedUser.name}’s subscriptions`
                  : "User subscriptions"}
              </h2>
              <p>
                {selectedUser
                  ? `${targetSubscriptions.length} subscription records`
                  : "Select a user to view their records"}
              </p>
            </div>
          </div>
          {selectedUser ? (
            <SubscriptionTable
              records={targetSubscriptions}
              onOpen={() => undefined}
              onEdit={() => undefined}
              onCancel={cancelSubscription}
              showActions
            />
          ) : (
            <div className="empty-state">
              <CreditCard />
              <strong>Choose a user</strong>
              <span>Their subscriptions will appear here.</span>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
