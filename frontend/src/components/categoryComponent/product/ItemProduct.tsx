import React from "react";
import classNames from "classnames/bind";
import styles from "./ItemProduct.module.scss";

const cx = classNames.bind(styles);

interface ItemProductProps {
  product: {
    image: string;
    name: string;
    rating: number;
    price: number;
  };
}

const ItemProduct: React.FC<ItemProductProps> = ({ product }) => {
  return (
    <div className={cx("productCard")}>
      <img
        src={product.image}
        alt={product.name}
        className={cx("productImage")}
      />

      <h3 className={cx("productName")}>{product.name}</h3>

      <div className={cx("productRating")}>
        {"★".repeat(product.rating) + "☆".repeat(5 - product.rating)}
      </div>

      <div className={cx("productPrice")}>${product.price.toFixed(2)}</div>
    </div>
  );
};

export default ItemProduct;
