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

interface AddressPayload {
    fullName: string;
    address: string;
    phoneNumber: string;
}

interface ModifyAddressResponse {
    message: string;
    address: AddressDelivery; 
}

interface AllAddressesResponse {
    message: string;
    addresses: AddressDelivery[]; 
}

interface SetDefaultAddressResponse {
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

export const getAllAddresses = async (): Promise<AddressDelivery[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("User not authenticated.");

    try {
        const response = await api.get<AllAddressesResponse>('/addresses', { 
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.addresses || [];
    } catch (error: any) {
        console.error("Failed to fetch all addresses:", error.response?.data || error.message || error);
        throw new Error(error.response?.data?.message || "Could not load addresses.");
    }
};

export const setDefaultAddress = async (addressId: string): Promise<AddressDelivery> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("User not authenticated.");

    try {
        const response = await api.patch<SetDefaultAddressResponse>(`/addresses/${addressId}/default`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.address; 
    } catch (error: any) {
        console.error(`Failed to set address ${addressId} as default:`, error.response?.data || error.message || error);
        throw new Error(error.response?.data?.message || "Could not update default address.");
    }
};

export const addAddress = async (payload: AddressPayload): Promise<AddressDelivery> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("User not authenticated.");

    try {
        const response = await api.post<ModifyAddressResponse>('/addresses', payload, { 
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.address;
    } catch (error: any) {
        console.error("Failed to add address:", error.response?.data || error.message || error);
        throw new Error(error.response?.data?.message || "Could not add address.");
    }
};

export const updateAddress = async (addressId: string, payload: Partial<AddressPayload>): Promise<AddressDelivery> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("User not authenticated.");

    try {
        const response = await api.put<ModifyAddressResponse>(`/addresses/${addressId}`, payload, { 
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.address;
    } catch (error: any) {
        console.error(`Failed to update address ${addressId}:`, error.response?.data || error.message || error);
        throw new Error(error.response?.data?.message || "Could not update address.");
    }
};