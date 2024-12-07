/**
 * TypeScript declarations for Chrome Extension API
 */
declare namespace chrome {
  namespace storage {
    interface StorageArea {
      get(
        keys: string | string[] | { [key: string]: any } | null,
      ): Promise<{ [key: string]: any }>;
      set(items: { [key: string]: any }): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
      clear(): Promise<void>;
    }

    const sync: StorageArea;
    const local: StorageArea;
  }
}
