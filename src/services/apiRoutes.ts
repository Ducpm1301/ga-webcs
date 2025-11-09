import { API_BASE_URL } from "../configs/apiConfig"

export const apiRoutes = {
    AUTH_LOGIN: `${API_BASE_URL}/bs-auth-authentication/user/_login`,
    AUTH_REGISTER: `${API_BASE_URL}/register`,
    AUTH_FORGOT_PASSWORD: `${API_BASE_URL}/forgot-password`,
}
