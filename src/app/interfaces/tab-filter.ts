export interface TabFilter<T> {
  label: string;
  predicate: ((item: T) => boolean) | null;
}
