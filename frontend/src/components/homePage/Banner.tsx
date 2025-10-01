import React from "react";
import { Carousel } from "react-bootstrap";
import styles from "./Banner.module.scss";
import images from '../../assets/images';

const Banner: React.FC = () => {
  return (
    <div className={styles.banner}>
      <Carousel interval={5000}>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src={images.banner1}
            alt="Los Angeles"
          />
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src={images.banner2}
            alt="Chicago"
          />
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src={images.banner3}
            alt="New York"
          />
        </Carousel.Item>
      </Carousel>
    </div>
  );
};

export default Banner;
