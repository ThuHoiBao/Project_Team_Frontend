import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import HeadlessTippy from "@tippyjs/react/headless";
import classNames from "classnames/bind";

// import * as searchServices from '~/apiServices/searchServices';
//import AccountItem from "~/components/AccountItem";
import { Wrapper as PopperWrapper } from "../Popper";
import styles from "./Search.module.scss";
import { SearchIcon } from "../Icons";
import { useDeBounce } from "../../../hooks";
import { searchProducts } from "../../../services/search/search";
import ProductItem from "../ProductItem";
import { Product } from "../../../services/search/search";

const cx = classNames.bind(styles);


function Search() {
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Product[]>([]);
  const [showResult, setShowResult] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const debounced = useDeBounce(searchValue, 500);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
        if (!debounced.trim()) {
            setSearchResult([]);
            setLoading(false);
            return;
        }

        const fetchAPi = async () => {
            setLoading(true);
            const result = await searchProducts(debounced);
            setSearchResult(result);
            setLoading(false);
        };
        fetchAPi();

    }, [debounced]);

  const handleClear = () => {
    setSearchValue("");
    setSearchResult([]);
    inputRef.current?.focus();
  };

  const handleHideResult = () => {
    setShowResult(false);
  };

  return (
    // Using a wrapper <div> tag around the reference element solves
    // this by creating a new parentNode context.
    <div>
      <HeadlessTippy
        interactive
        visible={showResult && searchResult.length > 0}
        render={(attrs) => (
          <div className={cx("search-result")} tabIndex={-1} {...attrs}>
            <PopperWrapper>
              <h4 className={cx("search-title")}>Sản phẩm</h4>
              {searchResult.map((result) => (
                <ProductItem key={result._id} data={result} />
              ))}
            </PopperWrapper>
          </div>
        )}
        onClickOutside={handleHideResult}
      >
        <div className={cx("search")}>
          <input
            ref={inputRef}
            value={searchValue}
            placeholder="Search for products"
            spellCheck={false}
            onChange={(e) => {
              if (!e.target.value.startsWith(" ")) {
                setSearchValue(e.target.value);
              }
            }}
            onFocus={() => setShowResult(true)}
          />
          {!!searchValue && !loading && (
            <button className={cx("clear")} onClick={handleClear}>
              <FontAwesomeIcon icon={faCircleXmark} />
            </button>
          )}

          {loading && (
            <FontAwesomeIcon className={cx("loading")} icon={faSpinner} />
          )}
          <button
            className={cx("search-btn")}
            onMouseDown={(e) => e.preventDefault()}
          >
            <SearchIcon />
          </button>
        </div>
      </HeadlessTippy>
    </div>
  );
}

export default Search;
