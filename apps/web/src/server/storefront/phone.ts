export function normalizePakistanPhone(input: string) {
  const compact = input.trim().replace(/[^\d+]/g, "");

  if (compact.startsWith("+")) {
    return compact;
  }

  if (compact.startsWith("0092")) {
    return `+${compact.slice(2)}`;
  }

  if (compact.startsWith("92")) {
    return `+${compact}`;
  }

  if (compact.startsWith("0")) {
    return `+92${compact.slice(1)}`;
  }

  return compact ? `+92${compact}` : compact;
}
