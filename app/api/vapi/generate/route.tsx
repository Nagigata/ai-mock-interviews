import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();

  // Đọc đúng format Vapi gửi
  const rawArgs = body?.message?.toolCallList?.[0]?.function?.arguments;
  const args = typeof rawArgs === "string"
    ? JSON.parse(rawArgs)
    : rawArgs ?? body;

  const { type, role, level, techstack, amount, userid } = args;
  const toolCallId = body?.message?.toolCallList?.[0]?.id ?? "unknown";

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    const interview = {
      role,
      type,
      level,
      techstack: techstack ? techstack.split(",") : [],
      questions: (() => {
        try {
          if (Array.isArray(questions)) return questions;
          if (typeof questions === "object") return Object.values(questions);
          const cleaned = String(questions)
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          return JSON.parse(cleaned);
        } catch {
          return String(questions)
            .split("\n")
            .map((q: string) => q.trim())
            .filter((q: string) => q.length > 0);
        }
      })(),
      userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({
      results: [
        {
          toolCallId,
          result: "Interview generated successfully!",
        },
      ],
    }, { status: 200 });

  } catch (error) {
    console.error("Error generating content:", error);
    return Response.json(
      { success: false, error: "Failed to generate content" },
      { status: 500 },
    );
  }
}