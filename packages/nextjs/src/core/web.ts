import axios from 'axios'

const ANONYMOUSLACK_WEB_API_ENDPOINT = process.env.NEXT_PUBLIC_ANONYMOUSLACK_WEB_API_ENDPOINT

export const axiosInstance = axios.create({
  baseURL: ANONYMOUSLACK_WEB_API_ENDPOINT,
})
