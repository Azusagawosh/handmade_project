import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function MyProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Проверяем авторизацию и роль
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || user.role !== 'seller') {
      navigate('/');
      return;
    }

    // Загружаем товары продавца
    fetch('http://127.0.0.1:8000/api/my-products/', {
      headers: {
        'Authorization': `Token ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) throw new Error('Ошибка загрузки');
        return response.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [navigate]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Удалить товар?')) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      } else {
        alert('Ошибка удаления');
      }
    } catch (err) {
      alert('Ошибка соединения');
    }
  };

  if (loading) return <div className="text-center mt-5">Загрузка...</div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Мои товары</h1>
        <Link to="/add-product" className="btn btn-success">+ Добавить товар</Link>
      </div>

      {products.length === 0 ? (
        <div className="alert alert-info">
          У вас пока нет товаров. <Link to="/add-product">Добавьте первый товар</Link>
        </div>
      ) : (
        <div className="row">
          {products.map(product => (
            <div key={product.id} className="col-md-4 mb-4">
              <div className="card h-100">
                {/* Блок с фото товара */}
                <div className="card-img-top d-flex align-items-center justify-content-center" style={{ height: '200px', background: '#f0f0f0' }}>
                  {product.image_url ? (
                    <img src={`http://127.0.0.1:8000${product.image_url}`} alt={product.title} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '60px' }}>📦</span>
                  )}
                </div>
                <div className="card-body">
                  <h5 className="card-title">{product.title}</h5>
                  <p className="card-text">{product.description}</p>
                  <p className="card-text text-primary fw-bold">{product.price} ₽</p>
                  <p className="card-text">
                    <small className="text-muted">Категория: {product.category_name}</small>
                  </p>
                  <div className="d-flex gap-2">
                    <Link to={`/edit-product/${product.id}`} className="btn btn-warning btn-sm">
                      Редактировать
                    </Link>
                    <button onClick={() => handleDelete(product.id)} className="btn btn-danger btn-sm">
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyProductsPage;