import axios from "axios";
import toast from "react-hot-toast";
import { store } from "../app/store";
import { BACKEND_API } from "./Backend_API";

// BASE CONFIG
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1/";

// Built-in custom method which use for set Base url, withcredentials, headers etc.
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 15000,
});

// Between transfer request from component of Frontend to Backend request comes here. It's the middle positon 
// between frontend and Backend
api.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const accessToken =
            state?.auth?.accessToken;
        if (accessToken) {
            config.headers.Authorization =
                `Bearer ${accessToken}`;
        }
        console.log(
            `🚀 ${config.method?.toUpperCase()} ${config.url}`,
            {
                data: config.data,
                params: config.params,
            }
        );
        return config;
    },
    (error) => {
        console.error(
            "❌ Request Interceptor Error:",
            error
        );
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (
    error,
    token = null
) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => {
        console.log(
            `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
            response.data
        );
        return response;
    },
    async (error) => {
        const originalRequest =
            error.config;
        const status =
            error.response?.status;
        const message =
            error.response?.data?.message ||
            error.message ||
            "Something went wrong!";
        console.error(
            `❌ API Error => ${originalRequest?.url}`,
            {
                status,
                message,
                data: error.response?.data,
            }
        );
        if (
            status === 401 &&
            !originalRequest._retry
        ) {
            if (isRefreshing) {
                return new Promise(
                    (resolve, reject) => {
                        failedQueue.push({
                            resolve,
                            reject,
                        });
                    }
                )
                    .then((token) => {
                        originalRequest.headers.Authorization =
                            `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) =>
                        Promise.reject(err)
                    );
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                const response =
                    await axios.post(
                        `${API_URL}/auth/refreshAccessToken`,
                        {},
                        {
                            withCredentials: true,
                        }
                    );
                const newAccessToken =
                    response.data?.data?.accessToken;
                store.dispatch(
                    setAccessToken(
                        newAccessToken
                    )
                );
                processQueue(
                    null,
                    newAccessToken
                );
                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                console.error(
                    "❌ Refresh Token Failed:",
                    refreshError
                );
                processQueue(
                    refreshError,
                    null
                );
                store.dispatch(logout());
                toast.error(
                    "Session expired. Please login again."
                );
                window.location.href =
                    "/login";
                return Promise.reject(
                    refreshError
                );
            } finally {
                isRefreshing = false;
            }
        }
        if (!error.response) {
            toast.error(
                "Server is not responding!"
            );
            return Promise.reject({
                success: false,
                statusCode: 500,
                message:
                    "Server is not responding!",
            });
        }
        if (status !== 401) {
            toast.error(message);
        }
        return Promise.reject({
            success: false,
            statusCode: status,
            message,
            data:
                error.response?.data || null,
        });
    }
);

// COMMON API REQUEST HANDLER
const apiRequest = async (
    apiCall
) => {
    try {
        const response =
            await apiCall();
        return {
            success: true,
            statusCode:
                response.status,
            message:
                response.data?.message ||
                "Request successful",
            data:
                response.data?.data ||
                response.data,
        };
    } catch (error) {
        throw {
            success: false,
            statusCode:
                error.statusCode || 500,
            message:
                error.message ||
                "Something went wrong",
            data:
                error.data || null,
        };
    }
};

// AUTH API
export const authAPI = {

    sendOTP: async (data) =>
        apiRequest(() =>
            api.post(
                "auth/sendOTP",
                data
            )
        ),

    verifyOTP: async (data) =>
        apiRequest(() =>
            api.post(
                "auth/verifyOTP",
                data
            )
        ),

    register: async (data) =>
        apiRequest(() =>
            api.post(
                "auth/register",
                data
            )
        ),

    login: async (data) =>
        apiRequest(() =>
            api.post(
                "auth/login",
                data
            )
        ),

    logout: async () =>
        apiRequest(() =>
            api.post(
                "auth/logout", {},
            )
        ),

    refreshAccessToken: async () =>
        apiRequest(() =>
            api.post(
                "/refreshAccessToken"
            )
        ),

    getMe: async () =>
        apiRequest(() =>
            api.get("/auth/me")
        ),

    forgotPassword: async (email) =>
        apiRequest(() =>
            api.post(
                "/auth/forgot-password",
                { email }
            )
        ),

    resetPassword: async (data) =>
        apiRequest(() =>
            api.post(
                "/auth/reset-password",
                data
            )
        ),

    profilePicChange: async (data) =>
        apiRequest(() =>
            api.post(
                "/api/profilePicChange",
                data
            )
        ),

    profileAboutChange: async (data) =>
        apiRequest(() =>
            api.post(
                "/api/profileAboutChange",
                data
            )
        ),
};

