import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
// import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/register"      element={<Register />} />
            <Route path="/products"      element={<ProductList />} />
            <Route path="/products/:id"  element={<ProductDetail />} />
            <Route path="/cart"          element={<Cart />} />
            <Route path="/checkout"      element={<Checkout />} />
            <Route path="/orders"        element={<OrderHistory />} />
            <Route path="/orders/:id"         element={<OrderDetail />} />
            <Route path="/orders/:id/success" element={<OrderSuccess />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
