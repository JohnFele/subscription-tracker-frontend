export default function SubscriptionCard({ subscription }) {
  return (
    <div className="border p-4 rounded shadow hover:shadow-md transition">
      <h3 className="text-lg font-semibold">{subscription.name}</h3>
      <p className="text-sm text-gray-500">
        {subscription.category} • {subscription.frequency}
      </p>
      <p className="text-md font-medium mt-2">
        {subscription.price} {subscription.currency}
      </p>
      <p className="text-sm text-gray-600">Status: {subscription.status}</p>
    </div>
  );
}
