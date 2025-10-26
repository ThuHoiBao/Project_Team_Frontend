import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8088/api",
});

const getToken = () => localStorage.getItem('token');

interface CreateVnpayUrlPayload {
    orderId: string;
    orderDescription: string;
    bankCode?: string;
    language?: string;
}

export interface VnpayResponse {
    code: string;
    message: string;
    data: string;
}

// Function to get the VNPAY URL from backend
export const createVnpayUrl = async (payload: CreateVnpayUrlPayload): Promise<VnpayResponse> => {
    const token = getToken();
    if (!token) throw new Error("User not authenticated.");

    console.log('🔗 === CALLING VNPAY API ===');
    console.log('URL:', 'http://localhost:8088/api/payment/create_payment_url');
    console.log('Payload:', payload);
    console.log('Token exists:', !!token);

    try {
        const response = await api.post<VnpayResponse>(
            '/payment/create_payment_url', 
            payload, 
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        console.log('✅ === VNPAY API RESPONSE ===');
        console.log('Status:', response.status);
        console.log('Data:', response.data);

        return response.data;
    } catch (error: any) {
        console.error('❌ === VNPAY API ERROR ===');
        console.error('Status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Error message:', error.message);
        
        throw new Error(error.response?.data?.message || "Could not create payment URL.");
    }
};

// paymentApi.ts - ADD NEW FUNCTION
export const createCodOrder = async (payload: any) => {
    const token = getToken();
    const response = await api.post('/order/create-cod', payload, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

