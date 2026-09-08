import { NextRequest, NextResponse } from 'next/server';
import { geminiKeyManager } from '@/lib/gemini-keys';
import { GEMINI_AGENT_TOOL_DECLARATIONS, executeAgentTool } from '@/lib/ai-agent-tools';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [], userRole = 'mahasiswa', activePage = '/' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Pesan pengguna diperlukan' },
        { status: 400 }
      );
    }

    const systemInstruction = `
Anda adalah "Bakti AI Agent" — Asisten Cerdas & Agen Aksi Terpadu di platform GayatamaWeb (BaktiNusantara: Platform Kolaborasi KKN Tematik & Pengabdian Masyarakat Terintegrasi).

IDENTITAS & MISI:
- Anda bukan hanya chatbot pasif pemberi teks; Anda adalah Asisten Otonom (Agentic AI) yang berdaya aksi langsung di web.
- Peran Anda adalah membantu Pengguna (Peran aktif saat ini: ${userRole.toUpperCase()}, Halaman saat ini: ${activePage}).
- Anda memiliki alat bantu (Tools / Functions). JIKA PENGGUNA MEMINTA BANTUAN YANG DAPAT DISELESAIKAN DENGAN TOOLS, SELALU EKSEKUSI TOOL YANG SESUAI (misal: mencari pos, menyusun proposal, membuka halaman peta, cek wilayah, atau draf logbook).

PANDUAN EKSEKUSI TOOLS:
1. Jika pengguna ingin pergi ke halaman tertentu (misal: "Buka peta", "Bawa saya ke halaman penilaian dosen", "Buka logbook"), panggil tool 'navigate_to_page'.
2. Jika pengguna mencari tempat KKN atau tema tertentu (misal: "Cari KKN UMKM", "Ada pos pertanian dekat sini?"), panggil tool 'search_pos_kebutuhan'.
3. Jika mahasiswa meminta bantuan menyusun proposal KKN, panggil tool 'draft_proposal_kkn'.
4. Jika perangkat desa ingin membuat pos kebutuhan, panggil tool 'draft_pos_kebutuhan_desa'.
5. Jika mahasiswa ingin tahu apakah jurusannya cocok dengan pos desa, panggil tool 'calculate_matching_score'.
6. Jika pengguna menanyakan info wilayah/geospasial Indonesia, panggil tool 'query_wilayah_indonesia'.
7. Jika mahasiswa ingin membuat laporan catatan harian, panggil tool 'draft_logbook_entry'.

GAYA BAHASA:
- Gunakan Bahasa Indonesia yang profesional, ramah, solutif, dan terstruktur rapi dengan Markdown.
- Berikan ringkasan yang jelas dan jelaskan tindakan yang telah Anda lakukan melalui tools.
`.trim();

    // Prepare contents array for Gemini
    const contents: any[] = [];

    // Append history
    if (Array.isArray(history)) {
      history.slice(-6).forEach((h) => {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        });
      });
    }

    // Append new user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Execute with Gemini with multi-key failover retry
    let lastError = null;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const activeSlot = geminiKeyManager.getNextKey();

      try {
        const payload = {
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          tools: [
            {
              functionDeclarations: GEMINI_AGENT_TOOL_DECLARATIONS,
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeSlot.key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Gemini API HTTP ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const contentPart = candidate?.content?.parts?.[0];

        // Check if Gemini invoked a function call
        if (contentPart?.functionCall) {
          const funcCall = contentPart.functionCall;
          const toolName = funcCall.name;
          const toolArgs = funcCall.args || {};

          // Execute tool on server
          const toolExecutionResult = await executeAgentTool(toolName, toolArgs);

          // 2nd turn: Send tool output back to Gemini to get natural summary
          contents.push({
            role: 'model',
            parts: [{ functionCall: funcCall }],
          });

          contents.push({
            role: 'function',
            parts: [
              {
                functionResponse: {
                  name: toolName,
                  response: toolExecutionResult,
                },
              },
            ],
          });

          const secondResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeSlot.key}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents,
                systemInstruction: { parts: [{ text: systemInstruction }] },
              }),
            }
          );

          let finalReply = 'Aksi telah berhasil dijalankan oleh AI Agent.';
          if (secondResponse.ok) {
            const secondData = await secondResponse.json();
            finalReply =
              secondData.candidates?.[0]?.content?.parts?.[0]?.text || finalReply;
          }

          geminiKeyManager.reportSuccess(activeSlot.key);

          return NextResponse.json({
            success: true,
            reply: finalReply,
            executedTool: {
              name: toolName,
              args: toolArgs,
              result: toolExecutionResult,
            },
            keySlot: activeSlot.name,
          });
        }

        // Normal text response
        const textReply = contentPart?.text || 'Saya siap membantu Anda.';
        geminiKeyManager.reportSuccess(activeSlot.key);

        return NextResponse.json({
          success: true,
          reply: textReply,
          executedTool: null,
          keySlot: activeSlot.name,
        });
      } catch (err: any) {
        console.warn(`[API /ai/agent] Attempt ${attempt + 1} with slot '${activeSlot.name}' failed:`, err.message);
        geminiKeyManager.reportError(activeSlot.key);
        lastError = err;
      }
    }

    throw lastError || new Error('Semua slot Gemini API key sedang mengalami antrean.');
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Terjadi kesalahan saat memproses permintaan AI',
      },
      { status: 500 }
    );
  }
}
