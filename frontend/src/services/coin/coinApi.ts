import axios from "axios";

// Your Axios instance
const api = axios.create({
  baseURL: "http://localhost:8088/api",
});

// Interface updated to match the backend response
interface CoinBalanceResponse {
  message: string; // Added message field
  userId: string;
  coins: number;
}

// Function to get the coin balance
export const getCoinBalance = async (): Promise<number> => {
  const token = localStorage.getItem('token'); // Get token from storage

  // Handle case where user is not logged in (no token)
  if (!token) {
    console.warn("No token found for coin balance request.");
    // Decide how to handle: return 0 or throw an error?
    // Returning 0 might be suitable for display, but throwing might be better for logic control.
    // Let's throw an error for clarity, assuming balance requires login.
    throw new Error("User not authenticated.");
    // return 0; // Alternative: return 0 if that fits your UI logic better
  }

  try {
    // Make the GET request with the Authorization header
    const response = await api.get<CoinBalanceResponse>('/coins/balance', {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Return the 'coins' value from the response data, defaulting to 0 if undefined/null
    return response.data.coins ?? 0; // Use nullish coalescing for safety
  } catch (error: any) {
    // Log the detailed error for debugging
    console.error("Failed to fetch coin balance:", error.response?.data || error.message || error);

    // Throw a more user-friendly error message
    // Check if the error has a response from the server (like 401, 500)
    if (axios.isAxiosError(error) && error.response) {
       // Use the error message from the backend if available
       throw new Error(error.response.data?.message || "Could not load coin balance due to a server error.");
    } else {
       // Handle network errors or other issues
       throw new Error("Could not load coin balance. Check your network connection.");
    }
  }
};