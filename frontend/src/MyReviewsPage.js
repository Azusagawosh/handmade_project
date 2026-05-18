import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) {
      setError('Войдите чтобы увидеть отзывы');
      setLoading(false);
      return;
    }

    // Получаем все отзывы пользователя через API
    fetch('http://127.0.0.1:8000/api/my-reviews/', {
      headers: {
        'Authorization': `Token ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) throw new Error('Ошибка загрузки');
        return response.json();
      })
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Удалить отзыв?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/reviews/${reviewId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
      } else {
        alert('Ошибка удаления');
      }
    } catch (err) {
      alert('Ошибка соединения');
    }
  };

  if (loading) return <div className="text-center mt-5">Загрузка...</div>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Мои отзывы</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {reviews.length === 0 ? (
        <div className="alert alert-info">
          У вас пока нет отзывов. <Link to="/">Перейти в каталог</Link>
        </div>
      ) : (
        <div className="row">
          {reviews.map(review => (
            <div key={review.id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title">
                        <Link to={`/product/${review.product}`}>
                          {review.product_title || `Товар #${review.product}`}
                        </Link>
                      </h5>
                      <div className="text-warning mb-2">
                        {"⭐".repeat(review.rating)}
                      </div>
                      <p className="card-text">{review.text}</p>
                      <small className="text-muted">
                        {new Date(review.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="btn btn-danger btn-sm"
                    >
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

export default MyReviewsPage;
