namespace ArrayUtil {
  export function last<T = unknown>(arr: T[]): T {
    return arr[arr.size() - 1];
  }

  export function first<T = unknown>(arr: T[]): T {
    return arr[0];
  }
}

export default ArrayUtil;