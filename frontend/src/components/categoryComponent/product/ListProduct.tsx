import React from "react";
import classNames from "classnames/bind";
import styles from "./ListProduct.module.scss";
import ItemProduct from "./ItemProduct";

const cx = classNames.bind(styles);

interface Product {
    id: number;
    name: string;
    image: string;
    rating: number;
    price: number;
}

interface ListProductProps {
    products: Product[];
}

const ListProduct: React.FC<ListProductProps> = ({products}) => {
    return (
        <div className={cx("productList")}> 
            {products.map((product) => ( 
            <ItemProduct key={product.id} product={product} /> ))}
         </div>

    )
}

export default ListProduct;