import React, { useEffect, useState } from "react";

import classNames from 'classnames/bind';
import Banner from "./Banner";
import ListProduct from "./ListProduct";
import CustomerFeedback from "./CustomerFeedback";

import styles from "./HomePage.module.scss";
import Header from "../commonComponent/Header";
import Footer from "../commonComponent/Footer";
import BrowseByDressStyle from "./BrowseByDressStyle";
import { getNewProducts, getTopSellingProducts } from "../../services/product/productDetailApi";
import { getBestFeedback } from "../../services/feedback/feedbackApi";
import Login from "../auth/login2/Login";


const cx = classNames.bind(styles);

const HomePage: React.FC = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [bestFeedback, setBestFeedback] = useState([]);
  
  useEffect(() => {
    const fetchAPi = async () => {
        const newProductResponse = await getNewProducts();
        const topSellingProductsResponse = await getTopSellingProducts();
        const bestFeedbackResponse = await getBestFeedback();
        setNewProducts(newProductResponse);
        setTopSellingProducts(topSellingProductsResponse);
        setBestFeedback(bestFeedbackResponse);
    };
    fetchAPi();
  }, []);

  console.log(newProducts);
  console.log(topSellingProducts);
  console.log(bestFeedback);

  return (
    <>
      <Header/>
      <Banner />
      <div className={cx("container")}>
        <ListProduct title="New Arrivals" data={newProducts} />
        <hr className={cx("divider")} />
        <ListProduct title="Top Selling" data={topSellingProducts} />
        <BrowseByDressStyle/>
        <CustomerFeedback data={bestFeedback} />
      </div>
      <Footer />

    </>
  );
};

export default HomePage;
