import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function SellerReviewsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.role !== 'seller') {
      window.location.href = '/';
      return;
    }

    Promise.all([
      fetch('http://127.0.0.1:8000/api/my-products/', {
        headers: { 'Authorization': `Token ${token}` }
      }).then(r => r.json()),
      fetch('http://127.0.0.1:8000/api/reviews/all/', {
        headers: { 'Authorization': `Token ${token}` }
      }).then(r => r.json())
    ]).then(([productsData, allReviews]) => {
      const productsWithReviews = productsData.map(product => ({
        ...product,
        reviews: allReviews.filter(review => review.product === product.id)
      }));
      setProducts(productsWithReviews);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [token, user.role]);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">📝 Отзывы на мои товары</h1>

      {products.length === 0 ? (
        <div className="alert alert-info">У вас пока нет товаров. <Link to="/add-product">Добавить товар</Link></div>
      ) : (
        products.map(product => (
          <div key={product.id} className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{product.title}</h5>
            </div>
            <div className="card-body">
              {product.reviews.length === 0 ? (
                <p className="text-muted">На этот товар пока нет отзывов</p>
              ) : (
                product.reviews.map(review => (
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
        ))
      )}
    </div>
  );
}

export default SellerReviewsPage;