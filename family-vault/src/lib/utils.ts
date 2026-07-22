/**
 * Merges React Native styles.
 * In React Native, style props can accept an array of style objects.
 */
export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).flat();
}
