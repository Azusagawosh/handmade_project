import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function AddProductPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token || user.role !== 'seller') {
      navigate('/');
      return;
    }

    fetch('http://127.0.0.1:8000/api/categories/')
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, [navigate, token, user.role]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', parseFloat(price));
    formData.append('category', parseInt(category));
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/products/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        navigate('/my-products');
      } else {
        const data = await response.json();
        setError(JSON.stringify(data));
      }
    } catch (err) {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card">
        <div className="card-body">
          <h2 className="text-center mb-4">➕ Добавить товар</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Название</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Описание</label>
              <textarea
                className="form-control"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Цена (₽)</label>
              <input
                type="number"
                className="form-control"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Категория</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Фото товара</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2 text-center">
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '10px' }} />
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Загрузка...' : '➕ Добавить товар'}
            </button>
            <Link to="/my-products" className="btn btn-secondary w-100 mt-2">Отмена</Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProductPage;