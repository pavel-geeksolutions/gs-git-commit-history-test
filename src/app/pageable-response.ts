export interface PageableResponse<T> {
  page: number;
  perPage: number;
  totalRecords: number;
  records: T[];
}
