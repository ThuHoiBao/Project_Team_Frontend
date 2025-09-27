import axios from "axios";

// Tạo instance riêng
const api = axios.create({
  baseURL: "http://localhost:8088/api",
});

interface ProductImage{
  imageProduct: string,
}

export interface Product{
    _id: string, 
    productName: string,
    productNameNormalized: string, 
    listImage: ProductImage[],
    description: string, 
    descriptionNormalized: string,
    price: number, 
    quantity: number, 
    category: string, 
    status: boolean, 
    createDate: string,
    updateDate: string
}

interface SearchResponse{
    products: Product[]
    total: number, 
    currentPage: number, 
    totalPages: number
}

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const res = await api.get<SearchResponse>(
      `http://localhost:8088/api/product/search?q=${query}`
    );

    // Lấy 4 sản phẩm đầu tiên
    return res.data.products.slice(0, 4);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

