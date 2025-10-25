import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8088/api",
});

export interface AddressDelivery {
    id: string; 
    user?: string; 
    address: string;
    fullName: string;
    phoneNumber: string;
    isDefault: boolean;
}

interface DefaultAddressResponse {
    message: string;
    address: AddressDelivery; 
}

export const getDefaultAddress = async (): Promise<AddressDelivery | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn("No token found for address request.");
        throw new Error("User not authenticated."); 
    }

    try {
        const response = await api.get<DefaultAddressResponse>('/addresses/default', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.address || null; 
    } catch (error: any) {
        console.error("Failed to fetch default address:", error.response?.data || error.message || error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null;
        }
        throw new Error(error.response?.data?.message || "Could not load delivery address.");
    }
};
