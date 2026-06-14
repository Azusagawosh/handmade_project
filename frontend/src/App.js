import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import MyProductsPage from './MyProductsPage';
import AddProductPage from './AddProductPage';
import EditProductPage from './EditProductPage';
import ProductPage from './ProductPage';
import MyReviewsPage from './MyReviewsPage';
import AdminPanel from './AdminPanel';
import AdminFullPanel from './AdminFullPanel';
import ProfilePage from './ProfilePage';
import SellerReviewsPage from './SellerReviewsPage';
import ProductReviewPage from './ProductReviewPage';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">💎 Maison Crystal</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">🏠 Каталог</Link>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">👋 Привет, {user.username}</span>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-reviews">⭐ Мои отзывы</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">👤 Профиль</Link>
                </li>
                {user.role === 'seller' && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/my-products">📦 Мои товары</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/seller-reviews">📝 Отзывы на товары</Link>
                    </li>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin-full">👑 Полная админка</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin-panel">⚡ Быстрая админка</Link>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer">
                        🔧 Django Admin
                      </a>
                    </li>
                  </>
                )}
                <li className="nav-item">
                  <button className="btn btn-outline-light ms-2" onClick={handleLogout}>
                    🚪 Выйти
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">🔑 Вход</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">📝 Регистрация</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/products/').then(r => r.json()),
      fetch('http://127.0.0.1:8000/api/categories/').then(r => r.json())
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData);
      setCategories(categoriesData);
      setLoading(false);
    }).catch(error => {
      console.error('Ошибка:', error);
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category == selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <>
      <div className="hero-section text-center">
        <div className="container">
          <h1>💎 Maison Crystal</h1>
          <p>Уникальные изделия ручной работы от талантливых мастеров</p>
        </div>
      </div>
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Все категории</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="alert alert-info text-center">Товаров не найдено</div>
        ) : (
          <div className="row">
            {filteredProducts.map(product => (
              <div key={product.id} className="col-md-4 mb-4">
                <div className="card product-card">
                  <div className="card-img-top d-flex align-items-center justify-content-center" style={{ height: '200px', background: '#f0f0f0' }}>
                    {product.image_url ? (
                      <img src={`http://127.0.0.1:8000${product.image_url}`} alt={product.title} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '60px' }}>💎</span>
                    )}
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{product.title}</h5>
                    <p className="card-text text-muted">{product.description?.substring(0, 100)}...</p>
                    <div className="price">{product.price} ₽</div>
                    <div className="category">
                      <small>{product.category_name}</small>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <Link to={`/product/${product.id}`} className="btn btn-primary flex-grow-1">
                        🛒 Купить
                      </Link>
                      <Link to={`/review/${product.id}`} className="btn btn-outline-secondary">
                        📖 Обзор
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/review/:id" element={<ProductReviewPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/my-products" element={<MyProductsPage />} />
        <Route path="/add-product" element={<AddProductPage />} />
        <Route path="/edit-product/:id" element={<EditProductPage />} />
        <Route path="/my-reviews" element={<MyReviewsPage />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/admin-full" element={<AdminFullPanel />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/seller-reviews" element={<SellerReviewsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;