import { Link } from "react-router-dom";
import styles from "./BrowseByDressStyle.module.scss";
import images from "../../assets/images";
import { useEffect, useState } from "react";
import { getCategories } from "../../services/product/productDetailApi";

type Category = {
  id: string;
  name: string;
  image: keyof typeof images;
};

// ánh xạ categoryName từ API -> image key
const categoryImageMap: Record<string, keyof typeof images> = {
  "Áo Thun": "aoThun",
  "Áo sơ mi": "aoSoMi",
  "Áo thể dục": "aoTheDuc"
};

const BrowseByDressStyle = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCatgories = async()=>{
      try{
          const data = await getCategories();
          const mapped: Category[] = data.message.map((item: any) => ({
            id: item.id,
            name: item.categoryName,
            image: categoryImageMap[item.categoryName] || "noImage", 
          }));
          setCategories(mapped);
      }
      catch (err) {
        console.error("Error fetching products:", err);
      }
    }
    fetchCatgories();
  }, []); 



  return (
    <div className={styles.container}>
      <h2 className={styles.title}>BROWSE BY DRESS STYLE</h2>
      <div className={styles.grid}>
        {categories.map((category) => (
          <Link
            to="/casual"
            state={{ categoryId: category.id }}
            key={category.id}
            className={styles.card}
          >
            <img src={images[category.image]} alt={category.name} />
            <span className={styles.label}>{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BrowseByDressStyle;
