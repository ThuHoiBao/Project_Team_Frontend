import React from "react";
import FilterSidebar, { FilterValues } from "../navigation/FilterSidebar";
import classNames from 'classnames/bind';
import Header from "../../commonComponent/Header";
import Footer from "../../commonComponent/Footer";
import styles from "./CasualPage.module.scss";
import Button from "../../commonComponent/Button";
import ListProduct from "../product/ListProduct";
import Pagination from "../pagination/Pagination"


import tshirtImg from "../../../assets/images/aoSoMi.jpg";
import jeansImg from "../../../assets/images/aoTheDuc.jpg";
import shirtImg from "../../../assets/images/aoThun.jpg";

import { useState } from "react";

const cx = classNames.bind(styles);
const CasualPage: React.FC = () => {

  //Data Category for Sidebar
  const categories = [
    { id: "1", categoryName: "T-Shirts" },
    { id: "2", categoryName: "Shirts" },
    { id: "3", categoryName: "Jeans" },
    { id: "4", categoryName: "Jackets" },
  ];


  //Data products
  const sampleProducts = 
    [ 
      { id: 1, name: "iPhone 15 Pro", image: tshirtImg, rating: 5, price: 29990000 }, 
      { id: 2, name: "Samsung Galaxy S24",  image: jeansImg, rating: 4, price: 21990000 }, 
      { id: 3, name: "Xiaomi 14 Ultra",   image: shirtImg, rating: 4, price: 17990000 }, 
      { id: 4, name: "iPhone 15 Pro", image: tshirtImg, rating: 5, price: 29990000 }, 
      { id: 5, name: "Samsung Galaxy S24",  image: jeansImg, rating: 4, price: 21990000 }, 
      { id: 6, name: "Xiaomi 14 Ultra",   image: shirtImg, rating: 4, price: 17990000 }, 
      { id: 7, name: "iPhone 15 Pro", image: tshirtImg, rating: 5, price: 29990000 }, 
      { id: 8, name: "Samsung Galaxy S24",  image: jeansImg, rating: 4, price: 21990000 }, 
      { id: 9, name: "Xiaomi 14 Ultra",   image: shirtImg, rating: 4, price: 17990000 }, 
      { id: 10, name: "iPhone 15 Pro", image: tshirtImg, rating: 5, price: 29990000 }, 
      { id: 11, name: "Samsung Galaxy S24",  image: jeansImg, rating: 4, price: 21990000 }, 
      { id: 12, name: "Xiaomi 14 Ultra",   image: shirtImg, rating: 4, price: 17990000 }, 
    ];


  //Data Size for Sidebar
  const sizes = ["S", "M", "L", "XL", "XXL"];


  //Paganition select default
  const [currentPage, setCurrentPage] = useState(1);

  const handleApplyFilters = (filters: FilterValues) => {
    console.log("Filters applied:", filters);
  };

  return (
   <div className={styles.page}>
      <Header />
     <div className={cx('breadcrumb')}>
        <Button text to='/home'>Home</Button>
        <span className={cx('separator')}>{'>'}</span>
        <Button text className={cx('active')}>Casual</Button>
    </div>
      <div className={styles.body}>
        <FilterSidebar
          onApply={handleApplyFilters}
          categories={categories}
          sizes={sizes}
        />
        <main className={styles.content}>
           <div className={styles.headerBar}>
              <h2 className={styles.title}>Casual</h2>
              <div className={styles.info}>
                <span>Showing 1-10 of 100 Products</span>
                <div className={styles.sort}>
                  <label htmlFor="sortSelect">Sort by:</label>
                  <select id="sortSelect" className={styles.sortSelect}>
                    <option value="priceLowHigh">Price: Low to High</option>
                    <option value="priceHighLow">Price: High to Low</option>
                    <option value="rating">Highest Rating</option>
                    <option value="newest">Newest</option>
                      <option value="newest">No sort</option>
                  </select>
              </div>
              </div>
          </div>
          <ListProduct products={sampleProducts} />
          <hr></hr>
           <Pagination
              currentPage={currentPage}
              totalPages={10}
              onPageChange={(page) => setCurrentPage(page)}
          />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CasualPage;
