import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import {
  getProductDetail, getSizes, getProductByCategory, getFullnameUserFeedback, getImageFeedbacks,
  saveFavoriteProduct, deleteFavoriteProduct, checkExistedWishlist
} from "../../../services/product/productDetailApi";

import classNames from "classnames/bind";
import styles from './ProductDetailPage.module.scss'

import Header from '../../commonComponent/Header';
import Footer from '../../commonComponent/Footer';
import LoginPromptModal from '../../LoginPromptModal/LoginPromptModal';

const cx = classNames.bind(styles);

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
  const token = localStorage.getItem("token");
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>([]);
  const [imageFeedbacks, setImageFeedbacks] = useState<Record<string, ImageFeedback[]>>({});
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleHeartClick = async () => {
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      if (isFavorite) {
        await deleteFavoriteProduct(id);
        setIsFavorite(false);
      } else {
        await saveFavoriteProduct(id);
        setIsFavorite(true);
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật Wishlist: ", error);
      alert("Lỗi xảy ra. Vui lòng thử lại.");
    }
  };

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
    };
    if (reviews.length > 0) fetchImages();
  }, [reviews]);

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
        if (id) {
          if (token) {
            const status = await checkExistedWishlist(id);
            setIsFavorite(status);
          }
        }
        const productData = await getProductDetail(id);
        const sizeData = await getSizes(id);
        const categoryProducts = await getProductByCategory(
          productData.data.product.category.id,
          productData.data.product.id
        );

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
          id: fb.feedback.id,
          author: fb.order.user,
          rating: fb.feedback.rating,
          text: fb.feedback.comment,
          date: fb.feedback.date
        })));

        setSelectedImage(productData.data.product.listImage[0].imageProduct);
        setRecommended(recommendedProducts);
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

  function closeModal() {
    if (modal) {
      modal.style.display = "none";
    }
  }

  window.onclick = function (event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target === modal) {
      closeModal();
    }
  };

  return (
    <>
      <Header />
      <div className={cx("product-detail-page")}>
        <header className={cx("page-header")}>
          <nav>SHOP.CO</nav>
        </header>

        <main className={cx("main-content")}>
          <div className={cx("product-container")}>
            <div className={cx("product-gallery")}>
              <div className={cx("thumbnails")}>
                {product?.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className={cx({ active: selectedImage === img })}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>
              <div className={cx("main-image")}>
                {selectedImage && <img src={selectedImage} alt={product?.name} />}
              </div>
            </div>

            <div className={cx("product-info")}>
              <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <h1 className={cx("product-name")}>{product?.name}</h1>
                <img src={isFavorite ? "https://icons.iconarchive.com/icons/designbolts/free-valentine-heart/256/Heart-icon.png"
                  : "https://www.iconpacks.net/icons/2/free-heart-icon-3510-thumb.png"
                } style={{
                  maxWidth: "30px", maxHeight: "30px",
                  marginTop: "10px", cursor: "pointer"
                }} onClick={handleHeartClick} />
              </div>

              <div className={cx("product-rating")}>
                <span>
                  {"★".repeat(Math.round((reviews.reduce((sum, obj) => sum + obj.rating, 0)) / reviews.length))}
                  {"☆".repeat(Math.round(5 - (reviews.reduce((sum, obj) => sum + obj.rating, 0)) / reviews.length))}
                </span>
              </div>

              <div className={cx("product-price")}>
                <span className={cx("current-price")}>${product?.price}</span>
              </div>

              <p className={cx("product-description")}>{product?.description}</p>

              <div className={cx("product-options")}>
                <div className={cx("option-group")}></div>
                <div className={cx("option-group")}>
                  <label>Choose Size</label>
                  <div className={cx("size-selector")}>
                    {product?.sizes.map(s => (
                      <button
                        key={s.id}
                        className={cx("size-button", { selected: selectedSize === s.size })}
                        onClick={() => setSelectedSize(s.size)}
                      >
                        {s.size} ({s.quantity})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={cx("product-actions")}>
                <div className={cx("quantity-adjuster")}>
                  <button onClick={() => handleQuantityChange(-1)}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)}>+</button>
                </div>
                <button className={cx("add-to-cart-btn")}>Add to Cart</button>
              </div>
            </div>
          </div>

          <div className={cx("reviews-section")}>
            <div className={cx("tabs")}>
              <button className={cx("tab-btn", "active")}>Rating & Reviews</button>
            </div>
            <div className={cx("reviews-header")}>
              <h2>
                All Reviews <span className={cx("review-count")}>({reviews.length})</span>
              </h2>
              <div>
                <button className={cx("latest-btn")}>Latest</button>
              </div>
            </div>

            <div className={cx("reviews-grid")}>
              {reviews.map(review => (
                <div key={review.id} className={cx("review-card")}>
                  <div className={cx("review-card-header")}>
                    <div>
                      <span className={cx("review-rating")}>
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                      <h4>{usernames[review.author] || "Loading..."}</h4>
                    </div>
                  </div>

                  {imageFeedbacks[review.id] &&
                    imageFeedbacks[review.id].map((image) => (
                      <img
                        key={image.id}
                        src={image.imageFeedback}
                        className={cx("thumbnail")}
                        onClick={(event) => openModal(event.target as HTMLImageElement)}
                      />
                    ))}

                  <p>{review.text}</p>
                  <span className={cx("review-date")}>{review.date.slice(0, 10)}</span>
                </div>
              ))}
            </div>
          </div>

          <div id="imageModal" className={cx("modal")}>
            <span className={cx("close")} onClick={closeModal}>&times;</span>
            <img className={cx("modal-content")} id="fullImage" />
          </div>

          <div className={cx("recommendations")}>
            <h2>YOU MIGHT ALSO LIKE</h2>
            <div className={cx("product-grid")}>
              {recommended.map(recommended => (
                <div
                  key={recommended.id}
                  className={cx("product-card")}
                  onClick={() => handleRecommendedProductClick(recommended.id)}
                >
                  <img src={(recommended.images[0] as any).imageProduct} alt={recommended.name} />
                  <h3>{recommended.name}</h3>
                  <p className={cx("price")}>${recommended.price}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Footer />
      <LoginPromptModal show={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </>
  );
};

export default ProductDetailPage;
