declare interface IResponse<T> {
  data: T;
  statusCode: number;
  total?: number;
}
