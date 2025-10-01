import React, { useState, useEffect, useCallback } from 'react';
import Header from '../commonComponent/Header';
import Footer from '../commonComponent/Footer';
// Giả định đường dẫn service API của bạn
import { getWishlist, deleteFavoriteProduct } from "../../services/product/productDetailApi";
import './listFavoriteComponent.css'; // File CSS cho giao diện

// Interface tái sử dụng từ ProductDetailPage
interface WishlistItem {
    id: string; 
    product_id: string; 
    name: string;
    price: number;
    image: string; 
}

const WishlistPage: React.FC = () => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWishlist = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getWishlist();
            // Xử lý dữ liệu trả về để khớp với WishlistItem
            const formattedList: WishlistItem[] = response.data.map((item: any) => ({
                id: item.favoriteProduct.id, 
                product_id: item.favoriteProduct.product_id.id, 
                name: item.favoriteProduct.product_id.productName,
                price: item.favoriteProduct.product_id.price,
                image: item.imageProduct.imageProduct, 
            }));

            setWishlist(formattedList);
        } catch (err) {
            console.error("Lỗi khi tải Wishlist:", err);
            setError("Không thể tải danh sách yêu thích. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    // Hàm xử lý khi người dùng click vào nút xóa
    const handleRemoveFromWishlist = async ( productId: string) => {
        if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?`)) {
            return;
        }

        try {
            // Gọi API xóa (sử dụng favoriteId)
            await deleteFavoriteProduct(productId); 
            
            // Cập nhật state (Xóa sản phẩm đã xóa ra khỏi UI)
            setWishlist(prevList => prevList.filter(item => item.product_id !== productId));
            alert(`Đã xóa khỏi danh sách yêu thích.`);
        } catch (error) {
            console.error("Lỗi khi xóa khỏi Wishlist:", error);
            alert("Lỗi xảy ra trong quá trình xóa. Vui lòng thử lại.");
        }
    };
    
    // Hàm chuyển hướng đến trang chi tiết sản phẩm
    const handleViewProduct = (productId: string) => {
        window.location.href = `/product/${productId}`;
    };

    if (isLoading) {
        return (
            <div className="loading-state">
                <Header />
                <p>Đang tải danh sách yêu thích...</p>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="wishlist-page-container" style={{paddingTop: "40px"}}>
                <h1 className="page-title">💖 Danh sách Yêu thích của bạn ({wishlist.length})</h1>
                
                {error && <p className="error-message">{error}</p>}

                {wishlist.length === 0 && !isLoading ? (
                    <div className="empty-wishlist">
                        <p>Danh sách yêu thích của bạn đang trống.</p>
                        <button onClick={() => window.location.href = '/product'} className="go-shopping-btn">
                            Khám phá ngay!
                        </button>
                    </div>
                ) : (
                    <div className="wishlist-grid">
                        {wishlist.map((item) => (
                            <div key={item.id} className="wishlist-item-card">
                                <div className="card-image" onClick={() => handleViewProduct(item.product_id)}>
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="card-info">
                                    <h3 className="product-name-wishlist" onClick={() => handleViewProduct(item.product_id)}>
                                        {item.name}
                                    </h3>
                                    <p className="product-price-wishlist">${item.price.toFixed(2)}</p>
                                    
                                    <div className="card-actions">
                                        <button 
                                            className="action-btn remove-btn" 
                                            onClick={() => handleRemoveFromWishlist(item.product_id)}
                                        >
                                            ❌ Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default WishlistPage;