export interface GeminiKeySlot {
  name: string;
  key: string;
  enabled: boolean;
  errorCount: number;
  lastUsed: number;
}

// Default fallback key pool from environment or user specifications
const RAW_KEYS =
  process.env.GEMINI_API_KEYS ||
  'Esper|AQ.Ab8RN6J8hmVyLXVofC8aNRnuZw36MQ8CL-FtUwpoOCn6-nYD-A|true,Stud|AQ.Ab8RN6KJJPiFoH2UmM5IuVulGip1wbDpeFblyM_Erlhnm9KmKw|true,Tom|AQ.Ab8RN6JX-D1ROgHsEf_lMwuSPqiHc-EN004aSDGs6-l_3Oyqow|true,Village|AQ.Ab8RN6KurK4cxWhQFg50LX5UQm-4OIW58B89NmHZLBAjgmfn-g|true,Ara|AQ.Ab8RN6ItRuE2JfcG5sNanrt-5P4Pth5mIi8ykQj9VPtbnpP4mQ|true';

class GeminiKeyManager {
  private keySlots: GeminiKeySlot[] = [];
  private currentIndex = 0;

  constructor() {
    this.parseKeys(RAW_KEYS);
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

    this.currentIndex = (this.currentIndex + 1) % activeSlots.length;
    const chosen = activeSlots[this.currentIndex];
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
