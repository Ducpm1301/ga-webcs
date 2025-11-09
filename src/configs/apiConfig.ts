// Sử dụng biến môi trường cho API_BASE_URL
export const API_BASE_URL: string = import.meta.env.VITE_BE_API_BASE_URL || '#';
export const API_KEY: string = import.meta.env.VITE_API_KEY || '#';
export const APPLICATION_CODE: string = import.meta.env.VITE_APPLICATION_CODE || '#';
export const DEVICE: string = import.meta.env.VITE_DEVICE || '#';
// You can also define other API-related constants here if needed
export const API_TIMEOUT: number = 15000; // Example timeout in milliseconds