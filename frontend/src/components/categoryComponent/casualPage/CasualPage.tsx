import React, { useEffect } from "react";
import FilterSidebar, { FilterValues } from "../navigation/FilterSidebar";
import classNames from 'classnames/bind';
import Header from "../../commonComponent/Header";
import Footer from "../../commonComponent/Footer";
import styles from "./CasualPage.module.scss";
import Button from "../../commonComponent/Button";
import ListProduct from "../product/ListProduct";
import Pagination from "../pagination/Pagination"

import { useState } from "react";
import { getCategories, getFilteredProducts } from "../../../services/product/productDetailApi";
import { useLocation } from "react-router-dom";

const cx = classNames.bind(styles);

//Data Category for Sidebar
  // const categories = [
  //   { id: "68d2c4f9054fe5f627ba97ef", categoryName: "T-Shirts" },
  //   { id: "68d2c4f9054fe5f627ba97f0", categoryName: "Shirts" },
  //   { id: "68d2c4f9054fe5f627ba97f1", categoryName: "Jeans" },
  // ];
 interface Category {
  id: string;
  categoryName: string;
}



const CasualPage: React.FC = () => {
  const location = useLocation();
  const {categoryId} = location.state || {}; // lấy id từ state
  console.log("categoryId được truyền: ", categoryId)

  //Data Size for Sidebar
  const sizes = ["S", "M", "L", "XL", "XXL"];

  //Paganition select default
  const [products, setProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([categoryId]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<string>("none"); 

  const handleApplyFilters = (filters: FilterValues) => {
    const { category, priceRange, size, rating} = filters;
    setSelectedCategories(category);
    setPriceRange(priceRange);
    setSelectedSizes(size);
    setSelectedRating(rating ?? null);
    setCurrentPage(1); // reset về trang 1 khi thay đổi filter
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // reset về trang 1 khi thay đổi sort
  };

  // Fetch products khi filter/page thay đổi
  useEffect(() => {
    const fetchCatgories = async()=>{
      try{
          const categoriesResponse = await getCategories();
          setCategories(categoriesResponse.message);
      }
      catch (err) {
        console.error("Error fetching products:", err);
      }
    }

    const fetchProducts = async () => {
      try {
        const result = await getFilteredProducts({
          category: selectedCategories,
          priceRange,
          size: selectedSizes,
          rating: selectedRating ?? undefined,
          sort: sortOption || undefined,
          page: currentPage,
          limit: 9,
        });

        setProducts(result.products);
        setTotalPages(Math.ceil(result.total / result.limit));
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchCatgories();
    fetchProducts();
  }, [selectedCategories, priceRange, selectedSizes, selectedRating, sortOption, currentPage]); 


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
                  <select id="sortSelect" className={styles.sortSelect} value={sortOption} onChange={handleSortChange}>
                    <option value="priceLowHigh">Price: Low to High</option>
                    <option value="priceHighLow">Price: High to Low</option>
                    <option value="ratingHighLow">Highest Rating</option>
                    <option value="newest">Newest</option>
                    <option value="none">No sort</option>
                  </select>
              </div>
              </div>
          </div>
          <ListProduct products={products} />
          <hr></hr>
           <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
          />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CasualPage;
