import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaShoppingCart, FaShare, FaThumbsUp } from 'react-icons/fa';

function ProductReviewPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCartMessage, setShowCartMessage] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    Promise.all([
      fetch(`http://127.0.0.1:8000/api/products/${id}/`).then(r => r.json()),
      fetch(`http://127.0.0.1:8000/api/products/${id}/reviews/`).then(r => r.json())
    ]).then(([productData, reviewsData]) => {
      setProduct(productData);
      setReviews(reviewsData);
      setLikesCount(Math.floor(Math.random() * 50) + 10);
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

  const handleLike = () => {
    if (!token) {
      setError('Войдите чтобы оценить');
      return;
    }
    if (!liked) {
      setLikesCount(likesCount + 1);
      setLiked(true);
    } else {
      setLikesCount(likesCount - 1);
      setLiked(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Ссылка на товар скопирована!');
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!product) return <div className="text-center mt-5">Товар не найден</div>;

  return (
    <div className="container mt-4">
      <Link to="/" className="btn btn-secondary mb-4">← Назад к каталогу</Link>

      <div className="row mb-5">
        <div className="col-md-6">
          <div className="card-img-top d-flex align-items-center justify-content-center" style={{ height: '400px', background: '#f0f0f0', borderRadius: '20px' }}>
            {product.image_url ? (
              <img src={`http://127.0.0.1:8000${product.image_url}`} alt={product.title} style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            ) : (
              <span style={{ fontSize: '120px' }}>💎</span>
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

              <h2 className="text-primary mb-3">{product.price} ₽</h2>
              <p className="card-text fs-5 mb-4">{product.description}</p>

              <div className="mb-4">
                <h5>Характеристики:</h5>
                <ul className="list-unstyled">
                  <li>📦 Состояние: Новое</li>
                  <li>🚚 Доставка: По всей России</li>
                  <li>💳 Оплата: При получении</li>
                  <li>🔄 Возврат: 14 дней</li>
                </ul>
              </div>

              <div className="d-flex gap-3 mb-3">
                <button className="btn btn-success btn-lg flex-grow-1" onClick={handleBuy}>
                  <FaShoppingCart /> Купить сейчас
                </button>
                <button className={`btn btn-lg ${isFavorited ? 'btn-danger' : 'btn-outline-danger'}`} onClick={toggleFavorite}>
                  {isFavorited ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={handleLike}>
                  <FaThumbsUp /> {liked ? 'Нравится' : 'Полезно'} ({likesCount})
                </button>
                <button className="btn btn-outline-secondary" onClick={handleShare}>
                  <FaShare /> Поделиться
                </button>
              </div>

              {showCartMessage && (
                <div className="alert alert-success mt-3">Товар добавлен в корзину! С вами свяжутся.</div>
              )}

              <div className="mt-4 p-3 bg-light rounded">
                <small className="text-muted">
                  <strong>Продавец:</strong> {product.seller_name}<br />
                  <strong>Категория:</strong> {product.category_name}<br />
                  <strong>Добавлено:</strong> {new Date(product.created_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h4>Распределение оценок</h4>
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="d-flex align-items-center mb-2">
              <div className="me-2" style={{ width: '60px' }}>{star} звезд</div>
              <div className="flex-grow-1">
                <div className="progress">
                  <div
                    className="progress-bar bg-warning"
                    role="progressbar"
                    style={{ width: `${(ratingDistribution[star] / reviews.length) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="ms-2">{ratingDistribution[star]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h4>Отзывы покупателей ({reviews.length})</h4>

          {token && (
            <div className="mb-4 p-3 bg-light rounded">
              <h5>Оставить отзыв</h5>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmitReview}>
                <div className="mb-3">
                  <label className="form-label">Ваша оценка</label>
                  <div className="d-flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setReviewRating(star)}
                        style={{ background: 'none', border: 'none' }}
                      >
                        {star <= reviewRating ? (
                          <FaStar size={30} color="#ffc107" />
                        ) : (
                          <FaRegStar size={30} color="#ffc107" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Поделитесь впечатлениями о товаре..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">Отправить отзыв</button>
              </form>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-muted text-center py-4">Пока нет отзывов. Будьте первым!</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="review-card mb-3 p-3 border rounded">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong>{review.user_name}</strong>
                    <div className="text-warning">
                      {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  <small className="text-muted">{new Date(review.created_at).toLocaleDateString()}</small>
                </div>
                <p className="mb-0">{review.text}</p>
                <div className="mt-2">
                  <small className="text-muted">
                    <FaThumbsUp /> Помогло?
                    <button className="btn btn-link btn-sm">Да</button>
                    <button className="btn btn-link btn-sm">Нет</button>
                  </small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductReviewPage;