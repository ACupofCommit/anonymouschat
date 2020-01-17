import getConfig from 'next/config'
import axios, { AxiosError } from 'axios'

const { publicRuntimeConfig } = getConfig()

console.log('publicRuntimeConfig.ANONYMOUSLACK_API_BASE_URL' + publicRuntimeConfig.ANONYMOUSLACK_API_BASE_URL)
export const axiosInstance = axios.create({
  baseURL: publicRuntimeConfig.ANONYMOUSLACK_API_BASE_URL,
})
