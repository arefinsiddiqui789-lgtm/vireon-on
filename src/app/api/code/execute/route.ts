import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: string;
  content: string;
}

// Pollinations AI — FREE, no API key needed, works globally
async function callPollinations(messages: ChatMessage[]) {
  const formattedMessages = messages.map((m) => ({
    role: m.role as string,
    content: m.content,
  }));

  const response = await fetch("https://text.pollinations.ai/openai/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai",
      messages: formattedMessages,
      max_tokens: 2048,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pollinations API error (${response.status}): ${errorText.substring(0, 300)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Empty response from Pollinations AI");
  }

  return text;
}

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    const langNames: Record<string, string> = {
      python: "Python",
      c: "C",
      cpp: "C++",
    };

    const langName = langNames[language] || language;
    const startTime = Date.now();

    const executionPrompt = `You are a code execution simulator. When given code, you execute it mentally and return ONLY the exact output that the program would produce. Follow these rules strictly:
1. Return ONLY the stdout output - nothing else
2. Do NOT include any explanations, markdown, or extra text
3. If the code has errors, output them prefixed with 'ERROR:' on stderr
4. Be precise about output formatting - newlines, spaces, etc.
5. If the code produces no output, return empty string
6. Do not add any commentary or analysis
7. Simulate the exact behavior of a real compiler/interpreter`;

    const userMessage = `Execute this ${langName} code and show me ONLY the output:\n\n\`\`\`${language}\n${code}\n\`\`\``;

    const messages: ChatMessage[] = [
      { role: "system", content: executionPrompt },
      { role: "user", content: userMessage },
    ];

    // Always use Pollinations AI — free, no key needed, works everywhere
    const responseText = await callPollinations(messages);

    const executionTime = Date.now() - startTime;

    const hasError =
      responseText.includes("ERROR:") ||
      responseText.includes("error:") ||
      responseText.includes("Error:");

    let stdout = "";
    let stderr = "";

    if (hasError) {
      stderr = responseText.replace(/^ERROR:\s*/i, "").trim();
    } else {
      stdout = responseText.trim();
    }

    return NextResponse.json({
      stdout,
      stderr,
      exitCode: hasError ? 1 : 0,
      executionTime,
    });
  } catch (error) {
    console.error("Code execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}
