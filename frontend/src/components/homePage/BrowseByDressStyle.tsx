import { Link } from "react-router-dom";
import styles from "./BrowseByDressStyle.module.scss";
import images from "../../assets/images";

type Category = {
  name: string;
  image: keyof typeof images; // đảm bảo image phải khớp với key trong images
};

const categories: Category[] = [
  {
    name: "Áo thun",
    image: "aoThun",
  },
  {
    name: "Áo sơ mi",
    image: "aoSoMi",
  },
  {
    name: "Áo thể dục",
    image: "aoTheDuc",
  },
];

const BrowseByDressStyle = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>BROWSE BY DRESS STYLE</h2>
      <div className={styles.grid}>
        {categories.map((category) => (
          <Link to="/home" key={category.name} className={styles.card}>
            <img src={images[category.image]} alt={category.name} />
            <span className={styles.label}>{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BrowseByDressStyle;
