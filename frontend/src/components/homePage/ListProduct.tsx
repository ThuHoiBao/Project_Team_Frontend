import React, { useState } from "react";
import styles from "./ListProduct.module.scss";
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight} from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

export interface ProductImage {
  id: string;
  imageProduct: string; // URL ảnh
}

export interface Product {
  id: string;
  productName: string;
  listImage: ProductImage[];
  price: number;
}

export interface ProductSummary {
  averageRating: number;
  product: Product;
}


interface ListProductProps {
  title: string;
  data: ProductSummary[];
}

const ListProduct: React.FC<ListProductProps> = ({ title, data }) => {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 4; 
  
    const handlePrev = () => {
      setStartIndex((prev) => Math.max(prev - 1, 0));
    };
  
    const handleNext = () => {
      setStartIndex((prev) =>
        Math.min(prev + 1, data.length - itemsPerPage)
      );
    };

    const handleClick = (productId: string) => {
      try {
        window.location.href = `/product/${productId}`;
      } catch (error) {
        console.error("Error navigating to product:", error);
      }
    };
  
  return (
    <section className={cx("listProduct")}>
      <div className={cx("header")}>
        <h2>{title}</h2>
        <div className={cx("controls")}>
          <button className={cx("arrowBtn")} onClick={handlePrev}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <button className={cx("arrowBtn")} onClick={handleNext}>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>

      <div className={cx("viewport")}>
        <div
          className={cx("track")}
          style={{
            transform: `translateX(-${(100 / itemsPerPage) * startIndex}%)`,
            transition: "transform 0.5s ease",
            gridTemplateColumns: `repeat(${data.length}, 1fr)`,
          }}
        >
          {data.map((item) => (
            <div key={item.product.id} className={cx("card")}>
              <img
                src={item.product.listImage[0].imageProduct}
                alt={item.product.productName}
                onClick={() => handleClick(item.product.id)}
              />
              <h3>{item.product.productName}</h3>
              <p>${item.product.price}</p>
              <p>⭐ {item.averageRating}/5</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListProduct;
