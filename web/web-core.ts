import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: process.env.ANONYMOUSLACK_API_BASE_URL,
})
