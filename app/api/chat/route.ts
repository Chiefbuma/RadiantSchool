import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

type ChatRequest = {
  message?: string;
  sessionId?: string;
  type?: "message" | "application";
  application?: {
    fullName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    program?: string;
    kcseMeanGrade?: string;
    kcseYear?: string;
    notes?: string;
  };
};

const programAliases: Record<string, string> = {
  cna: "cna",
  nursing: "cna",
  nurse: "cna",
  dental: "dental",
  dentist: "dental",
  hrit: "hrit",
  health: "hrit",
  records: "hrit",
};

function normalizeProgram(value = "") {
  const lower = value.toLowerCase();
  const match = Object.keys(programAliases).find((key) => lower.includes(key));
  return match ? programAliases[match] : value || "unspecified";
}

function getTokens(message: string) {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

async function remember(sessionId: string, role: "user" | "assistant", content: string, metadata = {}) {
  await query(
    "INSERT INTO chat_messages (session_id, role, content, metadata) VALUES ($1, $2, $3, $4::jsonb)",
    [sessionId, role, content, JSON.stringify(metadata)]
  );
}

async function answerFromDatabase(message: string) {
  const tokens = getTokens(message);
  const lower = message.toLowerCase();

  const programResult = await query<{
    slug: string;
    title: string;
    duration: string;
    entry_requirements: string;
    tuition_fee_kes: number;
    overview: string;
    pdf_url: string | null;
  }>(
    `SELECT slug, title, duration, entry_requirements, tuition_fee_kes, overview, pdf_url
     FROM rhti_programs
     WHERE $1 = slug OR lower(title) LIKE '%' || $2 || '%'
     ORDER BY display_order`,
    [normalizeProgram(message), lower]
  );

  if (programResult.rows.length > 0) {
    const program = programResult.rows[0];
    return {
      answer: `${program.title}\nDuration: ${program.duration}\nEntry requirements: ${program.entry_requirements}\nTuition: KSh. ${program.tuition_fee_kes.toLocaleString("en-KE")}\n\n${program.overview}`,
      links: program.pdf_url ? [{ label: "Open course PDF", url: program.pdf_url }] : [],
    };
  }

  const knowledgeResult = await query<{ topic: string; answer: string }>(
    `SELECT topic, answer
     FROM rhti_knowledge_base
     ORDER BY (
       SELECT COUNT(*)
       FROM unnest(keywords) keyword
       WHERE keyword = ANY($1::text[])
     ) DESC, display_order
     LIMIT 1`,
    [tokens]
  );

  const topMatch = knowledgeResult.rows[0];
  if (topMatch && tokens.length > 0) {
    const links =
      topMatch.topic === "apply"
        ? [{ label: "Start application in chat", url: "chat-apply" }]
        : topMatch.topic === "requirements"
          ? [{ label: "Open admission requirements PDF", url: "/more/ADMISSION%20REQUIREMENTS.pdf" }]
          : [];
    return { answer: topMatch.answer, links };
  }

  const fallback = await query<{ answer: string }>(
    "SELECT answer FROM rhti_knowledge_base WHERE topic = 'programs' LIMIT 1"
  );

  return {
    answer:
      fallback.rows[0]?.answer ??
      "I can help with RHTI programs, fees, entry requirements, intakes, location, contacts, hospital attachment, and applications.",
    links: [{ label: "Start application in chat", url: "chat-apply" }],
  };
}

async function submitApplication(payload: ChatRequest) {
  const application = payload.application ?? {};
  const required = ["fullName", "email", "phone", "program"] as const;
  const missing = required.filter((field) => !application[field]);

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const result = await query<{ id: string }>(
    `INSERT INTO applications (
      full_name,
      email,
      phone,
      date_of_birth,
      program,
      kcse_mean_grade,
      kcse_year,
      source,
      notes,
      chat_session_id
    ) VALUES ($1, $2, $3, NULLIF($4, '')::date, $5, $6, NULLIF($7, '')::integer, 'chat_agent', $8, $9)
    RETURNING id`,
    [
      application.fullName,
      application.email,
      application.phone,
      application.dateOfBirth ?? "",
      normalizeProgram(application.program),
      application.kcseMeanGrade ?? "",
      application.kcseYear ?? "",
      application.notes ?? "",
      payload.sessionId ?? "website-chat",
    ]
  );

  const answer = `Application received. Your reference number is RHTI-${result.rows[0].id}. Admissions will contact you on ${application.phone}.`;
  await remember(payload.sessionId ?? "website-chat", "assistant", answer, {
    applicationId: result.rows[0].id,
  });

  return NextResponse.json({
    answer,
    applicationId: result.rows[0].id,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ChatRequest;
    const sessionId = payload.sessionId || crypto.randomUUID();

    if (payload.type === "application") {
      return submitApplication({ ...payload, sessionId });
    }

    const message = payload.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await remember(sessionId, "user", message);
    const response = await answerFromDatabase(message);
    await remember(sessionId, "assistant", response.answer, { links: response.links });

    return NextResponse.json({
      sessionId,
      ...response,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "The RHTI chat agent could not process that request." },
      { status: 500 }
    );
  }
}
