import React, { useEffect, useState } from "react";

import classNames from 'classnames/bind';
import Banner from "./Banner";
import ListProduct from "./ListProduct";
import CustomerFeedback from "./CustomerFeedback";

import styles from "./HomePage.module.scss";
import Header from "../commonComponent/Header";
import Footer from "../commonComponent/Footer";
import ChatBot from "../chatBoxComponent/ChatBox";
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
    try {
      const [newProductResponse, topSellingProductsResponse, bestFeedbackResponse] = await Promise.all([
        getNewProducts(),
        getTopSellingProducts(),
        getBestFeedback().catch(() => []), // nếu lỗi feedback → trả mảng rỗng
      ]);

      setNewProducts(newProductResponse || []);
      setTopSellingProducts(topSellingProductsResponse || []);
      setBestFeedback(bestFeedbackResponse || []);
    } catch (error) {
      console.error("Error fetching home page data:", error);
    }
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

      {/* Chỉ render khi có feedback */}
      {bestFeedback && bestFeedback.length > 0 && (
        <CustomerFeedback data={bestFeedback} />
      )}

      <ChatBot />
    </div>
    <Footer />
  </>
);

};

export default HomePage;
