export interface Converter<T> {
  convertStringToJsValue(str: string, options?: unknown): T;
  isJsValue(value: unknown): boolean;
  convertJsValueToString(value: T, options?: unknown): string;
}
