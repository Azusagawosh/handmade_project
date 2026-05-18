import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';

function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCartMessage, setShowCartMessage] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    Promise.all([
      fetch(`http://127.0.0.1:8000/api/products/${id}/`).then(r => r.json()),
      fetch(`http://127.0.0.1:8000/api/products/${id}/reviews/`).then(r => r.json())
    ]).then(([productData, reviewsData]) => {
      setProduct(productData);
      setReviews(reviewsData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });

    if (token) {
      fetch('http://127.0.0.1:8000/api/favorites/', {
        headers: { 'Authorization': `Token ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          const favorited = data.some(f => f.product === parseInt(id));
          setIsFavorited(favorited);
        })
        .catch(err => console.error(err));
    }
  }, [id, token]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Войдите чтобы оставить отзыв');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/products/${id}/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          text: reviewText,
          rating: parseInt(reviewRating),
        }),
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviews([...reviews, newReview]);
        setReviewText('');
        setReviewRating(5);
        alert('Спасибо за отзыв!');
      } else {
        setError('Ошибка при отправке отзыва');
      }
    } catch (err) {
      setError('Ошибка соединения');
    }
  };

  const toggleFavorite = async () => {
    if (!token) {
      setError('Войдите чтобы добавить в избранное');
      return;
    }

    try {
      if (isFavorited) {
        const favs = await fetch('http://127.0.0.1:8000/api/favorites/', {
          headers: { 'Authorization': `Token ${token}` }
        }).then(r => r.json());
        const fav = favs.find(f => f.product === product.id);
        if (fav) {
          await fetch(`http://127.0.0.1:8000/api/favorites/${fav.id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Token ${token}` }
          });
          setIsFavorited(false);
          alert('Товар удален из избранного');
        }
      } else {
        await fetch('http://127.0.0.1:8000/api/favorites/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({ product: product.id })
        });
        setIsFavorited(true);
        alert('Товар добавлен в избранное');
      }
    } catch (err) {
      setError('Ошибка при добавлении в избранное');
    }
  };

  const handleBuy = () => {
    setShowCartMessage(true);
    setTimeout(() => setShowCartMessage(false), 3000);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) return <div className="text-center mt-5">Загрузка...</div>;
  if (!product) return <div className="text-center mt-5">Товар не найден</div>;

  return (
    <div className="container mt-4">
      <Link to="/" className="btn btn-secondary mb-4">← Назад к каталогу</Link>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card-img-top d-flex align-items-center justify-content-center" style={{ height: '350px', background: '#f0f0f0', borderRadius: '20px' }}>
            {product.image_url ? (
              <img src={`http://127.0.0.1:8000${product.image_url}`} alt={product.title} style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            ) : (
              <span style={{ fontSize: '80px' }}>💎</span>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title">{product.title}</h1>
              <div className="d-flex align-items-center mb-3">
                <div className="text-warning me-2">
                  {'⭐'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}
                </div>
                <span className="fw-bold me-2">{averageRating}</span>
                <span className="text-muted">({reviews.length} отзывов)</span>
              </div>
              <h3 className="text-primary mb-3">{product.price} ₽</h3>
              <p className="card-text fs-5">{product.description}</p>

              <div className="d-flex gap-3 mt-3">
                <button className="btn btn-success btn-lg flex-grow-1" onClick={handleBuy}>
                  <FaShoppingCart /> Купить
                </button>
                <button
                  className={`btn btn-lg ${isFavorited ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={toggleFavorite}
                >
                  {isFavorited ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>

              {showCartMessage && (
                <div className="alert alert-success mt-3">Товар добавлен в корзину! С вами свяжутся.</div>
              )}

              <div className="mt-4 p-3 bg-light rounded">
                <small className="text-muted">
                  <strong>Категория:</strong> {product.category_name}<br />
                  <strong>Продавец:</strong> {product.seller_name}<br />
                  <strong>Добавлено:</strong> {new Date(product.created_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h4>Отзывы ({reviews.length})</h4>

          {token && (
            <div className="mb-4 p-3 bg-light rounded">
              <h5>Оставить отзыв</h5>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmitReview}>
                <div className="mb-3">
                  <label className="form-label">Оценка</label>
                  <select className="form-select" value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
                    <option value="5">5 - Отлично</option>
                    <option value="4">4 - Хорошо</option>
                    <option value="3">3 - Средне</option>
                    <option value="2">2 - Плохо</option>
                    <option value="1">1 - Ужасно</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Текст отзыва</label>
                  <textarea className="form-control" rows="3" value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary">Отправить отзыв</button>
              </form>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-muted text-center py-4">Пока нет отзывов. Будьте первым!</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="border-bottom mb-3 pb-3">
                <div className="d-flex justify-content-between">
                  <strong>{review.user_name}</strong>
                  <span className="text-warning">{"⭐".repeat(review.rating)}</span>
                </div>
                <p className="mt-2">{review.text}</p>
                <small className="text-muted">{new Date(review.created_at).toLocaleDateString()}</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;