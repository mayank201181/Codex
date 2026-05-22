const gradeSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    status: { type: "string", enum: ["correct", "partially_correct", "incorrect"] },
    marks_awarded: { type: "integer" },
    marks_available: { type: "integer" },
    what_was_good: { type: "string" },
    missing_points: { type: "array", items: { type: "string" } },
    model_answer: { type: "string" },
    revision_tip: { type: "string" }
  },
  required: ["status", "marks_awarded", "marks_available", "what_was_good", "missing_points", "model_answer", "revision_tip"]
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY is not set in the deployment environment." });

  const { topic, question, studentAnswer, modelAnswer, markScheme, marks } = req.body || {};
  if (!topic || !question || !studentAnswer || !modelAnswer || !Array.isArray(markScheme)) {
    return res.status(400).json({ error: "Missing grading information." });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input: [
        {
          role: "system",
          content: "You are a careful Year 7 science exam marker for an IGCSE-style curriculum. Mark only against the supplied mark scheme and model answer. Be encouraging, specific, and concise. Do not introduce unrelated advanced content."
        },
        {
          role: "user",
          content: JSON.stringify({ topic, question, studentAnswer, modelAnswer, markScheme, marksAvailable: marks })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "science_answer_mark",
          strict: true,
          schema: gradeSchema
        }
      }
    })
  });

  const data = await response.json();
  if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "OpenAI request failed." });

  const text = data.output_text || data.output?.flatMap((item) => item.content || []).find((part) => part.type === "output_text")?.text;
  if (!text) return res.status(502).json({ error: "The AI marker returned no text." });

  return res.status(200).json(JSON.parse(text));
}
