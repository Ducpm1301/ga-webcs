import { API_BASE_URL } from "../configs/apiConfig"

export const apiRoutes = {    
    AUTH_LOGIN: `${API_BASE_URL}/bs-auth-authentication/user/_login`,
    AUTH_REGISTER: `${API_BASE_URL}/register`,
    AUTH_FORGOT_PASSWORD: `${API_BASE_URL}/forgot-password`,
    GET_PARTNER_INFO: (partner: string) => `${API_BASE_URL}/ds-parameter-partner/${partner}/partner/${partner}`,
    SUMMARY: (partner: string, start: string, end: string, site: string) => {
        const base = `${API_BASE_URL}/bs-steel/${partner}/${site}/tongketca?day=${start}`;
        const endParam = end ? `&endDay=${end}` : '';
        return `${base}${endParam}`;
    },
    PXTK_GET_TECH: (partner: string, start: string, end: string, site: string) => {
        const base = `${API_BASE_URL}/bs-steel/${partner}/${site}/congnghe?day=${start}`;
        const endParam = end ? `&endDay=${end}` : '';   
        return `${base}${endParam}`;
    },
    PXTK_GET_ANALYTICS: (partner: string, start: string, end: string, site: string) => {
        const base = `${API_BASE_URL}/bs-steel/${partner}/phantich/${site}?day=${start}`;
        const endParam = end ? `&endDay=${end}` : '';   
        return `${base}${endParam}`;
    },
}
