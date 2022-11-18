export class SearchAfterResponse<T> {
  items: T[];
  cursor?: string;

  constructor(items: T[], cursor: string) {
    this.items = items;
    this.cursor = cursor;
  }
}
