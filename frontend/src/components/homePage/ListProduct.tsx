import React from "react";
import styles from "./ListProduct.module.scss";
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  rating: number;
  image: string;
}

interface ListProductProps {
  title: string;
  data: Product[];
}

const ListProduct: React.FC<ListProductProps> = ({ title, data }) => {
  return (
    <section className={cx("listProduct")}>
      <h2>{title}</h2>
      <div className={cx("grid")}>
        {data.map((item) => (
          <div key={item.id} className={cx("card")}>
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p>${item.price}</p>
            {item.oldPrice && (
              <p className={styles.oldPrice}>${item.oldPrice}</p>
            )}
            {item.discount && (
              <span className={styles.discount}>{item.discount}</span>
            )}
            <p>⭐ {item.rating}/5</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ListProduct;
