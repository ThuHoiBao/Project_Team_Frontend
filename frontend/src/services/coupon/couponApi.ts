import axios from "axios";
import { format } from 'date-fns'; // Use date-fns for formatting

// Create axios instance (as you provided)
const api = axios.create({
  baseURL: "http://localhost:8088/api",
});

export interface Coupon {
    id: string; 
    code: string;
    discountValue: number;
    maxDiscount?: number; 
    startDate: string; 
    endDate: string;
    isActive: boolean;
    usedCount: number;
    createdAt?: string;
    updatedAt?: string;
}


interface CouponsApiResponse {
    message: string;
    coupons: Coupon[]; 
}


export const getAvailableCoupons = async (): Promise<Coupon[]> => {
    console.log("API: Fetching available coupons...");
    try {
        // GET request to the correct endpoint
        const response = await api.get<CouponsApiResponse>('/coupons/available');
        // Return the 'coupons' array from the response data
        return response.data.coupons || [];
    } catch (error) {
        console.error("Failed to fetch available coupons:", error);
        // Throw a user-friendly error or return empty array
        throw new Error("Could not load available coupons. Please try again later.");
    }
};

interface ApplyCouponResponse {
    message: string;
    coupon: Coupon;
}

export const applyCouponCode = async (code: string): Promise<Coupon> => {
    console.log(`API: Applying code "${code}"...`);
    try {
        const response = await api.post<ApplyCouponResponse>('/coupons/apply', { code });
        return response.data.coupon;
    } catch (error: any) {
        console.error("Failed to apply coupon code:", error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.message || `Failed to apply coupon "${code}".`);
        }
        throw new Error(`Failed to apply coupon "${code}".`);
    }
};


export const formatDate = (dateString: string): string => {
    try {
        return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
        return 'Invalid Date';
    }
};


export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
