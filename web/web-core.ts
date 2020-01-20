import getConfig from 'next/config'
import axios from 'axios'

const { publicRuntimeConfig } = getConfig()

export const axiosInstance = axios.create({
  baseURL: publicRuntimeConfig.ANONYMOUSLACK_API_BASE_URL,
})
