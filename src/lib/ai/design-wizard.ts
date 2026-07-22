import type {
  BorderStyle,
  ColorStyle,
  DesignConfigurationState,
  FontStyle,
} from "./design-studio";
import {
  BORDER_OPTIONS,
  COLOR_OPTIONS,
  FONT_OPTIONS,
} from "./design-studio";

export type ContentType = "name_only" | "name_cr" | "name_phone" | "name_cr_phone" | "headline_sub";

export interface WizardAnswers {
  contentType?: ContentType;
  mainText: string;
  subText: string;
  fontStyle: FontStyle;
  colorStyle: ColorStyle;
  borderStyle: BorderStyle;
}

export type WizardStepType = "intro" | "choices" | "text" | "confirm";

export interface WizardStep {
  id: string;
  type: WizardStepType;
  questionAr: string;
  questionEn: string;
  hintAr?: string;
  hintEn?: string;
  field?: keyof WizardAnswers;
  options?: { id: string; ar: string; en: string }[];
  placeholderAr?: string;
  placeholderEn?: string;
  required?: boolean;
}

export const CONTENT_TYPE_OPTIONS: { id: ContentType; ar: string; en: string }[] = [
  { id: "name_only", ar: "الاسم فقط", en: "Name only" },
  { id: "name_cr", ar: "الاسم + سجل تجاري", en: "Name + CR number" },
  { id: "name_phone", ar: "الاسم + تليفون", en: "Name + phone" },
  { id: "name_cr_phone", ar: "الاسم + سجل + تليفون", en: "Name + CR + phone" },
];

export const GENERIC_CONTENT_OPTIONS: { id: ContentType; ar: string; en: string }[] = [
  { id: "name_only", ar: "عنوان / اسم فقط", en: "Headline only" },
  { id: "headline_sub", ar: "عنوان + نص فرعي", en: "Headline + sub text" },
];

function needsSubText(type?: ContentType) {
  return type === "name_cr" || type === "name_phone" || type === "name_cr_phone" || type === "headline_sub";
}

function subTextStepMeta(type: ContentType | undefined) {
  if (type === "name_cr" || type === "name_cr_phone") {
    return {
      questionAr: type === "name_cr_phone"
        ? "اكتب السجل التجاري والتليفون (سطرين أو سطر واحد)"
        : "ما رقم السجل التجاري؟",
      questionEn: type === "name_cr_phone"
        ? "Enter CR number and phone (one or two lines)"
        : "What is the CR number?",
      placeholderAr: type === "name_cr_phone" ? "س.ت 5545454 — 01012345678" : "مثال: س.ت 5545454",
      placeholderEn: type === "name_cr_phone" ? "CR 5545454 — 01012345678" : "e.g. CR 5545454",
    };
  }
  if (type === "name_phone") {
    return {
      questionAr: "ما رقم التليفون؟",
      questionEn: "What is the phone number?",
      placeholderAr: "مثال: 01012345678",
      placeholderEn: "e.g. 01012345678",
    };
  }
  return {
    questionAr: "ما النص الفرعي؟",
    questionEn: "What is the sub text?",
    placeholderAr: "نص فرعي...",
    placeholderEn: "Sub text...",
  };
}

export function shouldSkipStep(step: WizardStep, answers: WizardAnswers): boolean {
  if (step.id === "sub_text") return !needsSubText(answers.contentType);
  return false;
}

export function resolveStep(step: WizardStep, answers: WizardAnswers): WizardStep {
  if (step.id !== "sub_text") return step;
  const meta = subTextStepMeta(answers.contentType);
  return { ...step, ...meta };
}

export function getActiveSteps(steps: WizardStep[], answers: WizardAnswers): WizardStep[] {
  return steps.filter((s) => !shouldSkipStep(s, answers)).map((s) => resolveStep(s, answers));
}

export function labelForAnswer(
  step: WizardStep,
  value: string,
  isAr: boolean
): string {
  const opt = step.options?.find((o) => o.id === value);
  if (opt) return isAr ? opt.ar : opt.en;
  return value;
}

export function buildWizardSteps(
  isStamp: boolean,
  config: DesignConfigurationState
): WizardStep[] {
  const hasInk = Boolean(config.inkColor);
  const steps: WizardStep[] = [
    {
      id: "intro",
      type: "intro",
      questionAr: "هنصمم طلبك بناءً على المنتج والمقاس اللي اخترتهم. اضغط ابدأ واسألك خطوة خطوة.",
      questionEn: "We'll design based on your product and size selections. Press start — one question at a time.",
    },
    {
      id: "content_type",
      type: "choices",
      field: "contentType",
      questionAr: isStamp ? "إيه اللي عايز يظهر على الختم؟" : "إيه محتوى التصميم؟",
      questionEn: isStamp ? "What should appear on the stamp?" : "What content do you need?",
      options: isStamp ? CONTENT_TYPE_OPTIONS : GENERIC_CONTENT_OPTIONS,
    },
    {
      id: "main_text",
      type: "text",
      field: "mainText",
      required: true,
      questionAr: isStamp ? "اكتب الاسم أو النص الرئيسي للختم" : "اكتب العنوان أو النص الرئيسي",
      questionEn: isStamp ? "Enter the main stamp name or text" : "Enter the headline or main text",
      placeholderAr: isStamp ? "مثال: أحمد بهنساوي" : "مثال: مطعم الدريني",
      placeholderEn: isStamp ? "e.g. Ahmed Behnsawi" : "e.g. Al-Deriny Restaurant",
    },
    {
      id: "sub_text",
      type: "text",
      field: "subText",
      questionAr: "نص إضافي",
      questionEn: "Additional text",
      placeholderAr: "...",
      placeholderEn: "...",
    },
    {
      id: "font",
      type: "choices",
      field: "fontStyle",
      questionAr: "تفضّل أي نوع خط؟",
      questionEn: "Which font style do you prefer?",
      options: FONT_OPTIONS,
    },
  ];

  if (!hasInk) {
    steps.push({
      id: "color",
      type: "choices",
      field: "colorStyle",
      questionAr: "ألوان التصميم؟",
      questionEn: "Design colors?",
      options: COLOR_OPTIONS,
    });
  }

  steps.push({
    id: "border",
    type: "choices",
    field: "borderStyle",
    questionAr: isStamp ? "شكل إطار الختم؟" : "شكل الإطار؟",
    questionEn: isStamp ? "Stamp border style?" : "Border style?",
    options: BORDER_OPTIONS,
  });

  steps.push({
    id: "confirm",
    type: "confirm",
    questionAr: "كل حاجة تمام؟ اضغط إنشاء التصميم",
    questionEn: "Everything looks good? Press generate design",
  });

  return steps;
}

