import React from "react";
import classNames from "classnames/bind";
import styles from "./ListProduct.module.scss";
import ItemProduct, {ProductImage} from "./ItemProduct";

const cx = classNames.bind(styles);

interface Product {
    _id: string
    listImage: ProductImage[];
    productName: string;
    averageRating: number;
    price: number;
    createDate: string;
}

interface ListProductProps {
    products: Product[];
}

const ListProduct: React.FC<ListProductProps> = ({products}) => {
    return (
        <div className={cx("productList")}> 
            {products.map((product) => ( 
            <ItemProduct key={product._id} product={product} /> ))}
         </div>

    )
}

export default ListProduct;