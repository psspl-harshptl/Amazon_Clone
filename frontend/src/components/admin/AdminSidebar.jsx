import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '▤' },
  { to: '/admin/products',  label: 'Products',  icon: '📦' },
  { to: '/admin/sellers',   label: 'Sellers',   icon: '🏪' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="w-56 min-h-screen bg-[#232F3E] text-white flex flex-col flex-shrink-0">
      <div className="px-5 py-4 border-b border-[#374151]">
        <div className="text-[#FF9900] font-extrabold text-lg">amazon</div>
        <div className="text-[11px] text-gray-400 mt-0.5">Admin Console</div>
      </div>

      <nav className="flex-grow py-4 space-y-1 px-3">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-[#FF9900] text-black font-semibold' : 'text-gray-300 hover:bg-[#374151]'
              }`
            }
          >
            <span>{icon}</span>{label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-[#374151]">
        <p className="text-xs text-gray-400 mb-2 truncate">{user?.name}</p>
        <button onClick={handleLogout} className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors">
          Logout
        </button>
      </div>
    </aside>
  );
}
