export type AiErrorCode = "no_credit" | "rate_limit" | "auth" | "upstream";

export interface AiError {
  code: AiErrorCode;
  error: string;
  status: number;
}

/** Turns a raw OpenAI error response into something the storefront can act on. */
export function describeOpenAiError(raw: string, status: number): AiError {
  let message = "";
  let type = "";
  let code = "";

  try {
    const parsed = JSON.parse(raw)?.error;
    message = String(parsed?.message || "");
    type = String(parsed?.type || "");
    code = String(parsed?.code || "");
  } catch {
    message = raw.slice(0, 300);
  }

  if (
    type === "insufficient_quota" ||
    code === "credit_balance_exhausted" ||
    /credit|quota|billing/i.test(message)
  ) {
    return {
      code: "no_credit",
      error: "AI account has no credit remaining",
      status: 402,
    };
  }

  if (status === 429) {
    return { code: "rate_limit", error: "AI service is rate limited", status: 429 };
  }

  if (status === 401 || status === 403) {
    return { code: "auth", error: "AI credentials rejected", status: 502 };
  }

  return { code: "upstream", error: message || "AI service unavailable", status: 502 };
}
