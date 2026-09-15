/**
 * ============================================================================
 * GEMINI MODEL ROTATION & FALLBACK CONFIGURATION
 * ============================================================================
 * Konfigurasi terpusat untuk Model Pool, Priority, Cooldown, dan Error Filtering.
 * Anda dapat dengan mudah menyesuaikan urutan model di bawah ini atau melalui
 * environment variable GEMINI_MODELS.
 */

// 1. Model Priority Pool
export const DEFAULT_GEMINI_MODELS: string[] = [
  'gemini-3.6-flash',      // Primary (Model utama cepat & cerdas)
  'gemini-3.5-flash-lite', // Fallback 1 (Kapasitas tinggi: 15 RPM, 500 RPD)
  'gemini-3.7-flash',      // Fallback 2
  'gemini-3.8-flash',      // Fallback 3
  'gemini-3.5-flash',      // Fallback 4
  'gemini-3.1-flash-lite', // Fallback 5 (Kapasitas tinggi: 15 RPM, 500 RPD)
];

// 2. Cooldown & Attempt Settings
export const MODEL_ROTATION_CONFIG = {
  // Durasi cooldown saat model terkena rate-limit / quota exceeded (dalam ms)
  // Default: 60 detik (60.000 ms)
  cooldownDurationMs: parseInt(process.env.GEMINI_MODEL_COOLDOWN_MS || '60000', 10),

  // Maksimal percobaan model berbeda dalam satu user request
  maxModelAttempts: parseInt(process.env.GEMINI_MAX_MODEL_ATTEMPTS || '5', 10),

  // Pesan ramah default ketika seluruh model di pool gagal / sedang sibuk
  friendlyFallbackMessage:
    'Sepertinya aku sedang cukup sibuk saat ini. Coba lagi sebentar ya! 😊',
};

export interface ModelSlotState {
  name: string;
  cooldownUntil: number; // Timestamp ms saat cooldown berakhir
  failureCount: number;
  successCount: number;
  lastUsed: number;
  lastErrorReason?: string;
}

/**
 * Pengelola State Rotasi Model dengan Cooldown & Automatic Recovery
 */
class GeminiModelManager {
  private modelStates: Map<string, ModelSlotState> = new Map();

  constructor() {
    this.initModels();
  }

  /**
   * Inisialisasi daftar model dari env atau default
   */
  public initModels() {
    const models = this.getRawConfiguredModels();
    for (const name of models) {
      if (!this.modelStates.has(name)) {
        this.modelStates.set(name, {
          name,
          cooldownUntil: 0,
          failureCount: 0,
          successCount: 0,
          lastUsed: 0,
        });
      }
    }
  }

  /**
   * Mengambil daftar nama model sesuai urutan konfigurasi
   */
  public getRawConfiguredModels(): string[] {
    const envModels = process.env.GEMINI_MODELS?.trim();
    if (envModels) {
      return envModels
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);
    }
    return [...DEFAULT_GEMINI_MODELS];
  }

  /**
   * Mengambil kandidat model berurutan sesuai prioritas.
   * Model yang TIDAK dalam cooldown ditaruh di depan sesuai urutan prioritas.
   * Model yang SEDANG cooldown ditaruh di belakang sebagai opsi darurat.
   */
  public getCandidateModels(): string[] {
    this.initModels();
    const configuredList = this.getRawConfiguredModels();
    const now = Date.now();

    const readyModels: string[] = [];
    const coolingModels: string[] = [];

    for (const modelName of configuredList) {
      const state = this.modelStates.get(modelName);
      if (state && state.cooldownUntil > now) {
        coolingModels.push(modelName);
      } else {
        readyModels.push(modelName);
      }
    }

    // Urutkan: model yang siap (prioritas utama) -> model yang sedang cooldown (jika terpaksa)
    return [...readyModels, ...coolingModels];
  }

  /**
   * Memeriksa apakah error yang terjadi layak untuk memicu rotasi model.
   * Rotasi HANYA dilakukan jika error terkait quota, rate limit, atau ketersediaan server/model.
   */
  public isRotationEligibleError(status: number, errorMessageOrBody: string): boolean {
    // Status HTTP yang memicu rotasi
    if (status === 429) return true; // Too Many Requests / Quota Exceeded
    if (status === 503) return true; // Service Unavailable
    if (status === 502 || status === 504 || status === 500) return true; // Temporary server errors
    if (status === 404) return true; // Model not available / discontinued on account

    const text = (errorMessageOrBody || '').toUpperCase();

    // Kata kunci error yang memicu rotasi
    const rotationKeywords = [
      'RESOURCE_EXHAUSTED',
      'QUOTA_EXCEEDED',
      'RATE_LIMIT_EXCEEDED',
      'TOO MANY REQUESTS',
      'OVERLOADED',
      'TEMPORARILY UNAVAILABLE',
      'MODEL_UNAVAILABLE',
      'SERVICE UNAVAILABLE',
      'IS NO LONGER AVAILABLE',
      'CAPACITY_EXCEEDED',
      'THROTTLED',
    ];

    return rotationKeywords.some((kw) => text.includes(kw));
  }

  /**
   * Laporkan bahwa model berhasil memberikan respon
   */
  public reportSuccess(modelName: string) {
    const state = this.modelStates.get(modelName);
    if (state) {
      state.cooldownUntil = 0; // Hapus cooldown
      state.failureCount = 0;
      state.successCount += 1;
      state.lastUsed = Date.now();
      state.lastErrorReason = undefined;
    }
  }

  /**
   * Laporkan kegagalan kuota/rate-limit pada model tertentu dan aktifkan temporary cooldown
   */
  public reportQuotaOrRateLimit(modelName: string, reason: string) {
    let state = this.modelStates.get(modelName);
    if (!state) {
      state = {
        name: modelName,
        cooldownUntil: 0,
        failureCount: 0,
        successCount: 0,
        lastUsed: 0,
      };
      this.modelStates.set(modelName, state);
    }

    state.failureCount += 1;
    state.lastUsed = Date.now();
    state.cooldownUntil = Date.now() + MODEL_ROTATION_CONFIG.cooldownDurationMs;
    state.lastErrorReason = reason;

    console.warn(
      `[AI] Model: ${modelName} | Request failed: Rate limit / Quota exceeded (${reason}) | Cooldown: ${MODEL_ROTATION_CONFIG.cooldownDurationMs / 1000}s`
    );
  }

  /**
   * Ambil ringkasan status seluruh model untuk monitoring/debugging
   */
  public getStatusSummary() {
    const now = Date.now();
    return Array.from(this.modelStates.values()).map((s) => ({
      model: s.name,
      isCoolingDown: s.cooldownUntil > now,
      cooldownRemainingSec: Math.max(0, Math.round((s.cooldownUntil - now) / 1000)),
      failures: s.failureCount,
      successes: s.successCount,
      lastError: s.lastErrorReason,
    }));
  }
}

export const geminiModelManager = new GeminiModelManager();
