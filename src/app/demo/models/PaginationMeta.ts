export class PaginationMeta {
  total: number = 0;
  per_page: number = 10;
  current_page: number = 1;
  last_page: number = 1;

  constructor(init?: Partial<PaginationMeta>) {
    Object.assign(this, init);
  }

  /** Accepte meta au format snake_case (Laravel) ou camelCase */
  static from(api: any): PaginationMeta {
    return new PaginationMeta({
      total: api?.total ?? 0,
      per_page: api?.per_page ?? api?.perPage ?? 10,
      current_page: api?.current_page ?? api?.currentPage ?? 1,
      last_page: api?.last_page ?? api?.lastPage ?? 1,
    });
  }

  /** Position de départ pour PrimeNG paginator */
  get first(): number {
    return (this.current_page - 1) * this.per_page;
  }

  get hasNext(): boolean {
    return this.current_page < this.last_page;
  }

  get hasPrev(): boolean {
    return this.current_page > 1;
  }
}
