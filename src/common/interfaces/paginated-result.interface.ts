export interface PaginatedResult<T> {
  items: Array<T>;
  total: number;
  page: number;
  limit: number;
}
