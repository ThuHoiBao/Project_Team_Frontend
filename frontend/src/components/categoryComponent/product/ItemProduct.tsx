import React from "react";
import classNames from "classnames/bind";
import styles from "./ItemProduct.module.scss";

const cx = classNames.bind(styles);

export interface ProductImage {
  imageProduct: string;
}

interface ItemProductProps {
  product: {
    _id: string
    listImage: ProductImage[];
    productName: string;
    averageRating: number;
    price: number;
    createDate: string;
  };
}

const ItemProduct: React.FC<ItemProductProps> = ({ product }) => {
  const handleClick = (productId: string) => {
    try {
      window.location.href = `/product/${productId}`;
    } catch (error) {
      console.error("Error navigating to product:", error);
    }
  };

  return (
    <div className={cx("productCard")}>
      <img
        src={product.listImage[0].imageProduct}
        alt={product.productName}
        className={cx("productImage")}
        onClick={() => handleClick(product._id)}
      />

      <h3 className={cx("productName")}>{product.productName}</h3>

      <div className={cx("productRating")}>
        {"★".repeat(product.averageRating) + "☆".repeat(5 - product.averageRating)}
      </div>

      <div className={cx("productPrice")}>
        {product?.price ?
          new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)
          : '0 ₫'}
      </div>
    </div>
  );
};

export default ItemProduct;
