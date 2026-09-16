export interface GeminiKeySlot {
  name: string;
  key: string;
  enabled: boolean;
  errorCount: number;
  lastUsed: number;
}

// Default fallback key pool from environment or user specifications
const DEFAULT_PRIMARY_KEY = 'AQ.Ab8RN6L_C1aNCzUKJYhyOvoEtbzjY8AE1dz-7IBZoge4f2b5kg';

class GeminiKeyManager {
  private keySlots: GeminiKeySlot[] = [];
  private currentIndex = 0;

  constructor() {
    this.refreshKeys();
  }

  public refreshKeys() {
    const envSingle = process.env.GEMINI_API_KEY?.trim();
    const envMultiple = process.env.GEMINI_API_KEYS?.trim();

    if (envMultiple) {
      this.parseKeys(envMultiple);
    } else if (envSingle) {
      this.keySlots = [
        {
          name: 'Default',
          key: envSingle,
          enabled: true,
          errorCount: 0,
          lastUsed: 0,
        },
      ];
    } else {
      this.parseKeys(
        `Default|${DEFAULT_PRIMARY_KEY}|true,UserAccount|${DEFAULT_PRIMARY_KEY}|true`
      );
    }
  }

  private parseKeys(raw: string) {
    this.keySlots = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const parts = item.split('|');
        if (parts.length >= 2) {
          return {
            name: parts[0].trim(),
            key: parts[1].trim(),
            enabled: parts[2] ? parts[2].trim().toLowerCase() === 'true' : true,
            errorCount: 0,
            lastUsed: 0,
          };
        }
        return {
          name: 'Default',
          key: item.trim(),
          enabled: true,
          errorCount: 0,
          lastUsed: 0,
        };
      });
  }

  /**
   * Mengambil key aktif berikutnya dengan strategi Round-Robin & Error Filtering
   */
  public getNextKey(): GeminiKeySlot {
    const activeSlots = this.keySlots.filter((s) => s.enabled && s.errorCount < 5);
    if (activeSlots.length === 0) {
      // Reset error counts if all were temporarily throttled
      this.keySlots.forEach((s) => (s.errorCount = 0));
      return this.keySlots[0];
    }

    const chosen = activeSlots[this.currentIndex % activeSlots.length];
    this.currentIndex = (this.currentIndex + 1) % activeSlots.length;
    chosen.lastUsed = Date.now();
    return chosen;
  }

  /**
   * Laporkan kegagalan key (misal 429 Too Many Requests / Quota Exceeded)
   */
  public reportError(keyString: string) {
    const slot = this.keySlots.find((s) => s.key === keyString);
    if (slot) {
      slot.errorCount += 1;
      console.warn(`[GeminiKeyManager] Key slot '${slot.name}' reported error (total errors: ${slot.errorCount})`);
    }
  }

  /**
   * Laporkan keberhasilan key
   */
  public reportSuccess(keyString: string) {
    const slot = this.keySlots.find((s) => s.key === keyString);
    if (slot && slot.errorCount > 0) {
      slot.errorCount = Math.max(0, slot.errorCount - 1);
    }
  }

  /**
   * Mendapatkan status seluruh slot key
   */
  public getPoolStatus() {
    return this.keySlots.map((s) => ({
      name: s.name,
      enabled: s.enabled,
      errorCount: s.errorCount,
      lastUsed: s.lastUsed ? new Date(s.lastUsed).toISOString() : null,
      maskedKey: `${s.key.slice(0, 6)}...${s.key.slice(-4)}`,
    }));
  }
}

export const geminiKeyManager = new GeminiKeyManager();
