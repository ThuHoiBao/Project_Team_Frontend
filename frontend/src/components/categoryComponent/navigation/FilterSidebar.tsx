import React, { useState } from "react";
import styles from "./FilterSidebar.module.scss";
import classNames from "classnames/bind";
import images from "../../../assets/images";
import { Slider } from "antd"; // antd Slider
import "rc-slider/assets/index.css";

const cx = classNames.bind(styles);

export interface FilterValues {
  category: string[];
  priceRange: [number, number];
  size: string[];
}

interface FilterSidebarProps {
  onApply: (filters: FilterValues) => void;
  categories: { id: string; categoryName: string }[];
  sizes: string[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  onApply,
  categories,
  sizes,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const handleRatingChange = (star: number) => {
    setSelectedRating((prev) => (prev === star ? null : star));
  };
    const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSizeChange = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleApply = () => {
    onApply({
      category: selectedCategories,
      priceRange,
      size: selectedSizes,
    });
  };

  return (
    <aside className={cx("sidebar")}>
      <div className={cx("sideBar-header")}>
        <h3 className={cx("sideBar-title")}>Filters</h3>
        <img className={cx("sideBar-icon")} src={images.vector} alt="icon" />
      </div>
      <hr />

      {/* Category */}
      <div className={cx("filterGroup")}>
        <h4>Category</h4>
        {categories.map((cat) => (
          <label key={cat.id} className={cx("checkbox")}>
            <input
              type="checkbox"
              checked={selectedCategories.includes(cat.id)}
              onChange={() => handleCategoryChange(cat.id)}
            />
            {cat.categoryName}
          </label>
        ))}
      </div>

      {/* Price */}
      <div className={cx("filterGroup")}>
        <div className={cx("filter-header")}>
          <h4>Price</h4>
        </div>
        <Slider
          range
          min={0}
          max={300}
          value={priceRange}
          onChange={(val) => setPriceRange(val as [number, number])}
          trackStyle={[{ backgroundColor: "black", height: 5 }]}
          railStyle={{ backgroundColor: "#eee", height: 5 }}
          tooltip={{ formatter: (value) => `$${value}` }} 
        />
         <div className={cx("price-range-display")}>
          <span className={cx("price-min")}>${priceRange[0]}</span>
          <span className={cx("price-max")}>${priceRange[1]}</span>
        </div>
      </div>
    
      <hr />
      {/* Size */}
      <div className={cx("filterGroup")}>
        <h4>Size</h4>
        <div className={cx("sizeList")}>
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              className={cx("sizeBtn", {
                active: selectedSizes.includes(s),
              })}
              onClick={() => handleSizeChange(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <hr/>
      <div className={cx("filterGroup")}>
        <h4>Evaluate</h4>
        <div className={cx("ratingList")}>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              className={cx("ratingBtn", {
                active: selectedRating === star,
              })}
              onClick={() => handleRatingChange(star)}
            >
              {"★".repeat(star) + "☆".repeat(5 - star)}
            </button>
          ))}
        </div>
      </div>


      <button className={cx("applyBtn")} onClick={handleApply}>
        Apply Filter
      </button>
    </aside>
  );
};

export default FilterSidebar;
