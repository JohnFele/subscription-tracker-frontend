import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 text-center px-4">
      <h1 className="text-4xl font-bold text-blue-800 mb-4">Subscription Tracker</h1>
      <p className="text-lg text-gray-700 mb-6">Track and manage your subscriptions with ease.</p>
      <div className="flex gap-4">
        <Link to="/sign-in" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Sign In</Link>
        <Link to="/sign-up" className="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded hover:bg-blue-50">Sign Up</Link>
      </div>
    </div>
  );
};

export default LandingPage;
