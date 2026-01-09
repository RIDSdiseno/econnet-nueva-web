import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import QuotePage from './pages/QuotePage';
import MyQuotesPage from './pages/MyQuotesPage';
import QuoteDetailPage from './pages/QuoteDetailPage';
import LoginPage from './pages/LoginPage';
import MercadoPagoReturnPage from './pages/MercadoPagoReturnPage';
import TransbankReturnPage from './pages/TransbankReturnPage';
import StripeReturnPage from './pages/StripeReturnPage';
import NosotrosPage from './pages/NosotrosPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { QuoteHistoryProvider } from './context/QuoteHistoryContext';
import './App.css';

const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="app-shell flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div key={location.pathname} className="page-transition">
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/nosotros" element={<NosotrosPage />} />
            <Route path="/cotizar" element={<QuotePage />} />
            <Route path="/mis-cotizaciones" element={<MyQuotesPage />} />
            <Route path="/mis-cotizaciones/:id" element={<QuoteDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/pago/mercadopago" element={<MercadoPagoReturnPage />} />
            <Route path="/pago/mercadopago/:resultado" element={<MercadoPagoReturnPage />} />
            <Route path="/pago/transbank" element={<TransbankReturnPage />} />
            <Route path="/pago/stripe/:resultado" element={<StripeReturnPage />} />
            {/* Add other routes here later */}
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <QuoteHistoryProvider>
        <CartProvider>
          <Router>
            <AppLayout />
          </Router>
        </CartProvider>
      </QuoteHistoryProvider>
    </AuthProvider>
  );
}

export default App;
  
