import React, { useState } from "react";
import styles from "./CustomerFeedback.module.scss";
import classNames from "classnames/bind";
import { CheckCircleIcon } from "../commonComponent/Icons";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight} from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

interface Feedback {
  name: string;
  comment: string;
  rating: number;
}

interface CustomerFeedbackProps {
  data: Feedback[];
}

const CustomerFeedback: React.FC<CustomerFeedbackProps> = ({ data }) => {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 3; // số feedback hiển thị cùng lúc

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      Math.min(prev + 1, data.length - itemsPerPage)
    );
  };

  return (
    <section className={cx("feedback")}>
      {/* Header */}
      <div className={cx("header")}>
        <h2>Our Happy Customers</h2>
        <div className={cx("controls")}>
          <button className={cx("arrowBtn")} onClick={handlePrev}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <button className={cx("arrowBtn")} onClick={handleNext}>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>

      {/* Feedback list */}
      <div className={cx("viewport")}>
        <div
          className={cx("track")}
          style={{
            transform: `translateX(-${(100 / itemsPerPage) * startIndex}%)`,
            transition: "transform 0.5s ease",
          }}
        >
          {data.map((fb, index) => (
            <div key={index} className={cx("card")}>
              <p>{"⭐".repeat(fb.rating)}</p>
              <h4>
                {fb.name} <CheckCircleIcon className={cx("verifiedIcon")} />
              </h4>
              <p>{fb.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerFeedback;
