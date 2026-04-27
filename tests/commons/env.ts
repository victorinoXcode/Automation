import path from "node:path";
import dotenv from "dotenv";
import * as z from "zod";

let envPath = ".env";

if (process.env.NODE_ENV && process.env.NODE_ENV !== "production") {
  envPath += `.${process.env.NODE_ENV}`;
}

dotenv.config({path: path.resolve(__dirname, `../../${envPath}`)});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("test"),
  CI: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === "true")
    .default(false)
    .optional(),
  QASE_MODE: z.enum(["testops", "report", "off"]).default("off").optional(),
  QASE_TOKEN: z.string().optional(),
  QASE_PROJECT: z.string().optional(),
  ZPO_EMAIL: z.string().optional(),
  ZPO_PASSWORD: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ADVISOR_EMAIL: z.string().optional(),
  ADVISOR_PASSWORD: z.string().optional(),
  LOGIN_CLIENT_EMAIL: z.string().optional(),
  LOGIN_CLIENT_PASSWORD: z.string().optional(),
  ADMIN_EMAIL_NON_PLUTUS: z.string().optional(),
  ADMIN_PASSWORD_NON_PLUTUS: z.string().optional(),
  PM_EMAIL: z.string().optional(),
  PM_PASSWORD: z.string().optional(),
  PROSPECT_EMAIL: z.string().optional(),
  PROSPECT_PASSW: z.string().optional(),
  EA_EMAIL: z.string().optional(),
  EA_PASSWORD: z.string().optional(),
  BASE_URL_PORTAL: z.url().optional(),
  BASE_URL_DASHBOARD: z.url().optional(),
  BASE_URL_CORE: z.url().optional(),
  // Reserved for future API/auth flows; don't block Playwright bootstrap if they are unset or non-URL today.
  BASE_URL_API_GATEWAY: z.string().optional(),
  BASE_URL_AUTH: z.string().optional(),
});

export const env = envSchema.parse(process.env);

/** Base URL del dashboard; usar en tests que navegan al dashboard (system-management, login). */
export function requireDashboardBaseUrl(): string {
  const url = env.BASE_URL_DASHBOARD;
  if (!url) {
    throw new Error("BASE_URL_DASHBOARD must be set in environment");
  }
  return url;
}
