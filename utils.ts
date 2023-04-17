export function formatLog(val: string) {
  const separator = "=".repeat(20);
  const padding = " ".repeat(10);
  return separator + padding + val + padding + separator;
}

export function copy(text: string) {
  navigator.clipboard.writeText(text)
}