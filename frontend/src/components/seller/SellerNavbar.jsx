import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SellerNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/seller/login');
  };

  return (
    <header className="bg-[#131921] text-white">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/seller/dashboard" className="flex items-center gap-2">
          <span className="text-[#FF9900] font-extrabold text-xl tracking-tight">amazon</span>
          <span className="text-xs text-gray-300 border-l border-gray-600 pl-2 ml-1">Seller Central</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/seller/dashboard" className="hover:text-[#FF9900] transition-colors">Dashboard</Link>
          <Link to="/seller/listings" className="hover:text-[#FF9900] transition-colors">My Listings</Link>
          <Link to="/seller/orders" className="hover:text-[#FF9900] transition-colors">Orders</Link>
          <Link to="/seller/financials" className="hover:text-[#FF9900] transition-colors">Payments</Link>
          <Link to="/seller/storefront" className="hover:text-[#FF9900] transition-colors">Storefront Settings</Link>
          <span className="text-gray-400 text-xs">{user?.name}</span>
          <button onClick={handleLogout} className="text-gray-300 hover:text-white transition-colors">Logout</button>
        </nav>
      </div>
    </header>
  );
}
