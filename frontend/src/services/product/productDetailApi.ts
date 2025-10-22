import axios from "axios";

// Tạo instance riêng
const api = axios.create({
  baseURL: "http://localhost:8088/api",
});


const apiAuth = axios.create({
  baseURL: "http://localhost:8088/api",
});

// Thêm Interceptor chỉ cho instance này
apiAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  else {
    console.warn("⚠️ No token found, redirecting to login...");
  }
  return config;
},
  (error) => {
    return Promise.reject(error);
  }
);

apiAuth.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("❌ Token expired or unauthorized, redirecting...");
      localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getProductDetail = async (id: string) => {
  const response = await api.get(`product/${id}`);
  return response.data
};
export const getSizes = async (id: string) => {
  const response = await api.get(`/product/size/${id}`);
  return response.data;
};

export const getProductByCategory = async (id: string, productId: string) => {
  const response = await api.get(`/product/category/${id}/${productId}`);
  return response.data;
};

export const getFullnameUserFeedback = async (id: string) => {
  const response = await api.get(`/product/feedback/user/${id}`);
  return response.data;
};

export const getImageFeedbacks = async (id: string) => {
  const response = await api.get(`/feedback/image/${id}`);
  return response.data;
}


export const getNewProducts = async () => {
  const response = await api.get('product/new');
  return response.data.data;
}

export const getTopSellingProducts = async () => {
  const response = await api.get('product/top-selling');
  return response.data.data;
}

export const saveFavoriteProduct = async (id?: string) => {
  const response = await apiAuth.post(`/product/wishlist/add/${id}`);
  return response.data;
}

export const deleteFavoriteProduct = async (id?: string) => {
  const response = await apiAuth.delete(`/product/wishlist/delete/${id}`);
  return response.data;
}

export const checkExistedWishlist = async (id?: string) => {
  const response = await apiAuth.get(`/product/wishlist/existed/${id}`);
  return response.data.existed;
}

export const getWishlist = async () => {
  const response = await apiAuth.get("/product/wishlist")
  return response.data;
}