export function deepCopyUsedJson<T>(params: T): T {
  return JSON.parse(JSON.stringify(params));
}