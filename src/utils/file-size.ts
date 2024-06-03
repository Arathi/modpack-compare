export function formatFileSize(size: number, fractionDigits = 3): string {
  let unit = 'B';
  let value = size;
  if (size >= 1_000_000_000) {
    value = size / 1_000_000_000;
    unit = 'GB';
  } else if (size >= 1_000_000) {
    value = size / 1_000_000;
    unit = 'MB';
  } else if (size >= 1_000) {
    value = size / 1_000;
    unit = 'kB';
  }
  return `${value.toFixed(fractionDigits)} ${unit}`;
}
