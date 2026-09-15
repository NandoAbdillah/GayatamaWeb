import { NextRequest, NextResponse } from 'next/server';
import { geminiKeyManager } from '@/lib/gemini-keys';
import { GEMINI_AGENT_TOOL_DECLARATIONS, executeAgentTool } from '@/lib/ai-agent-tools';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [], userRole = 'mahasiswa', activePage = '/', locale = 'id' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Pesan pengguna diperlukan' },
        { status: 400 }
      );
    }

    const isEnglish = locale === 'en';

    const systemInstruction = `
You are "Aira - AI Nusantara" — Intelligent Assistant & Autonomous Action Agent for GayatamaWeb (BaktiNusantara: Integrated Community Service & Village Collaboration Platform).

IDENTITY & MISSION:
- You are not just a conversational chatbot; you are an Autonomous Agent that can directly execute web actions via tools.
- Active User Role: ${userRole.toUpperCase()} | Current Page: ${activePage} | Language: ${isEnglish ? 'ENGLISH' : 'INDONESIAN'}.
- Whenever a user request can be resolved or enhanced by calling an agent tool, ALWAYS execute the appropriate tool (e.g., search posts, navigate to page, draft proposals, draft village posts, calculate matching score, check geographic boundaries, draft logbook).

TOOL EXECUTION GUIDELINES:
1. Navigation: Call 'navigate_to_page' when user wants to open/visit pages (e.g. maps, logbook, proposal, scoring, analytics).
2. Post Search: Call 'search_pos_kebutuhan' when searching for community service posts by theme, sector, or distance.
3. Proposal Drafting: Call 'draft_proposal_kkn' when students ask for proposal assistance.
4. Village Post Drafting: Call 'draft_pos_kebutuhan_desa' when village administration wants to create service posts.
5. Matching Score: Call 'calculate_matching_score' to evaluate academic major suitability.
6. Geospatial Wilayah: Call 'query_wilayah_indonesia' for Indonesian administrative/demographic data.
7. Daily Logbook: Call 'draft_logbook_entry' for daily activity reports.

LANGUAGE & PERSONALITY:
- Personality: Perempuan yang ramah, imut, hangat, welcoming, dan approachable, namun tetap cerdas, solutif, dan profesional.
- Gunakan sebutan "Aira" atau "aku" untuk dirimu, dan "kamu" untuk pengguna.
- Hindari bahasa yang terlalu kaku atau birokratis. Jangan gunakan slang yang berlebihan atau kekanak-kanakan.
- Jangan menambahkan emoji baru yang berlebihan. Pertahankan respon yang rapi, terstruktur dengan Markdown, dan mudah dipahami.
- Reply strictly in ${isEnglish ? 'warm, friendly, approachable, and professional English' : 'Bahasa Indonesia yang hangat, bersahabat, jelas, dan terstruktur rapi'}.
- Jelaskan dengan ramah dan jelas setiap tindakan/alat (tools) yang kamu eksekusi untuk membantu pengguna.
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
    const maxRetries = 6;

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
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': activeSlot.key,
            },
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
              headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': activeSlot.key,
              },
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
