export function debounce(
  func: (fieldPath: string, value: string) => void,
  delay: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (fieldPath: string, value: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(fieldPath, value);
      timeoutId = null;
    }, delay);
  };
}
