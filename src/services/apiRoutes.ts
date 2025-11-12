import { API_BASE_URL } from "../configs/apiConfig"

export const apiRoutes = {    
    AUTH_LOGIN: `${API_BASE_URL}/bs-auth-authentication/user/_login`,
    AUTH_REGISTER: `${API_BASE_URL}/register`,
    AUTH_FORGOT_PASSWORD: `${API_BASE_URL}/forgot-password`,
    GET_PARTNER_INFO: (partner: string) => `${API_BASE_URL}/ds-parameter-partner/${partner}/partner/${partner}`,
    SUMMARY_PXTK: (partner: string, start: string, end: string) => `${API_BASE_URL}/bs-steel/${partner}/pxtk/tongketca?day=${start}&endDay=${end}`,
    SUMMARY_PXLG: (partner: string, start: string, end: string) => `${API_BASE_URL}/bs-steel/${partner}/pxlg/tongketca?day=${start}&endDay=${end}`,
    SUMMARY_PXLT: (partner: string, start: string, end: string) => `${API_BASE_URL}/bs-steel/${partner}/pxlt/tongketca?day=${start}&endDay=${end}`,
    
}
