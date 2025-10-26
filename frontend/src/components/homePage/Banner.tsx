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
            src={images.banner4}
            alt="Banner 1"
          />
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src={images.banner5}
            alt="Banner 2"
          />
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src={images.banner6}
            alt="Banner 3"
          />
        </Carousel.Item>
      </Carousel>
    </div>
  );
};

export default Banner;
