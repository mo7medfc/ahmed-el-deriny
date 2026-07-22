/**
 * Central model config — use OPENAI_MAIN_MODEL for flagship ChatGPT on all design steps.
 * Set in .env: OPENAI_MAIN_MODEL="gpt-4.1" or "gpt-4o"
 */
export function getMainChatModel(): string {
  return (
    process.env.OPENAI_MAIN_MODEL ||
    process.env.OPENAI_CREATIVE_MODEL ||
    process.env.OPENAI_CHAT_MODEL ||
    "gpt-5.4"
  );
}

export function getCreativeModel(): string {
  return process.env.OPENAI_CREATIVE_MODEL || getMainChatModel();
}

export function getRefineModel(): string {
  return process.env.OPENAI_REFINE_MODEL || getMainChatModel();
}

export function getChoicesModel(): string {
  return process.env.OPENAI_CHAT_MODEL || getMainChatModel();
}

export function getImageModel(): string {
  return process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
}
