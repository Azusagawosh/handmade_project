import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Проверка что пользователь админ
    if (!token || user.role !== 'admin') {
      setError('Доступ запрещен. Только для администраторов.');
      setLoading(false);
      return;
    }

    // Загрузка данных
    Promise.all([
      fetch('http://127.0.0.1:8000/api/users/', {
        headers: { 'Authorization': `Token ${token}` }
      }).then(r => {
        if (!r.ok) throw new Error('Ошибка загрузки пользователей');
        return r.json();
      }),
      fetch('http://127.0.0.1:8000/api/products/').then(r => r.json()),
      fetch('http://127.0.0.1:8000/api/reviews/all/', {
        headers: { 'Authorization': `Token ${token}` }
      }).then(r => {
        if (!r.ok) throw new Error('Ошибка загрузки отзывов');
        return r.json();
      })
    ]).then(([usersData, productsData, reviewsData]) => {
      setUsers(usersData);
      setProducts(productsData);
      setReviews(reviewsData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError(err.message);
      setLoading(false);
    });
  }, [token, user.role]);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/products/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
        alert('Товар удален');
      }
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Удалить отзыв?')) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/reviews/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== id));
        alert('Отзыв удален');
      }
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'user' ? 'seller' : 'user';
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/change-role/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        alert('Роль изменена');
      }
    } catch (err) {
      alert('Ошибка при изменении роли');
    }
  };

  if (error) {
    return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;
  }

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">👑 Админ панель</h1>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            👥 Пользователи ({users.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            📦 Товары ({products.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            ⭐ Отзывы ({reviews.length})
          </button>
        </li>
      </ul>

      {activeTab === 'users' && (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr><th>ID</th><th>Username</th><th>Email</th><th>Роль</th><th>Действия</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email || '-'}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'bg-danger' : u.role === 'seller' ? 'bg-success' : 'bg-secondary'}`}>
                      {u.role === 'admin' ? 'Админ' : u.role === 'seller' ? 'Продавец' : 'Пользователь'}
                    </span>
                   </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button className="btn btn-sm btn-warning" onClick={() => handleToggleRole(u.id, u.role)}>
                        Сделать {u.role === 'user' ? 'продавцом' : 'пользователем'}
                      </button>
                    )}
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="row">
          {products.map(product => (
            <div key={product.id} className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h6>{product.title}</h6>
                  <small>Продавец: {product.seller_name}</small><br />
                  <small>Цена: {product.price} ₽</small><br />
                  <small>Категория: {product.category_name}</small>
                  <button className="btn btn-sm btn-danger mt-2 w-100" onClick={() => handleDeleteProduct(product.id)}>
                    🗑️ Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="list-group">
          {reviews.map(review => (
            <div key={review.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <strong>{review.user_name}</strong> на товар <strong>{review.product_title || `ID: ${review.product}`}</strong>
                  <div className="text-warning">{"⭐".repeat(review.rating)}</div>
                  <p className="mb-0 mt-2">{review.text}</p>
                  <small className="text-muted">{new Date(review.created_at).toLocaleDateString()}</small>
                </div>
                <button className="btn btn-sm btn-danger ms-3" onClick={() => handleDeleteReview(review.id)}>
                  🗑️ Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;