import { appendFile, readFile } from "node:fs/promises";

type Entry = { key: string; value: string; deleted?: boolean };

// Append-only log: every write is appended as a JSON line, and reads replay
// the log into an in-memory map. TODO: compaction once the log grows large.
export class KVStore {
  private readonly memory = new Map<string, string>();
  private loaded = false;

  constructor(private readonly logPath: string) {}

  async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const contents = await readFile(this.logPath, "utf8");
      for (const line of contents.split("\n").filter(Boolean)) {
        const entry: Entry = JSON.parse(line);
        if (entry.deleted) this.memory.delete(entry.key);
        else this.memory.set(entry.key, entry.value);
      }
    } catch (err: any) {
      if (err.code !== "ENOENT") throw err;
    }
    this.loaded = true;
  }

  async set(key: string, value: string): Promise<void> {
    await this.append({ key, value });
    this.memory.set(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.append({ key, value: "", deleted: true });
    this.memory.delete(key);
  }

  get(key: string): string | undefined {
    return this.memory.get(key);
  }

  private async append(entry: Entry): Promise<void> {
    await appendFile(this.logPath, JSON.stringify(entry) + "\n", "utf8");
  }
}
