import { readStorage, writeStorage } from "./storage";

const STORAGE_KEY = "ToneTools_LastUsed";
const MAX_ITEMS = 5;

function loadInitial(): string[] {
  return readStorage<string[]>(STORAGE_KEY, []);
}

class LastUsedService {
  private lastUsedIds = $state<string[]>(loadInitial());

  get lastUsedIdsList() {
    return this.lastUsedIds;
  }

  private persist() {
    writeStorage(STORAGE_KEY, this.lastUsedIds);
  }

  addLastUsed(id: string) {
    const withoutExisting = this.lastUsedIds.filter(existingId => existingId !== id);
    this.lastUsedIds = [id, ...withoutExisting].slice(0, MAX_ITEMS);
    this.persist();
  }
}

export const lastUsedService = new LastUsedService();