import React, { useState } from 'react';
import './ProductDetailPage.css';

// TypeScript Interfaces for data structures
interface Review {
  id: number;
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  discount?: number;
}

// Placeholder Data
const mainProduct = {
  name: 'ONES LIFE GRAPHIC T-SHIRT',
  price: 300,
  discountPrice: 260,
  rating: 4.5,
  reviewsCount: 8,
  description: 'The perfect t-shirt , crafted for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.',
  images: [
    'https://cdn.haitrieu.com/wp-content/uploads/2021/04/dong-phuc-hcmute.jpg',
    'https://ssc.hcmute.edu.vn/Resources/Images/SubDomain/ssc/San%20pham%20SPKT/10617598_951139404912016_2012113801_n.jpg',
    'https://cdn.haitrieu.com/wp-content/uploads/2021/09/dong-phuc-hcmute-mau-xanh-mat-truoc.png',
    'https://cdn.haitrieu.com/wp-content/uploads/2022/01/dong-phuc-khoa-dao-tao-chat-luong-cao-dai-hoc-su-pham-ky-thuat-tp-hcm.png',
  ],
  sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  colors: ['#4F4B3C', '#3B5998', '#1DA1F2'],
};

const reviewsData: Review[] = [
  { id: 1, author: 'Samantha D.', rating: 5, text: 'Absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a design enthusiast, I appreciate the attention to detail. It\'s become my favorite go-to shirt!', date: 'Posted on August 16, 2023' },
  { id: 2, author: 'Alex M.', rating: 5, text: 'This t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. I\'ve received so many compliments when I wear it. I\'m very particular about my clothes, and this t-shirt definitely gets a thumbs up from me.', date: 'Posted on August 15, 2023' },
  { id: 3, author: 'Ethan R.', rating: 5, text: 'This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can confidently say this is one of the best t-shirts I own.', date: 'Posted on August 16, 2023' },
  { id: 4, author: 'Olivia P.', rating: 5, text: 'As a design enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It\'s evident that a lot of thought went into creating this piece, from the fabric to the print.', date: 'Posted on August 17, 2023' },
  { id: 5, author: 'Liam K.', rating: 5, text: 'I\'m impressed with the fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer\'s skill. It\'s like wearing a piece of art. I highly recommend this t-shirt for its design and quality.', date: 'Posted on August 18, 2023' },
  { id: 6, author: 'Ava H.', rating: 5, text: 'It feels like more than just wearing a t-shirt; I\'m wearing a piece of design philosophy. The intricate details and thoughtful layout of the design make this shirt a standout in my collection.', date: 'Posted on August 19, 2023' },
];

const recommendedProducts: Product[] = [
  { id: 1, name: 'Polo with Contrast Trims', price: 242, discount: 30, imageUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2021/04/dong-phuc-hcmute.jpg' },
  { id: 2, name: 'Gradient Graphic T-shirt', price: 145, imageUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2021/04/dong-phuc-hcmute.jpg' },
  { id: 3, name: 'Polo with Tipping Details', price: 180, imageUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2021/04/dong-phuc-hcmute.jpg' },
  { id: 4, name: 'Black Striped T-shirt', price: 180, discount: 30, imageUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2021/04/dong-phuc-hcmute.jpg' },
];


const ProductDetailPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState(mainProduct.images[0]);
  const [selectedSize, setSelectedSize] = useState('Large');
  const [selectedColor, setSelectedColor] = useState(mainProduct.colors[0]);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  return (
    <div className="product-detail-page">
      {/* Header/Nav can be a separate component */}
      <header className="page-header">
        {/* Simplified Header for example */}
        <nav>SHOP.CO</nav>
      </header>

      <main className="main-content">
        <div className="product-container">
          {/* Product Image Gallery */}
          <div className="product-gallery">
            <div className="thumbnails">
              {mainProduct.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className={selectedImage === img ? 'active' : ''}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
            <div className="main-image">
              <img src={selectedImage} alt={mainProduct.name} />
            </div>
          </div>

          {/* Product Information */}
          <div className="product-info">
            <h1 className="product-name">{mainProduct.name}</h1>
            <div className="product-rating">
              <span>★★★★☆</span> <span>{mainProduct.rating}/5</span>
            </div>
            <div className="product-price">
              <span className="current-price">${mainProduct.discountPrice}</span>
              <span className="original-price">${mainProduct.price}</span>
              <span className="discount-badge">-30%</span>
            </div>
            <p className="product-description">{mainProduct.description}</p>

            <div className="product-options">
              <div className="option-group">
                <label>Select Colors</label>
                <div className="color-selector">
                  {mainProduct.colors.map(color => (
                    <button
                      key={color}
                      className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="option-group">
                <label>Choose Size</label>
                <div className="size-selector">
                  {mainProduct.sizes.map(size => (
                    <button
                      key={size}
                      className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="product-actions">
              <div className="quantity-adjuster">
                <button onClick={() => handleQuantityChange(-1)}>-</button>
                <span>{quantity}</span>
                <button onClick={() => handleQuantityChange(1)}>+</button>
              </div>
              <button className="add-to-cart-btn">Add to Cart</button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="tabs">
            <button className="tab-btn active">Rating & Reviews</button>
            <button className="tab-btn">FAQs</button>
          </div>
          <div className="reviews-header">
            <h2>All Reviews <span className='review-count'>({reviewsData.length})</span></h2>
            <div>
              <button className="latest-btn">Latest</button>
              <button className="write-review-btn">Write a Review</button>
            </div>
          </div>
          <div className="reviews-grid">
            {reviewsData.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-card-header">
                  <div>
                    <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    <h4>{review.author}</h4>
                  </div>
                  <button className="more-options-btn">⋮</button>
                </div>
                <p>{review.text}</p>
                <span className="review-date">{review.date}</span>
              </div>
            ))}
          </div>
          <button className="load-more-btn">Load More Reviews</button>
        </div>


        {/* You Might Also Like Section */}
        <div className="recommendations">
          <h2>YOU MIGHT ALSO LIKE</h2>
          <div className="product-grid">
            {recommendedProducts.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.imageUrl} alt={product.name} />
                <h3>{product.name}</h3>
                <p className="price">
                  ${product.price}
                  {product.discount && <span className="original-price-rec">${Math.floor(product.price / (1 - product.discount / 100))}</span>}
                  {product.discount && <span className="discount-badge-rec">-{product.discount}%</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>


    </div>
  );
};

export default ProductDetailPage;