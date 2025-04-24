import { useState } from 'react';
import { createSubscription } from '../services/api';

const initialForm = {
  name: '',
  price: '',
  currency: 'USD',
  frequency: 'monthly',
  category: 'entertainment',
  paymentMethod: '',
  startDate: '',
};

export default function SubscriptionForm() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await createSubscription(formData);
      setMessage('Subscription created successfully!');
      setFormData(initialForm);
    } catch (err) {
      setMessage('Error creating subscription.', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Add Subscription</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Subscription Name" required className="w-full border rounded p-2" />
        <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price" required className="w-full border rounded p-2" />
        
        <select name="currency" value={formData.currency} onChange={handleChange} className="w-full border rounded p-2">
          {['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY'].map(curr => (
            <option key={curr} value={curr}>{curr}</option>
          ))}
        </select>

        <select name="frequency" value={formData.frequency} onChange={handleChange} className="w-full border rounded p-2">
          {['daily', 'weekly', 'monthly', 'yearly', 'other'].map(freq => (
            <option key={freq} value={freq}>{freq}</option>
          ))}
        </select>

        <select name="category" value={formData.category} onChange={handleChange} className="w-full border rounded p-2">
          {['entertainment', 'sports', 'news', 'food', 'health', 'fitness', 'education', 'technology', 'travel', 'other'].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} placeholder="Payment Method" required className="w-full border rounded p-2" />
        
        <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required className="w-full border rounded p-2" />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Saving...' : 'Save Subscription'}
        </button>
        {message && <p className="text-center text-sm text-gray-600 mt-2">{message}</p>}
      </form>
    </div>
  );
}
