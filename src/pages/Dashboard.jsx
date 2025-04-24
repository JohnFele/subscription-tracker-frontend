import { useEffect, useState } from 'react';
import { getUserSubscriptions } from '../services/api';
import SubscriptionCard from '../components/SubscriptionCard';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    if (user) {
      getUserSubscriptions(user._id).then(setSubscriptions);
    }
  }, [user]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">My Subscriptions</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subscriptions.length ? (
          subscriptions.map(sub => (
            <SubscriptionCard key={sub._id} subscription={sub} />
          ))
        ) : (
          <p className="text-gray-600">No subscriptions found.</p>
        )}
      </div>
    </div>
  );
}