export const buyerAPI = {

    getProducts: async () =>
        apiRequest(() =>
            api.get("/buyer/getProducts")
        ),
}

export const cartAPI = {

    // Create cart / Add product to cart
    createCart: async ({ userId, productDetails }) =>
        apiRequest(() =>
            api.post("cart/createCart", {
                userId, productDetails
            })
        ),

    // Get user's cart
    getCart: async (userId) =>
        apiRequest(() =>
            api.get("cart/getCart", {
                params: { userId },
            })
        ),

    // Remove a particular product from cart
    removeCartItem: async ({ userId, productId }) =>
        apiRequest(() =>
            api.post(`cart/removeCartItem/${productId}`, {
                userId,
            })
        ),

    // Delete the entire cart
    deleteCart: async (userId) =>
        apiRequest(() =>
            api.post("cart/deleteCart", { userId })
        ),
};

export const sellerAPI = {

    sellerRequest: async (data) =>
        apiRequest(() =>
            api.post(
                "/seller/sellerRequest",
                data
            )
        ),
}

export const superAdminAPI = {

    // Get all seller requests
    getSellerRequests: async () =>
        apiRequest(() =>
            api.get("superAdmin/sellerRequest")
        ),

    // Reject seller request
    sellerRequestReply: async (buyerId, requestReply, rejectionReason) =>
        apiRequest(() =>
            api.post("superAdmin/sellerRequestReply", { buyerId, requestReply, rejectionReason })
        ),

    // Approve seller request
    getSeller: async () =>
        apiRequest(() =>
            api.get("superAdmin/sellers")
        ),

    getSellerById: async (requestId) =>
        apiRequest(() =>
            api.patch(
                `superAdmin/sellersDetails`
            )
        ),

    getProducts: async () =>
        apiRequest(() =>
            api.get("superAdmin/products")
        ),

    uploadAdvertisement: async (formData) =>
        apiRequest(() =>
            api.post(
                "/superAdmin/uploadAdvertisement",
                formData,
            )
        ),

    getAdvertisements: async (superAdminId) =>
        apiRequest(() =>
            api.post(
                "/superAdmin/getAdvertisement",
                { superAdminId },
            )
        ),

    getAllAdvertisements: async () =>
        apiRequest(() =>
            api.post(
                "/superAdmin/getAllAdvertisement"
            )
        ),

    updateProductStatus: async (productId, status, rejectionReason = "") =>
        apiRequest(() =>
            api.patch("/superAdmin/product-status", {
                productId,
                status,
                rejectionReason
            })
        ),

    // Get particular seller request
    getSellerRequestById: async (requestId) =>
        apiRequest(() =>
            api.get(
                `/admin/seller-requests/${requestId}`
            )
        ),

    // Get buyer/user 
    getBuyer: async (userId) =>
        apiRequest(() =>
            api.get(
                `/admin/buyers/${userId}`
            )
        ),

    // Get particular buyer/user details
    getBuyerById: async (userId) =>
        apiRequest(() =>
            api.get(
                `/admin/buyers/${userId}`
            )
        ),
};

export const sellerProductsAPI = {

    // Post products
    postProducts: async (formData) =>
        apiRequest(() =>
            api.post("sellerProducts/postProducts", formData)
        ),

    // Get products
    getProducts: async (sellerId) =>
        apiRequest(() =>
            api.post("sellerProducts/getProducts", sellerId)
        ),
}

export const orderAPI = {

    // Create Order
    createOrder: async (orderDetails) =>
        apiRequest(() =>
            api.post("orders/create", orderDetails)
        ),

    // Get All Orders
    getOrders: async ({ userId }) => 
        apiRequest(() =>
            api.get("orders/getOrders", {
                params: { userId }
            })
        ),

    // Get Single Order By ID
    getOrderById: async (orderId) =>
        apiRequest(() =>
            api.get(`orders/getOrder/${orderId}`)
        ),

    // Update Order
    updateOrder: async (orderId, updateData) =>
        apiRequest(() =>
            api.patch(`orders/updateOrder/${orderId}`, updateData)
        ),

    // Cancel Order
    cancelOrder: async (orderId) =>
        apiRequest(() =>
            api.patch(`orders/cancelOrder/${orderId}`)
        ),
};

export const notificationAPI = {

    // Get VAPID Public Key
    getPublicKey: async () =>
        apiRequest(() =>
            api.get("/notification/public-key")
        ),

    // Save Push Subscription
    saveSubscription: async (subscription) =>
        apiRequest(() =>
            api.post("notification/subscribe", {
                subscription
            })
        ),

    // Send Push Notification
    sendNotification: async (data) =>
        apiRequest(() =>
            api.post("notification/send", data)
        )
};

export default api;