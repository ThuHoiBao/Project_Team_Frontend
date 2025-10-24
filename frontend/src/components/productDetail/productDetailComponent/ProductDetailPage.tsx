import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./ProductDetailPage.module.scss";
import Header from "../../commonComponent/Header";
import Footer from "../../commonComponent/Footer";
import LoginPromptModal from "../../LoginPromptModal/LoginPromptModal";
import { toast } from "react-toastify";

import {
  getProductDetail,
  getSizes,
  getProductByCategory,
  getFullnameUserFeedback,
  getImageFeedbacks,
  saveFavoriteProduct,
  deleteFavoriteProduct,
  checkExistedWishlist,
} from "../../../services/product/productDetailApi";

import { useCart } from "../../../context/CartContext";
import { CartItemInfo } from "../../../services/cart/cartApi";
const cx = classNames.bind(styles);

// ---------- Types ----------
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
  categoryId: string; // Added for recommended products
}
interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  images: { imageProduct?: string }[]; // from API shape
}

// ---------- Component ----------
const ProductDetailPage: React.FC = () => {
  const { id: productId } = useParams<{ id: string }>();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const { cartItems, isLoadingCart, addItemToCart } = useCart();

  // states
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [imageFeedbacks, setImageFeedbacks] = useState<Record<string, ImageFeedback[]>>({});
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start true
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  // ---------- Helpers ----------
const getQuantityAlreadyInCart = useCallback(
    (pId: string | undefined, size: string): number => {
      if (!pId || !size || isLoadingCart || !Array.isArray(cartItems)) return 0;

      // Bây giờ (cartItems as CartItemInfo[]) đã đúng kiểu
      const itemInCart = (cartItems as CartItemInfo[]).find(
        (it) => (it.product._id === pId || it.product.id === pId) && it.size === size
      );

      return itemInCart ? itemInCart.quantity : 0;
    },
    [cartItems, isLoadingCart]
  );

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    return Math.round(sum / reviews.length || 0);
  }, [reviews]);

  const { availableStock, quantityInCart, maxMoreCanAdd } = useMemo(() => {
    if (!product || !selectedSize || !productId) {
      return { availableStock: 0, quantityInCart: 0, maxMoreCanAdd: 0 };
    }
    const sizeInfo = product.sizes.find((s) => s.size === selectedSize);
    if (!sizeInfo) {
      return { availableStock: 0, quantityInCart: 0, maxMoreCanAdd: 0 };
    }

    // ========= DEBUG LOGGING =========
    console.log("---------- DEBUGGING useMemo ----------");
    console.log("Page Product ID (pId):", productId);
    console.log("Page Selected Size (size):", selectedSize);
    console.log("Is Cart Loading (isLoadingCart):", isLoadingCart);
    console.log("Total Stock (sizeInfo.quantity):", sizeInfo.quantity);
    console.log("Raw cartItems:", JSON.stringify(cartItems, null, 2));

    const qInCart = getQuantityAlreadyInCart(productId, selectedSize);
    const totalStock = sizeInfo.quantity;
    const available = totalStock - qInCart;

    // ========= FINAL CALCULATION LOG =========
    console.log("Calculated qInCart:", qInCart);
    console.log("Calculated maxMoreCanAdd:", Math.max(0, available));
    console.log("-------------------------------------");

    return {
      availableStock: totalStock,
      quantityInCart: qInCart,
      maxMoreCanAdd: Math.max(0, available),
    };
  }, [product, selectedSize, productId, getQuantityAlreadyInCart, cartItems, isLoadingCart]);

  const isPlusDisabled = quantity >= maxMoreCanAdd || isAddingToCart;
  const isAddToCartDisabled =
    !selectedSize ||
    quantity < 1 ||
    !product ||
    loading ||
    isAddingToCart ||
    maxMoreCanAdd === 0 ||
    quantity > maxMoreCanAdd;

  // ---------- Handlers ----------
  const handleHeartClick = async () => {
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }
    if (!productId) return;
    try {
      if (isFavorite) {
        await deleteFavoriteProduct(productId);
        setIsFavorite(false);
        toast.success("Removed from wishlist");
      } else {
        await saveFavoriteProduct(productId);
        setIsFavorite(true);
        toast.success("Added to wishlist");
      }
    } catch (error: any) {
      console.error("Error updating wishlist:", error);
      toast.error("Error updating wishlist. Please try again.");
    }
  };

  const handleRecommendedProductClick = (pId: string) => {
    navigate(`/product/${pId}`);
    window.scrollTo(0, 0); // Scroll to top on nav
  };

  // ---------- Fetch username for a review author ----------
  const getUserNameFeedback = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const res = await getFullnameUserFeedback(id);
      setUsernames((prev) => ({ ...prev, [id]: res.data || "Unknown" }));
    } catch (err) {
      console.error("Error fetching username:", err);
      setUsernames((prev) => ({ ...prev, [id]: "Unknown" }));
    }
  }, []);

  // ---------- Effects ----------

  // FIX: Robust data fetching
  useEffect(() => {
    if (!productId) return;

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      window.scrollTo(0, 0); // Scroll to top on new product load

      // Reset state for new product
      setProduct(null);
      setReviews([]);
      setRecommended([]);
      setSelectedImage("");
      setSelectedSize("");
      setQuantity(1);
      setIsFavorite(false);
      setImageFeedbacks({});
      setUsernames({});

      try {
        // --- Wishlist (non-critical) ---
        if (token) {
          try {
            const exists = await checkExistedWishlist(productId);
            if (!cancelled) setIsFavorite(Boolean(exists));
          } catch (e) {
            console.warn("checkExistedWishlist failed:", e);
          }
        }

        // --- Core Product Data (critical) ---
        let rawProduct: any;
        let sizeData: ProductSize[] = [];
        let feedbacks: any[] = [];
        try {
          const [productRes, sizesRes] = await Promise.all([
            getProductDetail(productId),
            getSizes(productId),
          ]);
          rawProduct = productRes.data.product;
          feedbacks = Array.isArray(productRes.data.feedbacks) ? productRes.data.feedbacks : [];
          sizeData = Array.isArray(sizesRes.data) ? sizesRes.data : [];
        } catch (err) {
          console.error("Error fetching core product data:", err);
          toast.error("Failed to fetch product details.");
          if (!cancelled) setLoading(false);
          return; // Stop if core data fails
        }

        const imagesFromApi = Array.isArray(rawProduct.listImage)
          ? rawProduct.listImage.map((img: any) => img.imageProduct).filter(Boolean)
          : [];
        
        const categoryId = rawProduct?.category?.id || rawProduct?.category?._id;

        // --- Recommended Products (non-critical) ---
        let recommendedProducts: RecommendedProduct[] = [];
        if (categoryId) {
          try {
            const currentPId = rawProduct.id || rawProduct._id;
            const categoryRes = await getProductByCategory(categoryId, currentPId);
            recommendedProducts = Array.isArray(categoryRes.data)
              ? categoryRes.data.map((item: any) => ({
                  id: item.id || item._id,
                  name: item.productName,
                  price: item.price,
                  images: item.listImage || [],
                }))
              : [];
          } catch (e) {
            console.warn("getProductByCategory failed:", e);
          }
        }

        // --- Set State ---
        if (!cancelled) {
          setProduct({
            id: rawProduct._id || rawProduct.id,
            name: rawProduct.productName,
            price: rawProduct.price,
            description: rawProduct.description,
            images: imagesFromApi,
            sizes: sizeData,
            categoryId: categoryId,
          });

          setSelectedImage(imagesFromApi[0] || "");
          setRecommended(recommendedProducts);

          // FIX: Set default size to first *in stock* size, or just first
          const defaultSize =
            sizeData.find((s) => s.quantity > 0)?.size ||
            sizeData[0]?.size ||
            "";
          setSelectedSize(defaultSize);

          // build reviews
          const mappedReviews: Review[] = feedbacks.map((fb: any) => ({
            id: fb.feedback?.id || fb.feedback?._id,
            author: fb.order?.user,
            rating: fb.feedback?.rating || 0,
            text: fb.feedback?.comment || "",
            date: fb.feedback?.date || "",
          }));
          setReviews(mappedReviews);
        }
      } catch (err) {
        // This will catch any unexpected errors
        console.error("Error in fetchData:", err);
        toast.error("An unexpected error occurred.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [productId, token]); // token dependency is correct for wishlist

  // fetch usernames for each review author (only once per author)
  useEffect(() => {
    reviews.forEach((r) => {
      if (r.author && !usernames[r.author]) {
        getUserNameFeedback(r.author);
      }
    });
  }, [reviews, usernames, getUserNameFeedback]);

  // FIX: Performance - fetch images in parallel
  useEffect(() => {
    if (!reviews || reviews.length === 0) return;
    let cancelled = false;

    const fetchAllFeedbackImages = async () => {
      const promises = reviews.map(async (r) => {
        try {
          const res = await getImageFeedbacks(r.id);
          return { reviewId: r.id, images: Array.isArray(res.data) ? res.data : [] };
        } catch (e) {
          console.warn(`Error fetching images for review ${r.id}:`, e);
          return { reviewId: r.id, images: [] }; // Return empty on error
        }
      });

      const results = await Promise.all(promises);

      if (!cancelled) {
        const accum: Record<string, ImageFeedback[]> = {};
        results.forEach((result) => {
          accum[result.reviewId] = result.images;
        });
        setImageFeedbacks(accum);
      }
    };

    fetchAllFeedbackImages();
    return () => {
      cancelled = true;
    };
  }, [reviews]);

  // FIX: Bug - Reset quantity to 1 when size changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedSize]);

  // ---------- Image modal ----------
  const openModal = (imgSrc: string) => setModalImage(imgSrc);
  const closeModal = () => setModalImage(null);

  // ---------- Quantity adjustments ----------
  // FIX: Cleaned up quantity adjustment logic
  const handleQuantityChange = (delta: number) => {
    if (!product || !selectedSize) {
      toast.warn("Please select a size first.");
      return;
    }

    const sizeInfo = product.sizes.find((s) => s.size === selectedSize);
    if (!sizeInfo) {
      toast.error("Selected size information not found.");
      return;
    }

    const next = quantity + delta;

    if (next < 1) {
      setQuantity(1); 
      return;
    }

    if (maxMoreCanAdd === 0) {
      if (delta > 0) { 
        toast.error("You already have the maximum stock for this size in your cart.");
      }
      setQuantity(1);
      return;
    }

    if (next > maxMoreCanAdd) {
      toast.error(`Stock limit reached. You can add up to ${maxMoreCanAdd} more item(s).`);
      setQuantity(maxMoreCanAdd); 
      return; 
    }

    setQuantity(next);
  };

  // ---------- Add to cart ----------
  const handleAddToCart = async () => {
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }
    if (isAddToCartDisabled || isAddingToCart) {
      if (!selectedSize) {
        toast.warn("Please select a size.");
      } else {
        toast.error("Cannot add to cart. Check stock or quantity.");
      }
      return;
    }
    if (!productId) {
      toast.error("Product ID missing.");
      return;
    }

    try {
      setIsAddingToCart(true);
      await addItemToCart(productId, selectedSize, quantity);
      toast.success("Product added to cart!");
      setQuantity(1); // Reset quantity to 1 after successful add
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      toast.error(err?.message || "Failed to add product to cart.");
    } finally{
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className={cx("product-detail-page")}>
          <main className={cx("main-content")}>
            <div className={cx("loading")}>Loading product...</div>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className={cx("product-detail-page")}>
          <main className={cx("main-content")}>
            <div className={cx("loading")}>Product not found.</div>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={cx("product-detail-page")}>
        <main className={cx("main-content")}>
          <div className={cx("product-container")}>
            <div className={cx("product-gallery")}>
              <div className={cx("thumbnails")}>
                {(product?.images || []).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className={cx({ active: selectedImage === img })}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>

              <div className={cx("main-image")}>
                {selectedImage ? (
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                  <img
                    src={selectedImage}
                    alt={product?.name || "Product image"}
                    onClick={() => openModal(selectedImage)}
                    style={{ cursor: "zoom-in" }}
                  />
                ) : (
                  <div className={cx("no-image")}>No image</div>
                )}
              </div>
            </div>

            <div className={cx("product-info")}>
              {/* FIX: Accessibility - use button for wishlist */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <h1 className={cx("product-name")}>{product?.name || "Unnamed product"}</h1>
                <button
                  type="button"
                  onClick={handleHeartClick}
                  aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    marginLeft: "10px",
                    lineHeight: 0,
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={
                      isFavorite
                        ? "https://icons.iconarchive.com/icons/designbolts/free-valentine-heart/256/Heart-icon.png"
                        : "https://www.iconpacks.net/icons/2/free-heart-icon-3510-thumb.png"
                    }
                    alt="" // Decorative, button has label
                    style={{ maxWidth: "30px", maxHeight: "30px" }}
                  />
                </button>
              </div>

              <div className={cx("product-rating")}>
                <span>
                  {"★".repeat(averageRating)}
                  {"☆".repeat(5 - averageRating)}
                </span>
                <span style={{ marginLeft: "10px", fontSize: "0.9em" }}>
                  ({reviews.length} reviews)
                </span>
              </div>

              <div className={cx("product-price")}>
                <span className={cx("current-price")}>${product?.price?.toFixed(2) ?? "0.00"}</span>
              </div>

              <p className={cx("product-description")}>{product?.description}</p>

              <div className={cx("product-options")}>
                <div className={cx("option-group")}></div>

                <div className={cx("option-group")}>
                  <label>Choose Size</label>
                  <div className={cx("size-selector")}>
                    {(product?.sizes || []).map((s) => (
                      <button
                        key={s.id}
                        className={cx("size-button", { selected: selectedSize === s.size })}
                        onClick={() => setSelectedSize(s.size)}
                        disabled={s.quantity === 0 || isAddingToCart }
                        type="button"
                      >
                        {s.size} {s.quantity === 0 ? "(Out of Stock)" : `(${s.quantity})`}
                      </button>
                    ))}
                    {(!product?.sizes || product.sizes.length === 0) && (
                      <div>No sizes available</div>
                    )}
                  </div>
                </div>
              </div>

              <div className={cx("product-actions")}>
                <div className={cx("quantity-adjuster")}>
                  <button type="button" onClick={() => handleQuantityChange(-1)} disabled={isAddingToCart}>
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    // FIX: Cleaned up disabled logic
                    disabled={isPlusDisabled}
                  >
                    +
                  </button>
                </div>

                <button
                  className={cx("add-to-cart-btn")}
                  onClick={handleAddToCart}
                  // FIX: Cleaned up disabled logic
                  disabled={isAddToCartDisabled}
                  type="button"
                >
                  {maxMoreCanAdd === 0 && selectedSize ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className={cx("reviews-section")}>
            <div className={cx("tabs")}>
              <button className={cx("tab-btn", "active")}>Rating & Reviews</button>
            </div>

            <div className={cx("reviews-header")}>
              <h2>
                All Reviews <span className={cx("review-count")}>({reviews.length})</span>
              </h2>
              <div>
                <button className={cx("latest-btn")} type="button">
                  Latest
                </button>
              </div>
            </div>

            <div className={cx("reviews-grid")}>
              {reviews.length === 0 && <p>No reviews for this product yet.</p>}
              {reviews.map((review) => (
                <div key={review.id} className={cx("review-card")}>
                  <div className={cx("review-card-header")}>
                    <div>
                      <span className={cx("review-rating")}>
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                      <h4>{usernames[review.author] ?? "Loading..."}</h4>
                    </div>
                  </div>

                  {imageFeedbacks[review.id] &&
                    imageFeedbacks[review.id].map((image) => (
                      <img
                        key={image.id}
                        src={image.imageFeedback}
                        className={cx("thumbnail")}
                        alt="feedback"
                        onClick={() => openModal(image.imageFeedback)}
                        style={{ cursor: "pointer" }}
                      />
                    ))}

                  <p>{review.text}</p>
                  <span className={cx("review-date")}>{(review.date || "").slice(0, 10)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modal for image */}
          {modalImage && (
            <div className={cx("modal")} onClick={closeModal} role="dialog" aria-modal="true">
              <span className={cx("close")} onClick={closeModal} style={{ cursor: "pointer" }}>
                &times;
              </span>
              <img className={cx("modal-content")} src={modalImage} alt="Full size" />
            </div>
          )}

          {/* Recommendations */}
          <div className={cx("recommendations")}>
            <h2>YOU MIGHT ALSO LIKE</h2>
            <div className={cx("product-grid")}>
              {recommended.length === 0 && <p>No recommendations found.</p>}
              {recommended.map((rec) => (
                <div
                  key={rec.id}
                  className={cx("product-card")}
                  onClick={() => handleRecommendedProductClick(rec.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRecommendedProductClick(rec.id);
                  }}
                >
                  <img
                    src={
                      (rec.images && rec.images[0] && (rec.images[0] as any).imageProduct) ||
                      "https://via.placeholder.com/150"
                    }
                    alt={rec.name}
                  />
                  <h3>{rec.name}</h3>
                  <p className={cx("price")}>${rec.price.toFixed(2)}</p>
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