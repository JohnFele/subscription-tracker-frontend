import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">SubTrack</Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">Dashboard</Link>
              <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/sign-in" className="text-gray-700 hover:text-indigo-600">Sign In</Link>
              <Link to="/sign-up" className="text-indigo-600 font-semibold hover:underline">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
