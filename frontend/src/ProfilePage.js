import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    setEditForm({
      full_name: userData.full_name || '',
      phone: userData.phone || '',
      email: userData.email || ''
    });
    if (userData.avatar_url) {
      setAvatarPreview(`http://127.0.0.1:8000${userData.avatar_url}`);
    }

    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch('http://127.0.0.1:8000/api/favorites/', {
        headers: { 'Authorization': `Token ${token}` }
      }).then(r => r.json()),
      fetch('http://127.0.0.1:8000/api/my-reviews/', {
        headers: { 'Authorization': `Token ${token}` }
      }).then(r => r.json())
    ]).then(([favoritesData, reviewsData]) => {
      setFavorites(favoritesData);
      setReviews(reviewsData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [token]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('full_name', editForm.full_name);
      formData.append('phone', editForm.phone);
      formData.append('email', editForm.email);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`
        },
        body: formData
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setEditing(false);
        alert('Профиль обновлен!');
        window.location.reload();
      } else {
        alert('Ошибка при сохранении');
      }
    } catch (err) {
      alert('Ошибка соединения');
    }
  };

  const removeFavorite = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/favorites/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        setFavorites(favorites.filter(f => f.id !== id));
        alert('Товар удален из избранного');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при удалении');
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">👤 Личный кабинет</h1>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body text-center">
              {/* Аватар */}
              <div className="position-relative d-inline-block mb-3">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="rounded-circle"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-gradient d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: '150px', height: '150px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    <span style={{ fontSize: '60px' }}>👤</span>
                  </div>
                )}
                {editing && (
                  <label className="position-absolute bottom-0 end-0 btn btn-primary btn-sm rounded-circle" style={{ cursor: 'pointer' }}>
                    <FaCamera />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <h5>📋 Информация</h5>
                {!editing ? (
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(true)}>
                    <FaEdit /> Редактировать
                  </button>
                ) : (
                  <div>
                    <button className="btn btn-sm btn-success me-2" onClick={handleSaveProfile}>
                      <FaSave /> Сохранить
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditing(false)}>
                      <FaTimes /> Отмена
                    </button>
                  </div>
                )}
              </div>
              <hr />
              {!editing ? (
                <>
                  <p><strong>Имя:</strong> {user?.username}</p>
                  <p><strong>Email:</strong> {user?.email || 'Не указан'}</p>
                  <p><strong>Полное имя:</strong> {user?.full_name || 'Не указано'}</p>
                  <p><strong>Телефон:</strong> {user?.phone || 'Не указан'}</p>
                  <p><strong>Роль:</strong> {user?.role === 'seller' ? '🛍️ Продавец' : '👤 Покупатель'}</p>
                </>
              ) : (
                <>
                  <div className="mb-2">
                    <label className="form-label small">Email</label>
                    <input type="email" name="email" className="form-control form-control-sm" value={editForm.email} onChange={handleEditChange} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Полное имя</label>
                    <input type="text" name="full_name" className="form-control form-control-sm" value={editForm.full_name} onChange={handleEditChange} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Телефон</label>
                    <input type="text" name="phone" className="form-control form-control-sm" value={editForm.phone} onChange={handleEditChange} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h5>❤️ Избранное ({favorites.length})</h5>
              <hr />
              {favorites.length === 0 ? (
                <p className="text-muted">Нет избранных товаров. <Link to="/">Перейти в каталог</Link></p>
              ) : (
                favorites.map(fav => (
                  <div key={fav.id} className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                    <Link to={`/product/${fav.product}`} className="text-decoration-none">
                      <strong>{fav.product_title}</strong> - {fav.product_price} ₽
                    </Link>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeFavorite(fav.id)}>
                      <FaTrash /> Удалить
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5>⭐ Мои отзывы ({reviews.length})</h5>
              <hr />
              {reviews.length === 0 ? (
                <p className="text-muted">У вас пока нет отзывов</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="border-bottom pb-2 mb-2">
                    <Link to={`/product/${review.product}`} className="text-decoration-none">
                      <strong>{review.product_title}</strong>
                    </Link>
                    <div className="text-warning">{"⭐".repeat(review.rating)}</div>
                    <p className="mb-0">{review.text}</p>
                    <small className="text-muted">{new Date(review.created_at).toLocaleDateString()}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;