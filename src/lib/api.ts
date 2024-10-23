import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export default class API {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }
  
  private async call<T = any>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, data?: any): Promise<AxiosResponse<T>> {
      const config: AxiosRequestConfig = {
        method,
        url: `${this.url}${path}`,
        data,
      };
      try {
        const response = await axios({
          method,
          url: this.url + path,
          data,
          ...config,
        });
  
        return response;
      } catch (error: any) {
        throw error;
      }
  }

  createAddress(id: string, amount: number, payment_type: string, message: string) {
    return this.call("POST", `/api/v1/address/${id}?amount=${amount}&payment_type=${payment_type}&message=${message}`)
  }
}