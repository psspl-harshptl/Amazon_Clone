import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Buyer pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import Addresses from './pages/Addresses';
import Wishlist from './pages/Wishlist';

// Seller pages
import SellerLogin from './pages/seller/SellerLogin';
import SellerRegister from './pages/seller/SellerRegister';
import SellerDashboard from './pages/seller/SellerDashboard';
import MyListings from './pages/seller/MyListings';
import CreateListing from './pages/seller/CreateListing';
import EditListing from './pages/seller/EditListing';
import SellerOrders from './pages/seller/SellerOrders';
import SellerFinancials from './pages/seller/SellerFinancials';
import SellerCommissionRates from './pages/seller/SellerCommissionRates';
import StorefrontSettings from './pages/seller/StorefrontSettings';
import LinkBankAccount from './pages/seller/LinkBankAccount';

// Public storefront
import Storefront from './pages/Storefront';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminSellers from './pages/admin/AdminSellers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminCommissionTiers from './pages/admin/AdminCommissionTiers';
import AdminBuyers from './pages/admin/AdminBuyers';
import AdminBuyerDetail from './pages/admin/AdminBuyerDetail';
import AdminSellerDetail from './pages/admin/AdminSellerDetail';

// Layout
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartDrawer from './components/cart/CartDrawer';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Redirects admin/seller away from buyer pages; guests are allowed
function BuyerRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === 'super_admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'seller') return <Navigate to="/seller/dashboard" replace />;
  return children;
}

// Requires login; also redirects admin/seller away
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'super_admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'seller') return <Navigate to="/seller/dashboard" replace />;
  return children;
}

function SellerRoute({ children, bypassBankCheck, bypassStorefrontCheck }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'seller') return <Navigate to="/seller/login" replace />;
  if (user.sellerStatus !== 'approved') return <Navigate to="/seller/login" replace />;

  const hasBankDetails = user.bankDetails && user.bankDetails.accountNumber;
  if (!hasBankDetails && !bypassBankCheck) {
    return <Navigate to="/seller/bank-details" replace />;
  }

  const hasStorefront = user.storeName;
  if (!hasStorefront && !bypassStorefrontCheck) {
    return <Navigate to="/seller/storefront" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'super_admin') return <Navigate to="/admin/login" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const isMinimalPage = ['/login', '/register', '/checkout'].includes(location.pathname);
  const isSellerPage = location.pathname.startsWith('/seller');
  const isAdminPage = location.pathname.startsWith('/admin');
  const hideBuyerChrome = isMinimalPage || isSellerPage || isAdminPage;

  return (
    <div className="flex flex-col min-h-screen relative">
      <ScrollToTop />
      {!hideBuyerChrome && <Navbar />}
      {!hideBuyerChrome && <CartDrawer />}
      <main className="flex-grow">
        <Routes>
          {/* Buyer — public catalog */}
          <Route path="/products"             element={<ProductList />} />
          <Route path="/products/:id"         element={<ProductDetail />} />
          <Route path="/login"                element={<Login />} />
          <Route path="/register"             element={<Register />} />
          <Route path="/stores/:sellerId"     element={<Storefront />} />

          {/* Buyer — buyer-only pages (admin/seller are redirected away) */}
          <Route path="/"                     element={<BuyerRoute><Home /></BuyerRoute>} />
          <Route path="/cart"                 element={<BuyerRoute><Cart /></BuyerRoute>} />
          <Route path="/checkout"             element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/orders"               element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
          <Route path="/orders/:id"           element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
          <Route path="/orders/:id/success"   element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
          <Route path="/profile"              element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/addresses"            element={<PrivateRoute><Addresses /></PrivateRoute>} />
          <Route path="/wishlist"             element={<PrivateRoute><Wishlist /></PrivateRoute>} />

          {/* Seller */}
          <Route path="/seller/login"         element={<SellerLogin />} />
          <Route path="/seller/register"      element={<SellerRegister />} />
          <Route path="/seller/dashboard"     element={<SellerRoute><SellerDashboard /></SellerRoute>} />
          <Route path="/seller/listings"      element={<SellerRoute><MyListings /></SellerRoute>} />
          <Route path="/seller/listings/new"  element={<SellerRoute><CreateListing /></SellerRoute>} />
          <Route path="/seller/listings/:id/edit" element={<SellerRoute><EditListing /></SellerRoute>} />
          <Route path="/seller/orders"        element={<SellerRoute><SellerOrders /></SellerRoute>} />
          <Route path="/seller/financials"    element={<SellerRoute><SellerFinancials /></SellerRoute>} />
          <Route path="/seller/commission"    element={<SellerRoute><SellerCommissionRates /></SellerRoute>} />
          <Route path="/seller/storefront"    element={<SellerRoute bypassStorefrontCheck><StorefrontSettings /></SellerRoute>} />
          <Route path="/seller/bank-details"  element={<SellerRoute bypassBankCheck bypassStorefrontCheck><LinkBankAccount /></SellerRoute>} />

          {/* Admin */}
          <Route path="/admin/login"          element={<AdminLogin />} />
          <Route path="/admin/dashboard"      element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products"       element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/sellers"        element={<AdminRoute><AdminSellers /></AdminRoute>} />
          <Route path="/admin/categories"     element={<AdminRoute><AdminCategories /></AdminRoute>} />
          <Route path="/admin/orders"         element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/payouts"        element={<AdminRoute><AdminPayouts /></AdminRoute>} />
          <Route path="/admin/commission"     element={<AdminRoute><AdminCommissionTiers /></AdminRoute>} />
          <Route path="/admin/buyers"         element={<AdminRoute><AdminBuyers /></AdminRoute>} />
          <Route path="/admin/buyers/:id"     element={<AdminRoute><AdminBuyerDetail /></AdminRoute>} />
          <Route path="/admin/sellers/:id"    element={<AdminRoute><AdminSellerDetail /></AdminRoute>} />

          <Route path="*"                     element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideBuyerChrome && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
