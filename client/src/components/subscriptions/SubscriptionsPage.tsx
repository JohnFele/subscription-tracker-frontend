import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  CATEGORIES,
  STATUSES,
  money,
  pretty,
  type Currency,
  type Subscription,
} from "../../lib/subscriptions";
import { Button } from "../subtrack/Button";
import { SubscriptionTable } from "./SubscriptionTable";

interface SubscriptionsPageProps {
  subscriptions: Subscription[];
  activeCount: number;
  currency: Currency;
  monthlyCommitment: number;
  otherCurrencyCount: number;
  onAdd: () => void;
  onOpen: (subscription: Subscription) => void;
  onEdit: (subscription: Subscription) => void;
  onCancel: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

export function SubscriptionsPage({
  subscriptions,
  activeCount,
  currency,
  monthlyCommitment,
  otherCurrencyCount,
  onAdd,
  onOpen,
  onEdit,
  onCancel,
  onDelete,
}: SubscriptionsPageProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sort, setSort] = useState("renewalDate");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredSubscriptions = useMemo(
    () =>
      subscriptions
        .filter(
          subscription =>
            subscription.name.toLowerCase().includes(search.toLowerCase()) ||
            subscription.category.includes(search.toLowerCase())
        )
        .filter(
          subscription =>
            statusFilter === "all" || subscription.status === statusFilter
        )
        .filter(
          subscription =>
            categoryFilter === "all" || subscription.category === categoryFilter
        )
        .sort((a, b) =>
          String(a[sort as keyof Subscription] ?? "").localeCompare(
            String(b[sort as keyof Subscription] ?? "")
          )
        ),
    [subscriptions, search, statusFilter, categoryFilter, sort]
  );

  const visibleSubscriptions = filteredSubscriptions.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const resetPage = () => setPage(1);

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR SERVICES</div>
          <h1>Subscriptions</h1>
          <p>Keep your recurring costs in one clear view.</p>
        </div>
        <Button onClick={onAdd}>
          <Plus size={17} /> Add subscription
        </Button>
      </div>
      <div className="mini-metrics">
        <div>
          <span>All subscriptions</span>
          <strong>{subscriptions.length}</strong>
        </div>
        <div>
          <span>Active</span>
          <strong>{activeCount}</strong>
        </div>
        <div>
          <span>
            Monthly estimate <small>{currency}</small>
          </span>
          <strong>{money(monthlyCommitment, currency)}</strong>
        </div>
        <div>
          <span>Other currencies tracked</span>
          <strong>{otherCurrencyCount}</strong>
        </div>
      </div>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search subscriptions..."
              value={search}
              onChange={event => {
                setSearch(event.target.value);
                resetPage();
              }}
            />
          </div>
          <div className="filter-group">
            <label>
              <Filter size={15} />
              <select
                value={statusFilter}
                onChange={event => {
                  setStatusFilter(event.target.value);
                  resetPage();
                }}
              >
                <option value="all">All statuses</option>
                {STATUSES.map(status => (
                  <option key={status} value={status}>
                    {pretty(status)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <SlidersHorizontal size={15} />
              <select
                value={categoryFilter}
                onChange={event => {
                  setCategoryFilter(event.target.value);
                  resetPage();
                }}
              >
                <option value="all">All categories</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {pretty(category)}
                  </option>
                ))}
              </select>
            </label>
            <label className="sort-select">
              <select
                value={sort}
                onChange={event => setSort(event.target.value)}
              >
                <option value="renewalDate">Renewal date</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="createdAt">Recently added</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
        </div>
        <SubscriptionTable
          records={visibleSubscriptions}
          onOpen={onOpen}
          onEdit={onEdit}
          onCancel={onCancel}
          onDelete={onDelete}
          showActions
        />
        <div className="pagination">
          <span>
            Showing{" "}
            <strong>
              {filteredSubscriptions.length ? (page - 1) * pageSize + 1 : 0}–
              {Math.min(page * pageSize, filteredSubscriptions.length)}
            </strong>{" "}
            of <strong>{filteredSubscriptions.length}</strong> subscriptions
          </span>
          <div>
            <button
              disabled={page <= 1}
              onClick={() => setPage(current => current - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="page-current">{page}</span>
            <button
              disabled={page * pageSize >= filteredSubscriptions.length}
              onClick={() => setPage(current => current + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
