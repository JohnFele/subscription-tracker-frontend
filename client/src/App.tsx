import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { api } from "./lib/api";
import { useConnectionStatus } from "./hooks/useConnectionStatus";
import { useExpenditureData } from "./hooks/useExpenditureData";
import { useSubscriptionMetrics } from "./hooks/useSubscriptionMetrics";
import { useSubscriptions } from "./hooks/useSubscriptions";
import { useSubscriptionPayments } from "./hooks/useSubscriptionPayments";
import { useUserSession } from "./hooks/useUserSession";
import type { ExpenseDraft } from "./lib/types/expenditure";
import type {
  Subscription,
  SubscriptionDraft,
} from "./lib/types/subscriptions";
import { emptyDraft, toSubscriptionDraft } from "./lib/utils/subscriptionDraft";
import { dateInputValue } from "./lib/utils/dates";
import { PAYMENT_METHODS } from "./lib/constants/paymentMethods";
import type { Page } from "./lib/types/navigation";
import type { Period } from "./lib/types/period";
import type { OverviewCategorySort } from "./lib/types/overview";
import { Toaster } from "sonner";
import { AuthPage } from "./components/auth/AuthPage";
import { AdminPage } from "./components/admin/AdminPage";
import { OverviewPage } from "./components/dashboard/OverviewPage";
import { ExpenditurePage } from "./components/expenditure/ExpenditurePage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { SubscriptionDetails } from "./components/subscriptions/SubscriptionDetails";
import { SubscriptionsPage } from "./components/subscriptions/SubscriptionsPage";
import { UpcomingRenewalsPage } from "./components/renewals/UpcomingRenewalsPage";
import { SubscriptionEditorModal } from "./components/subscriptions/SubscriptionEditorModal";
import { SubscriptionPaymentModal } from "./components/subscriptions/SubscriptionPaymentModal";

