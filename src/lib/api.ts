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

  getInfo(lightning_address: string) {
    return this.call("GET", `/api/v1/getinfo?lightning_address=${lightning_address}`)
  }

  createAddress(id: string, amount: number, payment_type: string, message: string, lightning_address: string) {
    return this.call("POST", `/api/v1/address/${id}?amount=${amount}&payment_type=${payment_type}&message=${message}&lightning_address=${lightning_address}`)
  }

  getPaymentPaid(txid: string) {
    return this.call("GET", `/api/v1/payment/${txid}/paid`)
  }
}