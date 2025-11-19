import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

type CurriedRequest<TReq, TResp> = (payload: TReq) => Promise<AxiosResponse<TResp>>

function get<TResp = unknown>(url: string, config?: AxiosRequestConfig): () => Promise<AxiosResponse<TResp>> {
  return () => axios.get<TResp>(url, config)
}

function post<TReq = unknown, TResp = unknown>(url: string, config?: AxiosRequestConfig): CurriedRequest<TReq, TResp> {
  return (payload: TReq) => axios.post<TResp>(url, payload, config)
}

function put<TReq = unknown, TResp = unknown>(url: string, config?: AxiosRequestConfig): CurriedRequest<TReq, TResp> {
  return (payload: TReq) => axios.put<TResp>(url, payload, config)
}

function patch<TReq = unknown, TResp = unknown>(url: string, config?: AxiosRequestConfig): CurriedRequest<TReq, TResp> {
  return (payload: TReq) => axios.patch<TResp>(url, payload, config)
}

function del<TResp = unknown>(url: string, config?: AxiosRequestConfig): () => Promise<AxiosResponse<TResp>> {
  return () => axios.delete<TResp>(url, config)
}

export const simple = {
  get,
  post,
  put,
  patch,
  delete: del,
}

export default simple