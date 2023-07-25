import { InternalCode } from './enums';

export class QueryBuildDTO<T, C> {
  public items: C[] | null = null;
  #itemsDB: T[];

  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,
    itemsDB: T[],
  ) {
    this.#itemsDB = itemsDB;
  }

  map(cb: (val: T) => C): void {
    this.items = this.#itemsDB.map((el) => cb(el));
  }

  convert() {
    this.items = this.#itemsDB as unknown as C[];
  }
}

export class ResultDTO<T> {
  constructor(public code: InternalCode, public payload: T | null = null) {}

  hasError() {
    return this.code <= 0;
  }
}
