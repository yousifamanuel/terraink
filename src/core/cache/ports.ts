export interface ICache {
  read<T = unknown>(key: string, maxAgeMs?: number): T | null;
  write(key: string, data: unknown): void;
}
