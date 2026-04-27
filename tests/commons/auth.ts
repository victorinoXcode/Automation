import {mkdirSync} from "node:fs";
import path from "node:path";

export type AuthRole = "zpo" | "client" | "advisor" | "ea" | "pm";

const AUTH_DIR = path.resolve(process.cwd(), "playwright/.auth");

export const AUTH_STORAGE_STATE: Record<AuthRole, string> = {
  zpo: path.join(AUTH_DIR, "zpo.json"),
  client: path.join(AUTH_DIR, "client.json"),
  advisor: path.join(AUTH_DIR, "advisor.json"),
  ea: path.join(AUTH_DIR, "ea.json"),
  pm: path.join(AUTH_DIR, "pm.json"),
};

export function ensureAuthStorageDir() {
  mkdirSync(AUTH_DIR, {recursive: true});
}
