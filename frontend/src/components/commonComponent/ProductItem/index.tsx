import classNames from "classnames/bind";
import styles from "./Product.module.scss";
import { Link } from "react-router-dom";
import { Product } from "../../../services/search/search";

const cx = classNames.bind(styles);

interface ProductItemProps {
  data: Product;
}

function ProductItem({ data }: ProductItemProps) {
  return (
    <Link to={`/product/${data._id}`} className={cx("wrapper")}>
      {/* Nếu có ảnh thì hiển thị */}
      <img className={cx("avatar")} src={data.listImage[0]?.imageProduct} alt={data.productName} />

      <div className={cx("info")}>
        <h4 style={{textDecoration: "none", color: "black"}} className={cx("name")}>
          <span style={{textDecoration: "none", color: "black"}}>{data.productName}</span>
        </h4>
        <span className={cx("price")}>
          {data.price.toLocaleString("vi-VN")} đ
        </span>
      </div>
    </Link>
  );
}

export default ProductItem;
