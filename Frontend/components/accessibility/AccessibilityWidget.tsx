'use client';

import Script from 'next/script';

export function AccessibilityWidget() {
  return (
    <>
      <Script
        id="accessible-web-widget-config"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.AccessibleWebWidgetOptions = {
              position: 'bottom-right',
              offset: [24, 24],
              lang: 'id',
              ttsNativeVoiceLang: 'id-ID'
            };

            (function() {
              if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

              var currentPiperAudio = null;
              var isPiperActive = false;

              // Lightweight language detection (Indonesian vs English/Other)
              function detectLanguage(text) {
                if (!text || typeof text !== 'string') return 'id';
                var clean = text.toLowerCase().replace(/[^a-z0-9\\s]/g, ' ');
                var words = clean.split(/\\s+/).filter(Boolean);
                if (words.length === 0) return 'id';

                var idIndicators = new Set([
                  'yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'untuk', 'pada', 'adalah',
                  'sebagai', 'dengan', 'saya', 'kami', 'kita', 'anda', 'mereka', 'desa', 'kkn',
                  'tematik', 'mahasiswa', 'dosen', 'lppm', 'proposal', 'kebutuhan', 'gayatama',
                  'nusantara', 'bakti', 'selamat', 'datang', 'halaman', 'tentang', 'kontak',
                  'masuk', 'daftar', 'profil', 'wilayah', 'peta', 'analisis', 'berita', 'informasi',
                  'kegiatan', 'program', 'kerja', 'hasil', 'pos', 'sektor', 'kategori', 'dalam',
                  'oleh', 'atas', 'bawah', 'antara', 'atau', 'karena', 'jika', 'agar', 'supaya',
                  'ketika', 'saat', 'hari', 'tahun', 'bulan', 'bisa', 'sudah', 'ada', 'tidak',
                  'akan', 'tersebut', 'indonesia', 'buka', 'tutup', 'pilihan', 'aksesibilitas',
                  'menu', 'simpan', 'lihat', 'rincian', 'unduh', 'unggah', 'status', 'mitra'
                ]);

                var enIndicators = new Set([
                  'the', 'and', 'is', 'in', 'to', 'of', 'it', 'you', 'that', 'he', 'was',
                  'for', 'on', 'are', 'as', 'with', 'his', 'they', 'at', 'be', 'this',
                  'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what',
                  'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'use',
                  'an', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'will',
                  'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so',
                  'some', 'her', 'would', 'make', 'like', 'him', 'into', 'time', 'has',
                  'look', 'two', 'more', 'write', 'go', 'see', 'number', 'no', 'way',
                  'could', 'people', 'my', 'than', 'first', 'water', 'been', 'call',
                  'who', 'oil', 'its', 'now', 'find', 'welcome', 'website', 'page',
                  'dashboard', 'settings', 'user', 'role', 'login', 'logout', 'view',
                  'details', 'submit', 'cancel', 'delete', 'edit', 'search', 'home'
                ]);

                var idScore = 0;
                var enScore = 0;

                for (var i = 0; i < words.length; i++) {
                  var w = words[i];
                  if (idIndicators.has(w)) idScore += 2;
                  if (enIndicators.has(w)) enScore += 2;
                  // Morphological patterns in Indonesian
                  if (w.startsWith('ber') || w.startsWith('men') || w.startsWith('mem') || w.startsWith('per') || w.endsWith('nya') || w.endsWith('kan')) {
                    idScore += 1;
                  }
                  // Morphological patterns in English
                  if (w.endsWith('ing') || w.endsWith('tion') || w.endsWith('ed') || w.endsWith('ness') || w.endsWith('ly')) {
                    enScore += 1;
                  }
                }

                if (enScore > idScore) return 'en';
                return 'id';
              }

              function findIndonesianBrowserVoice() {
                var voices = (window.speechSynthesis.getVoices && typeof window.speechSynthesis.getVoices === 'function')
                  ? window.speechSynthesis.getVoices()
                  : [];
                if (!voices || !voices.length) return null;

                var exact = voices.find(function(v) {
                  var lang = String(v.lang || '').replace('_', '-').toLowerCase();
                  return lang === 'id-id';
                });
                if (exact) return exact;

                var startsWithIdHyphen = voices.find(function(v) {
                  var lang = String(v.lang || '').replace('_', '-').toLowerCase();
                  return lang.startsWith('id-');
                });
                if (startsWithIdHyphen) return startsWithIdHyphen;

                var startsWithId = voices.find(function(v) {
                  var lang = String(v.lang || '').replace('_', '-').toLowerCase();
                  return lang === 'id';
                });
                return startsWithId || null;
              }

              // Hook up SpeechSynthesis playback controls to also control Piper Audio
              var origCancel = window.speechSynthesis.cancel.bind(window.speechSynthesis);
              window.speechSynthesis.cancel = function() {
                if (currentPiperAudio) {
                  currentPiperAudio.pause();
                  currentPiperAudio.currentTime = 0;
                  currentPiperAudio = null;
                  isPiperActive = false;
                }
                return origCancel();
              };

              var origPause = window.speechSynthesis.pause.bind(window.speechSynthesis);
              window.speechSynthesis.pause = function() {
                if (currentPiperAudio) {
                  currentPiperAudio.pause();
                }
                return origPause();
              };

              var origResume = window.speechSynthesis.resume.bind(window.speechSynthesis);
              window.speechSynthesis.resume = function() {
                if (currentPiperAudio) {
                  currentPiperAudio.play();
                }
                return origResume();
              };

              // Intercept speech synthesis speak
              var origSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
              window.speechSynthesis.speak = function(utterance) {
                if (!utterance || typeof SpeechSynthesisUtterance === 'undefined' || !(utterance instanceof SpeechSynthesisUtterance)) {
                  return origSpeak(utterance);
                }

                var textToSpeak = String(utterance.text || '').trim();
                if (!textToSpeak) return;

                var detectedLang = detectLanguage(textToSpeak);

                // --- PATH 1: Indonesian Language -> Use Piper TTS id_ID ---
                if (detectedLang === 'id') {
                  utterance.lang = 'id-ID';

                  // Cancel any previous audio
                  if (currentPiperAudio) {
                    currentPiperAudio.pause();
                    currentPiperAudio = null;
                  }

                  // Request Piper local neural synthesis
                  fetch('/api/tts/piper', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textToSpeak }),
                  })
                    .then(function(res) {
                      if (!res.ok) throw new Error('Piper TTS server returned status ' + res.status);
                      return res.blob();
                    })
                    .then(function(blob) {
                      var audioUrl = URL.createObjectURL(blob);
                      var audio = new Audio(audioUrl);
                      currentPiperAudio = audio;
                      isPiperActive = true;

                      console.log('[TTS Engine] Piper TTS id_ID (OHF-Voice/piper1-gpl)');
                      console.log('Selected TTS voice: id_ID-news_tts-medium (Piper Neural Voice)');
                      console.log('Selected TTS language: id-ID');

                      audio.onplay = function() {
                        if (typeof utterance.onstart === 'function') {
                          utterance.onstart(new Event('start'));
                        }
                      };

                      audio.onended = function() {
                        currentPiperAudio = null;
                        isPiperActive = false;
                        URL.revokeObjectURL(audioUrl);
                        if (typeof utterance.onend === 'function') {
                          utterance.onend(new Event('end'));
                        }
                      };

                      audio.onerror = function(e) {
                        console.warn('[TTS] Piper audio playback failed, falling back to Web Speech API:', e);
                        currentPiperAudio = null;
                        isPiperActive = false;
                        URL.revokeObjectURL(audioUrl);
                        fallbackToBrowserTts(utterance);
                      };

                      audio.play().catch(function(err) {
                        console.warn('[TTS] Audio play error, falling back:', err);
                        fallbackToBrowserTts(utterance);
                      });
                    })
                    .catch(function(err) {
                      console.warn('[TTS] Piper TTS request failed, falling back to browser TTS:', err);
                      fallbackToBrowserTts(utterance);
                    });

                  return;
                }

                // --- PATH 2: Non-Indonesian Language (e.g. English) -> Use Web Speech API ---
                console.log('[TTS Engine] Web Speech API (Non-Indonesian text detected)');
                console.log('Selected TTS language:', utterance.lang || 'en-US');
                origSpeak(utterance);
              };

              function fallbackToBrowserTts(utterance) {
                utterance.lang = 'id-ID';
                var idVoice = findIndonesianBrowserVoice();
                if (idVoice) {
                  utterance.voice = idVoice;
                  console.log('Selected TTS voice (Fallback):', idVoice.name);
                  console.log('Selected TTS language:', 'id-ID');
                } else {
                  console.warn('Selected TTS voice (Fallback):', utterance.voice ? utterance.voice.name : 'System Default');
                  console.warn('Selected TTS language:', 'id-ID (Requested, but native id-ID voice is not installed on this OS/browser)');
                }
                origSpeak(utterance);
              }
            })();
          `,
        }}
      />
      <Script
        id="accessible-web-widget-script"
        src="https://cdn.jsdelivr.net/gh/ifrederico/accessible-web-widget@1.6.0/dist/accessible-web-widget.min.js"
        strategy="afterInteractive"
      />
    </>
  );
}
