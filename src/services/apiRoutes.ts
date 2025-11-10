import { API_BASE_URL } from "../configs/apiConfig"

export const apiRoutes = {    
    AUTH_LOGIN: `${API_BASE_URL}/bs-auth-authentication/user/_login`,
    AUTH_REGISTER: `${API_BASE_URL}/register`,
    AUTH_FORGOT_PASSWORD: `${API_BASE_URL}/forgot-password`,
    SUMMARY_PXTK: (partner: string, start: string, end: string) => `${API_BASE_URL}/bs-steel/${partner}/pxtk/tongketca?start=${start}&end=${end}`,
    SUMMARY_PXLG: (partner: string, start: string, end: string) => `${API_BASE_URL}/bs-steel/${partner}/pxlg/tongketca?start=${start}&end=${end}`,
    SUMMARY_PXLT: (partner: string, start: string, end: string) => `${API_BASE_URL}/bs-steel/${partner}/pxlt/tongketca?start=${start}&end=${end}`,
}
