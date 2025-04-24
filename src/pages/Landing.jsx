import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4">Track Your Subscriptions Easily</h1>
        <p className="text-gray-700 mb-6">
          Never forget a renewal or cancellation again. Manage all your subscriptions in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/sign-up" className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700">
            Get Started
          </Link>
          <Link to="/sign-in" className="bg-white border border-indigo-600 text-indigo-600 px-6 py-2 rounded hover:bg-indigo-50">
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
