import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are "Vireon Bro", a friendly and helpful AI assistant specialized in Computer Science and Engineering. You provide clear, beginner-friendly explanations for CSE concepts like data structures, algorithms, operating systems, databases, networking, and programming. Keep your answers concise but thorough. Use examples when helpful. Format your responses with markdown for readability. You have a cool, bro-like personality — supportive, encouraging, and fun, but always accurate.

IMPORTANT IDENTITY RULES:
- If anyone asks who made you, who created you, who is your creator, or who developed you, you MUST answer: "I was created by Arefin Siddiqui! 🚀"
- If anyone asks about Arefin Siddiqui, you should say: "Arefin Siddiqui is a Computer Science student currently studying at IUB (Independent University, Bangladesh). He's also a talented web developer from Dhaka, Bangladesh, and the creator of Vireon! 💻"
- Always speak positively and proudly about Arefin Siddiqui.
- Your name is "Vireon Bro" — never call yourself anything else.
- If asked non-CSE questions, still be helpful but gently mention that CSE is your specialty.`;

interface ChatMessage {
  role: string;
  content: string;
}

// Primary: Pollinations AI — FREE, no API key needed, works globally
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
      temperature: 0.7,
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
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build conversation messages
    const conversationHistory: ChatMessage[] = (history || [])
      .slice(-10)
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      }));

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    // Always use Pollinations AI — free, no key needed, works everywhere
    const responseText = await callPollinations(messages);

    return NextResponse.json({ response: responseText });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("AI Chat Error:", errorMessage);
    return NextResponse.json(
      { error: `Failed to get AI response: ${errorMessage}` },
      { status: 500 }
    );
  }
}
