import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom"; // nếu bạn dùng react-router
import { getProductDetail, getSizes, getProductByCategory, getFullnameUserFeedback, getImageFeedbacks } from "../../../services/product/productDetailApi";
import './ProductDetailPage.css';
// TypeScript Interfaces for data structures
interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}
interface ImageFeedback {
  id: string;
  imageFeedback: string;
}
interface ProductSize {
  product: string;
  size: string;
  quantity: number;
  id: string;
}
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  sizes: ProductSize[];
}
interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  images: object[];
}
const ProductDetailPage: React.FC = () => {

  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>([]);
  const [imageFeedbacks, setImageFeedbacks] = useState<Record<string, ImageFeedback[]>>({});
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const handleRecommendedProductClick = async (productId: string) => {
    try {
      window.location.href = `/product/${productId}`;
    } catch (error) {
      console.error("Error navigating to product:", error);
    }
  };
  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));

  };
  useEffect(() => {
    if (product) {
      console.log("Product updated:", product);
    }
  }, [product]);
  useEffect(() => {
    reviews.forEach(review => {
      if (!usernames[review.author]) {
        getUserNameFeedback(review.author);
      }
    });
  }, [reviews]);
  useEffect(() => {
    const fetchImages = async () => {
      const newFeedbackImages: Record<string, ImageFeedback[]> = {};
      for (const review of reviews) {
        try {
          const result = await getImageFeedbacks(review.id);
          newFeedbackImages[review.id] = result.data;
        } catch (error: any) {
          console.error(`Error fetching images for review ${review.id}:`, error);
        }
      }
      setImageFeedbacks(newFeedbackImages);
    }
    if (reviews.length > 0) fetchImages();

  }, [reviews])
  const getUserNameFeedback = async (id: string) => {
    try {
      const res = await getFullnameUserFeedback(id);
      setUsernames(prev => ({ ...prev, [id]: res.data }));
    } catch (err) {
      console.error("Error fetching username:", err);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const productData = await getProductDetail(id);
        const sizeData = await getSizes(id);
        const categoryProducts = await getProductByCategory(productData.data.product.category.id);
        const feedbackData = await getFullnameUserFeedback(productData.data.feedbacks[0].user);

        const recommendedProducts = categoryProducts.data.map((item: any) => ({
          id: item.id,
          name: item.productName,
          price: item.price,
          images: item.listImage
        }));
        setProduct({
          id: productData.data.product.id,
          name: productData.data.product.productName,
          price: productData.data.product.price,
          description: productData.data.product.description,
          images: productData.data.product.listImage.map((img: any) => img.imageProduct),
          sizes: sizeData.data,
        });
        setImages(productData.data.product.listImage.map((img: any) => img.imageProduct));



        setReviews(productData.data.feedbacks.map((fb: any) => ({
          id: fb.id,
          author: fb.user,
          rating: fb.rating,
          text: fb.comment,
          date: fb.date
        })));
        setSelectedImage(productData.data.product.listImage[0].imageProduct)
        setRecommended(recommendedProducts);
        // setSelectedImage(productData.images[0]);
        setSelectedSize(sizeData.data[0].size);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };


    fetchData();
  }, [id]);
  const modal = document.getElementById("imageModal") as HTMLDivElement;
  const modalImg = document.getElementById("fullImage") as HTMLImageElement;
  function openModal(element: HTMLImageElement) {
    if (modal && modalImg) {
      modal.style.display = "block";
      modalImg.src = element.src;
    }
  }


  // Hàm đóng modal
  function closeModal() {
    if (modal) {
      modal.style.display = "none";
    }
  }

  // Đóng modal khi click ra ngoài ảnh
  window.onclick = function (event: MouseEvent) {
    // Ép kiểu 'event.target' để so sánh an toàn hơn.
    const target = event.target as HTMLElement;
    if (target === modal) {
      closeModal();
    }
  }
  return (
    <div className="product-detail-page">
      {/* Header/Nav can be a separate component */}
      <header className="page-header">
        {/* Simplified Header for example */}
        <nav>SHOP.CO</nav>
      </header>

      <main className="main-content">
        <div className="product-container">
          <div className="product-gallery">
            <div className="thumbnails">
              {product?.images.map((img, index) => (
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
              <img src={selectedImage} alt={product?.name} />
            </div>
          </div>

          {/* Product Information */}
          <div className="product-info">
            <h1 className="product-name">{product?.name}</h1>
            <div className="product-rating">
              <span>{'★'.repeat(Math.round((reviews.reduce((sum, obj) => sum + obj.rating, 0)) / reviews.length))}{'☆'.repeat(Math.round(5 - (reviews.reduce((sum, obj) => sum + obj.rating, 0)) / reviews.length))}</span>
            </div>
            <div className="product-price">
              <span className="current-price">${product?.price}</span>
              <span className="original-price">${product?.price}</span>
              <span className="discount-badge">-30%</span>
            </div>
            <p className="product-description">{product?.description}</p>

            <div className="product-options">
              <div className="option-group">
                <label>Select Colors</label>

              </div>
              <div className="option-group">
                <label>Choose Size</label>
                <div className="size-selector">
                  {product?.sizes.map(s => (
                    <button
                      key={s.id}
                      className={`size-button ${selectedSize === s.size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(s.size)}
                    >
                      {s.size} ({s.quantity})
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
          </div>
          <div className="reviews-header">
            <h2>All Reviews <span className='review-count'>({reviews.length})</span></h2>
            <div>
              <button className="latest-btn">Latest</button>
            </div>
          </div>
          <div className="reviews-grid">
            {reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-card-header">
                  <div>
                    <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    <h4>{usernames[review.author] || "Loading..."}</h4>
                  </div>
                </div>

                {imageFeedbacks[review.id] && imageFeedbacks[review.id].map((image) => {
                  return (
                    <img
                      key={image.id}
                      src={image.imageFeedback}
                      className="thumbnail"
                      onClick={(event) => openModal(event.target as HTMLImageElement)}
                    />
                  );
                })}



                <p>{review.text}</p>
                <span className="review-date">{review.date.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        </div>
        <div id="imageModal" className="modal">
          <span className="close" onClick={closeModal}>&times;</span>
          <img className="modal-content" id="fullImage" />
        </div>
        <div className="recommendations">
          <h2>YOU MIGHT ALSO LIKE</h2>
          <div className="product-grid">
            {recommended.map(recommended => (
              <div className="product-card"
                onClick={() => handleRecommendedProductClick(recommended.id)}>
                <img src={(recommended.images[0] as any).imageProduct} alt={recommended.name} />

                <h3>{recommended.name}</h3>
                <p className="price">
                  ${recommended.price}

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