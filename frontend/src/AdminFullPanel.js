import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaUserCog, FaBox, FaStar } from 'react-icons/fa';

function AdminFullPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [showAddCategory, setShowAddCategory] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Проверка прав администратора
  useEffect(() => {
    if (!token || user.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    loadData();
  }, [token, user.role]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, productsRes, categoriesRes, reviewsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/users/', {
          headers: { 'Authorization': `Token ${token}` }
        }).then(r => r.json()),
        fetch('http://127.0.0.1:8000/api/products/').then(r => r.json()),
        fetch('http://127.0.0.1:8000/api/categories/').then(r => r.json()),
        fetch('http://127.0.0.1:8000/api/reviews/all/', {
          headers: { 'Authorization': `Token ${token}` }
        }).then(r => r.json())
      ]);
      setUsers(usersRes);
      setProducts(productsRes);
      setCategories(categoriesRes);
      setReviews(reviewsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ========== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ==========
  const handleUserRoleChange = async (userId, newRole) => {
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
        await loadData();
        alert('Роль пользователя изменена');
      }
    } catch (err) {
      alert('Ошибка при изменении роли');
    }
  };

  const handleUserEdit = async (userId, userData) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(userData)
      });
      if (response.ok) {
        await loadData();
        setEditingUser(null);
        alert('Пользователь обновлен');
      }
    } catch (err) {
      alert('Ошибка при обновлении');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Удалить пользователя? Все его товары и отзывы тоже будут удалены!')) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        await loadData();
        alert('Пользователь удален');
      }
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  // ========== УПРАВЛЕНИЕ ТОВАРАМИ ==========
  const handleProductEdit = async (productId, productData) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(productData)
      });
      if (response.ok) {
        await loadData();
        setEditingProduct(null);
        alert('Товар обновлен');
      }
    } catch (err) {
      alert('Ошибка при обновлении');
    }
  };

  const handleProductDelete = async (productId) => {
    if (!window.confirm('Удалить товар?')) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        await loadData();
        alert('Товар удален');
      }
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  // ========== УПРАВЛЕНИЕ КАТЕГОРИЯМИ ==========
  const handleAddCategory = async () => {
    if (!newCategory.name) {
      alert('Введите название категории');
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/api/categories/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(newCategory)
      });
      if (response.ok) {
        await loadData();
        setNewCategory({ name: '', description: '' });
        setShowAddCategory(false);
        alert('Категория добавлена');
      }
    } catch (err) {
      alert('Ошибка при добавлении');
    }
  };

  const handleCategoryEdit = async (categoryId, categoryData) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/categories/${categoryId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(categoryData)
      });
      if (response.ok) {
        await loadData();
        setEditingCategory(null);
        alert('Категория обновлена');
      }
    } catch (err) {
      alert('Ошибка при обновлении');
    }
  };

  const handleCategoryDelete = async (categoryId) => {
    if (!window.confirm('Удалить категорию? Все товары в ней тоже будут удалены!')) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/categories/${categoryId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        await loadData();
        alert('Категория удалена');
      }
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  // ========== УПРАВЛЕНИЕ ОТЗЫВАМИ ==========
  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Удалить отзыв?')) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/reviews/${reviewId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        await loadData();
        alert('Отзыв удален');
      }
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">👑 Полная Админ-панель</h1>
      <p className="text-muted mb-4">Управление пользователями, товарами, категориями и отзывами</p>

      {/* Вкладки */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <FaUserCog /> Пользователи ({users.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <FaBox /> Товары ({products.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            📁 Категории ({categories.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            <FaStar /> Отзывы ({reviews.length})
          </button>
        </li>
      </ul>

      {/* ========== ПОЛЬЗОВАТЕЛИ ========== */}
      {activeTab === 'users' && (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr><th>ID</th><th>Логин</th><th>Email</th><th>Имя</th><th>Роль</th><th>Действия</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email || '-'}</td>
                  <td>{u.full_name || '-'}</td>
                  <td>
                    <select
                      className={`form-select form-select-sm ${u.role === 'admin' ? 'bg-danger text-white' : u.role === 'seller' ? 'bg-success text-white' : ''}`}
                      value={u.role}
                      onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                      disabled={u.role === 'admin'}
                      style={{ width: '120px' }}
                    >
                      <option value="user">Пользователь</option>
                      <option value="seller">Продавец</option>
                      <option value="admin" disabled>Админ</option>
                    </select>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-warning" onClick={() => setEditingUser(u)}>
                        <FaEdit />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleUserDelete(u.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>
      )}

      {/* ========== ТОВАРЫ ========== */}
      {activeTab === 'products' && (
        <div className="row">
          {products.map(product => (
            <div key={product.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-img-top d-flex align-items-center justify-content-center" style={{ height: '150px', background: '#f0f0f0' }}>
                  {product.image_url ? (
                    <img src={`http://127.0.0.1:8000${product.image_url}`} alt={product.title} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '50px' }}>📦</span>
                  )}
                </div>
                <div className="card-body">
                  <h6>{product.title}</h6>
                  <small className="text-muted">{product.price} ₽</small>
                  <p className="small mt-2">{product.description?.substring(0, 80)}...</p>
                  <small>Продавец: {product.seller_name}</small>
                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-sm btn-warning" onClick={() => setEditingProduct(product)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleProductDelete(product.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== КАТЕГОРИИ ========== */}
      {activeTab === 'categories' && (
        <div>
          <button className="btn btn-success mb-3" onClick={() => setShowAddCategory(!showAddCategory)}>
            <FaPlus /> Добавить категорию
          </button>

          {showAddCategory && (
            <div className="card mb-4 p-3">
              <h5>Новая категория</h5>
              <div className="row">
                <div className="col-md-6">
                  <input className="form-control mb-2" placeholder="Название" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <input className="form-control mb-2" placeholder="Описание" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" onClick={handleAddCategory}>Сохранить</button>
                <button className="btn btn-secondary" onClick={() => setShowAddCategory(false)}>Отмена</button>
              </div>
            </div>
          )}

          <div className="row">
            {categories.map(cat => (
              <div key={cat.id} className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    {editingCategory?.id === cat.id ? (
                      <>
                        <input className="form-control mb-2" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} />
                        <textarea className="form-control mb-2" value={editingCategory.description} onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} />
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-success" onClick={() => handleCategoryEdit(cat.id, editingCategory)}>
                            <FaSave /> Сохранить
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={() => setEditingCategory(null)}>
                            <FaTimes /> Отмена
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h6>{cat.name}</h6>
                        <p className="small text-muted">{cat.description || 'Нет описания'}</p>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-warning" onClick={() => setEditingCategory(cat)}>
                            <FaEdit />
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleCategoryDelete(cat.id)}>
                            <FaTrash />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== ОТЗЫВЫ ========== */}
      {activeTab === 'reviews' && (
        <div className="list-group">
          {reviews.map(review => (
            <div key={review.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{review.user_name}</strong> → <strong>{review.product_title || `Товар #${review.product}`}</strong>
                  <div className="text-warning">{"⭐".repeat(review.rating)}</div>
                  <p className="mb-0 mt-2">{review.text}</p>
                  <small className="text-muted">{new Date(review.created_at).toLocaleDateString()}</small>
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => handleReviewDelete(review.id)}>
                  <FaTrash /> Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminFullPanel;