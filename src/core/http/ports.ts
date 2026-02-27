export interface IHttp {
  get(
    url: string,
    options?: RequestInit,
    timeoutMs?: number,
  ): Promise<Response>;
  post(
    url: string,
    body: string,
    options?: RequestInit,
    timeoutMs?: number,
  ): Promise<Response>;
}
