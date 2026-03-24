/** Demo session gate: set after login, register, or guest entry. Not a substitute for real auth. */
const DEMO_SESSION_KEY = "adgenxai_demo_session";

export function setDemoSession(): void {
  try {
    sessionStorage.setItem(DEMO_SESSION_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearDemoSession(): void {
  try {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function hasDemoSession(): boolean {
  try {
    return sessionStorage.getItem(DEMO_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}
