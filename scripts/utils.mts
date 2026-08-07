const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
} as const;

export const log = {
  step: (msg: string): void => console.log(`${c.cyan}▶${c.reset} ${msg}`),
  ok: (msg: string): void => console.log(`${c.green}✔${c.reset} ${msg}`),
  info: (msg: string): void => console.log(`${c.dim}${msg}${c.reset}`),
  warn: (msg: string): void => console.warn(`${c.yellow}⚠${c.reset} ${msg}`),
  fail: (msg: string): void => console.error(`${c.red}✖${c.reset} ${msg}`),
  title: (msg: string): void => console.log(`\n${c.bold}${c.blue}${msg}${c.reset}\n`),
} as const;

/** Read an env var or `exit(1)` with a clear message. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    log.fail(`${c.bold}${name}${c.reset} is not set in environment variables`);
    process.exit(1);
  }
  return value;
}
