import axios from 'axios'

const ANONYMOUSCHAT_WEB_API_ENDPOINT = process.env.NEXT_PUBLIC_ANONYMOUSCHAT_WEB_API_ENDPOINT

export const axiosInstance = axios.create({
  baseURL: ANONYMOUSCHAT_WEB_API_ENDPOINT,
})