const navItems: { label: Page; icon: LucideIcon; admin?: boolean }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Subscriptions", icon: WalletCards },
  { label: "Upcoming renewals", icon: CalendarDays },
  { label: "Expenditure", icon: Activity },
  { label: "Settings", icon: Settings2 },
  { label: "Administration", icon: ShieldCheck, admin: true },
];
export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    localStorage.getItem("subtrack-theme") === "dark" ? "dark" : "light"
  );
  const [page, setPage] = useState<Page>("Overview");
  const connection = useConnectionStatus();
  const [modal, setModal] = useState<
    "add" | "edit" | "details" | "expense" | null
  >(null);
  const [selected, setSelected] = useState<Subscription | null>(null);
  const [draft, setDraft] = useState<SubscriptionDraft>(() => emptyDraft());
  const [showAllOverviewCategories, setShowAllOverviewCategories] =
    useState(false);
  const [overviewCategorySort, setOverviewCategorySort] =
    useState<OverviewCategorySort>("amount-desc");
  const [otherPaymentMethod, setOtherPaymentMethod] = useState(false);
  const [expenseDraft, setExpenseDraft] = useState<ExpenseDraft>(() => ({
    name: "",
    amount: 0,
    currency: "ZAR",
    category: "other",
    date: dateInputValue(new Date()),
  }));
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [operationBusy, setOperationBusy] = useState(false);
  const [period, setPeriod] = useState<Period>("This month");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleSessionEnd = useCallback(() => {
    setModal(null);
    setSelected(null);
    setPage("Overview");
  }, []);
  const {
    user,
    busy: authBusy,
    signInOrRegister,
    signOut,
    updateProfile,
    deleteAccount,
    clearSession,
  } = useUserSession({ onSessionEnd: handleSessionEnd });
  const defaultCurrency = user?.defaultCurrency ?? "ZAR";
  const {
    summary: expenditure,
    periodRecords: periodExpenses,
    monthly: periodMonthly,
    periodSpend,
    refreshSummary: refreshExpenditure,
  } = useExpenditureData({
    user,
    period,
    currency: defaultCurrency,
    onUnauthorized: clearSession,
  });
  const {
    subscriptions: items,
    loading,
    refresh,
    save: saveSubscriptionData,
    cancel: cancelSubscription,
    remove: removeSubscription,
  } = useSubscriptions({
    user,
    onUnauthorized: clearSession,
    refreshExpenditure,
  });
  const { recordPayment } = useSubscriptionPayments({
    refreshSubscriptions: refresh,
    refreshExpenditure,
  });
  const metrics = useSubscriptionMetrics(
    items,
    defaultCurrency,
    overviewCategorySort,
    showAllOverviewCategories
  );
  const {
    activeSubscriptions: active,
    monthlyCommitment,
    conversionIncomplete,
    staleExchangeRates,
    otherCurrencyCount: distinctOtherCurrencies,
    upcomingRenewals: nextRenewals,
    overviewRows,
  } = metrics;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("subtrack-theme", theme);
  }, [theme]);

  useEffect(() => {
    setShowAllOverviewCategories(false);
    setOverviewCategorySort("amount-desc");
  }, [user]);
  const userName = user?.name || "Your account";
  const initial = userName
    .split(" ")
    .map(p => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const openAdd = () => {
    setSelected(null);
    setDraft(emptyDraft(defaultCurrency));
    setOtherPaymentMethod(false);
    setModal("add");
  };
  const openEdit = (s: Subscription) => {
    setSelected(s);
    setDraft(toSubscriptionDraft(s));
    setOtherPaymentMethod(
      Boolean(s.paymentMethod && !PAYMENT_METHODS.includes(s.paymentMethod))
    );
    setModal("edit");
  };
  const openExpense = (subscription: Subscription) => {
    setExpenseDraft({
      name: subscription.name,
      amount: subscription.price,
      currency: subscription.currency,
      category: subscription.category,
      date: dateInputValue(new Date()),
      subscriptionId: subscription._id,
      advanceRenewal: subscription.recurring !== false,
    });
    setModal("expense");
  };
  const saveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationBusy(true);
    try {
      if (await recordPayment(expenseDraft)) setModal(null);
    } finally {
      setOperationBusy(false);
    }
  };
  const saveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationBusy(true);
    try {
      if (await saveSubscriptionData(draft, selected)) setModal(null);
    } finally {
      setOperationBusy(false);
    }
  };
  const cancelItem = async (s: Subscription) => {
    if (!window.confirm(`Cancel ${s.name}? This will update its status.`))
      return;
    await cancelSubscription(s);
  };
  const deleteItem = async (s: Subscription) => {
    if (!window.confirm(`Permanently delete ${s.name}? This can't be undone.`))
      return;
    if (await removeSubscription(s)) setModal(null);
  };
  const openDetail = async (s: Subscription) => {
    try {
      setSelected(await api.subscription(s._id));
    } catch {
      setSelected(s);
    }
    setModal("details");
  };

  if (!user)
    return (
      <AuthPage
        theme={theme}
        onToggleTheme={() =>
          setTheme(value => (value === "dark" ? "light" : "dark"))
        }
        mode={authMode}
        onModeChange={setAuthMode}
        onSubmit={event => void signInOrRegister(event, authMode)}
        busy={authBusy}
      />
    );

  return (
    <div className="app-shell">
      <Toaster position="top-right" richColors theme={theme} />
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <span />
            <span />
          </div>
          <span>subtrack</span>
          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list">
          {navItems
            .filter(n => !n.admin || user?.role === "admin")
            .map(({ label, icon: Icon }) => (
              <button
                key={label}
                className={`nav-item ${page === label ? "nav-active" : ""}`}
                onClick={() => {
                  setPage(label);
                  setSidebarOpen(false);
                }}
              >
                {<Icon size={18} />}
                <span>{label}</span>
                {label === "Upcoming renewals" && nextRenewals.length > 0 && (
                  <span className="nav-count">{nextRenewals.length}</span>
                )}
              </button>
            ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="help-card">
          <div className="help-icon">
            <Sparkles size={15} />
          </div>
          <strong>Small costs add up.</strong>
          <p>Stay one step ahead of your subscriptions.</p>
          <button onClick={() => setPage("Upcoming renewals")}>
            View upcoming <ArrowRight size={13} />
          </button>
          <div className="help-decoration" />
        </div>
        <button className="profile-button" onClick={() => setPage("Settings")}>
          <span className="avatar">{initial}</span>
          <span className="profile-info">
            <strong>{userName}</strong>
            <small>{user?.email}</small>
          </span>
        </button>
        <button className="sidebar-signout" onClick={() => void signOut()}>
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </aside>
      {sidebarOpen && (
        <button
          aria-label="Close menu"
          className="mobile-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <button
              className="icon-button theme-toggle"
              type="button"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              onClick={() =>
                setTheme(value => (value === "dark" ? "light" : "dark"))
              }
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div
              className={`mode-pill connection-pill connection-${connection.state}`}
              role="status"
              aria-live="polite"
              title={
                connection.latency === null
                  ? "API connectivity status"
                  : `API response in ${connection.latency} ms`
              }
            >
              <i />
              {connection.state === "good"
                ? "Connected"
                : connection.state === "checking"
                  ? "Checking…"
                  : connection.state === "slow"
                    ? "Slow"
                    : connection.state === "poor"
                      ? "Poor connection"
                      : connection.state === "offline"
                        ? "Offline"
                        : "Unavailable"}
              {connection.latency !== null && (
                <small>{connection.latency} ms</small>
              )}
            </div>
            <button
              className="icon-button notification"
              aria-label="Upcoming renewals"
              onClick={() => setPage("Upcoming renewals")}
            >
              <Bell size={18} />
              <i />
            </button>
            <button className="top-avatar" onClick={() => setPage("Settings")}>
              {initial}
            </button>
          </div>
        </header>
        <div className="page-content">
          {page === "Overview" && (
            <OverviewPage
              userName={userName}
              period={period}
              defaultCurrency={defaultCurrency}
              periodSpend={periodSpend}
              periodExpenses={periodExpenses}
              periodMonthly={periodMonthly}
              subscriptions={items}
              activeCount={active.length}
              monthlyCommitment={monthlyCommitment}
              nextRenewals={nextRenewals}
              conversionIncomplete={conversionIncomplete}
              staleExchangeRates={staleExchangeRates}
              overviewRows={overviewRows}
              overviewCategorySort={overviewCategorySort}
              showAllOverviewCategories={showAllOverviewCategories}
              onSortChange={setOverviewCategorySort}
              onToggleAllCategories={() =>
                setShowAllOverviewCategories(value => !value)
              }
              onPeriodChange={setPeriod}
              onAddSubscription={openAdd}
              onNavigate={setPage}
              onOpenSubscription={openDetail}
              onEditSubscription={openEdit}
              onCancelSubscription={cancelItem}
            />
          )}
          {page === "Expenditure" && (
            <ExpenditurePage
              expenditure={expenditure}
              currency={defaultCurrency}
              period={period}
              onPeriodChange={setPeriod}
              records={periodExpenses}
              monthly={periodMonthly}
            />
          )}
          {page === "Subscriptions" && (
            <SubscriptionsPage
              subscriptions={items}
              activeCount={active.length}
              currency={defaultCurrency}
              monthlyCommitment={monthlyCommitment}
              otherCurrencyCount={distinctOtherCurrencies}
              onAdd={openAdd}
              onOpen={openDetail}
              onEdit={openEdit}
              onCancel={cancelItem}
              onDelete={deleteItem}
            />
          )}
          {page === "Upcoming renewals" && (
            <UpcomingRenewalsPage
              subscriptions={nextRenewals}
              currency={defaultCurrency}
              onOpenSubscription={openDetail}
              onNavigate={setPage}
            />
          )}
          {page === "Settings" && (
            <SettingsPage
              user={user}
              onUpdateProfile={updateProfile}
              onSignOut={() => void signOut()}
              onDeleteAccount={deleteAccount}
            />
          )}
          {page === "Administration" && <AdminPage currentUser={user} />}
          {loading && (
            <div className="loading-pill">
              <span />
              Syncing with your backend…
            </div>
          )}
        </div>
        <footer className="app-footer">
          <span>
            Subtrack <i>·</i> A little clarity for your recurring costs.
          </span>
          <span>
            Subscription records, all in one place <Sparkles size={12} />
          </span>
        </footer>
      </main>
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            className={`modal ${modal === "details" ? "detail-modal" : ""}`}
            role="dialog"
            aria-modal="true"
          >
            <button className="modal-close" onClick={() => setModal(null)}>
              <X size={19} />
            </button>
            {(modal === "add" || modal === "edit") && (
              <SubscriptionEditorModal
                mode={modal}
                draft={draft}
                otherPaymentMethod={otherPaymentMethod}
                busy={operationBusy}
                onDraftChange={setDraft}
                onPaymentMethodChange={setOtherPaymentMethod}
                onSubmit={saveSubscription}
                onCancel={() => setModal(null)}
              />
            )}
            {modal === "expense" && (
              <SubscriptionPaymentModal
                draft={expenseDraft}
                busy={operationBusy}
                onDraftChange={setExpenseDraft}
                onSubmit={saveExpense}
                onCancel={() => setModal("details")}
              />
            )}
            {modal === "details" && selected && (
              <SubscriptionDetails
                subscription={selected}
                onClose={() => setModal(null)}
                onRecordPayment={() => openExpense(selected)}
                onEdit={() => openEdit(selected)}
                onCancel={() => {
                  void cancelItem(selected);
                  setModal(null);
                }}
                onDelete={() => void deleteItem(selected)}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
