import {chromium, type FullConfig} from "@playwright/test";

import {
  AUTH_STORAGE_STATE,
  type AuthRole,
  ensureAuthStorageDir,
} from "./tests/commons/auth";
import {
  getRoleCredentials,
  loginToDashboardAsRole,
} from "./tests/utils/auth";

const PROJECT_AUTH_ROLES: Partial<Record<string, AuthRole[]>> = {
  "system-management-chromium": ["pm", "zpo"],
};

function getSelectedProjectNames() {
  const selectedProjects = new Set<string>();

  for (const argument of process.argv) {
    if (argument.startsWith("--project=")) {
      selectedProjects.add(argument.slice("--project=".length));
    }
  }

  return selectedProjects;
}

function getRequiredRoles(config: FullConfig): AuthRole[] {
  const requiredRoles = new Set<AuthRole>();
  const selectedProjects = getSelectedProjectNames();

  for (const project of config.projects) {
    if (selectedProjects.size > 0 && !selectedProjects.has(project.name)) {
      continue;
    }

    const roles = PROJECT_AUTH_ROLES[project.name] ?? [];
    for (const role of roles) {
      requiredRoles.add(role);
    }
  }

  return [...requiredRoles];
}

export default async function globalSetup(config: FullConfig) {
  ensureAuthStorageDir();

  const requiredRoles = getRequiredRoles(config).filter((role) => {
    const c = getRoleCredentials(role);
    return Boolean(c.email && c.password);
  });

  if (requiredRoles.length === 0) {
    return;
  }

  const browser = await chromium.launch();

  try {
    for (const role of requiredRoles) {
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        await loginToDashboardAsRole(page, role);
        await context.storageState({path: AUTH_STORAGE_STATE[role]});
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
