/**
 * Screenshot Bhraman pages - including authenticated operator dashboards.
 *
 * Usage:
 *   npm run dev -- -p 3001
 *   npm run screenshots
 *
 * Auth: uses demo operator Clerk credentials from the product
 *   (konkan-wave-adventures@example.com / password, OTP 424242).
 * Signs in, then walks dashboard routes and clicks into first booking/listing.
 *
 * Env / flags:
 *   --base=http://localhost:3001
 *   --out=screenshots/latest   or OUT_DIR=
 *   --motion                   longer settle for animations
 *   --headed                   show browser (debug auth)
 *   --skip-auth                public pages only
 */

import { chromium, type Page, type BrowserContext } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_BASE = "http://localhost:3001";

/** Matches src/lib/operator-emails.ts DEMO_OPERATOR_CREDENTIALS */
const DEMO_OPERATOR = {
  email:
    process.env.OPERATOR_SHOT_EMAIL || "konkan-wave-adventures@example.com",
  password: process.env.OPERATOR_SHOT_PASSWORD || "password",
  otp: process.env.OPERATOR_SHOT_OTP || "424242",
};

type Route = { path: string; name: string; settleMs?: number };

/** Public / marketing - no login */
const PUBLIC_ROUTES: Route[] = [
  { path: "/", name: "00-home", settleMs: 1400 },
  { path: "/discover", name: "01-discover" },
  { path: "/plan", name: "02-plan" },
  {
    path: "/plan?q=first%20trek%20easy%20this%20weekend",
    name: "02b-plan-seeded",
  },
  { path: "/operators", name: "03-operators" },
  { path: "/about", name: "04-about" },
  { path: "/how-it-works", name: "05-how-it-works" },
  { path: "/become-operator", name: "06-become-operator" },
  { path: "/privacy", name: "07-privacy" },
  { path: "/terms", name: "08-terms" },
];

/** Auth UI only (capture once - not dashboards) */
const AUTH_UI_ROUTES: Route[] = [
  { path: "/operator/sign-in", name: "auth-operator-sign-in", settleMs: 900 },
  { path: "/operator/sign-up", name: "auth-operator-sign-up", settleMs: 900 },
  { path: "/sign-in", name: "auth-traveler-sign-in", settleMs: 900 },
  { path: "/sign-up", name: "auth-traveler-sign-up", settleMs: 900 },
];

/** Require operator session */
const OPERATOR_APP_ROUTES: Route[] = [
  { path: "/operator", name: "op-dashboard", settleMs: 1000 },
  { path: "/operator/listings", name: "op-listings", settleMs: 900 },
  { path: "/operator/bookings", name: "op-bookings", settleMs: 900 },
  { path: "/operator/availability", name: "op-availability", settleMs: 900 },
  { path: "/operator/customers", name: "op-customers", settleMs: 900 },
  { path: "/operator/verification", name: "op-verification", settleMs: 900 },
  { path: "/operator/payouts", name: "op-payouts", settleMs: 900 },
];

type ShotMode = "both" | "fold" | "full";

function parseArgs(argv: string[]) {
  const flags = new Set(
    argv.filter((a) => a.startsWith("--") && !a.includes("=")),
  );
  const outArg = argv.find((a) => a.startsWith("--out="));
  const baseArg = argv.find((a) => a.startsWith("--base="));
  return {
    baseUrl: (
      baseArg?.slice("--base=".length) ||
      process.env.BASE_URL ||
      DEFAULT_BASE
    ).replace(/\/$/, ""),
    keepMotion: flags.has("--motion"),
    headed: flags.has("--headed"),
    skipAuth: flags.has("--skip-auth"),
    mode: flags.has("--fold-only")
      ? ("fold" as ShotMode)
      : flags.has("--full-only")
        ? ("full" as ShotMode)
        : ("both" as ShotMode),
    outDir:
      outArg?.slice("--out=".length) ||
      process.env.OUT_DIR ||
      path.join(
        "screenshots",
        new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19),
      ),
  };
}

function slugifyFile(input: string) {
  return input
    .replace(/^https?:\/\//, "")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function waitForPageReady(
  page: Page,
  settleMs: number,
  keepMotion: boolean,
) {
  await page.waitForLoadState("domcontentloaded");
  try {
    await page.waitForLoadState("networkidle", { timeout: 12_000 });
  } catch {
    /* maps / clerk keep sockets open */
  }
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });

  const base = keepMotion ? Math.max(settleMs, 1200) : settleMs;
  await page.waitForTimeout(base);

  await page.evaluate(async () => {
    const step = Math.max(400, Math.floor(window.innerHeight * 0.85));
    const max = Math.min(document.body.scrollHeight, 6000);
    for (let y = 0; y < max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(keepMotion ? 400 : 200);
}

async function hideFloatingChrome(page: Page) {
  await page
    .evaluate(() => {
      document.querySelectorAll("button, a, div").forEach((el) => {
        const style = window.getComputedStyle(el);
        if (
          style.position === "fixed" &&
          (style.bottom === "0px" || parseInt(style.bottom || "0", 10) < 48) &&
          parseInt(style.right || "999", 10) < 140
        ) {
          (el as HTMLElement).style.visibility = "hidden";
        }
      });
    })
    .catch(() => undefined);
}

async function clickContinue(page: Page) {
  const btn = page.getByRole("button", {
    name: /^(continue|sign in|create account|verify|submit)$/i,
  });
  if (await btn.count()) {
    await btn.first().click();
    return;
  }
  await page
    .locator('button[data-localization-key="formButtonPrimary"]')
    .first()
    .click();
}

async function fillClerkIdentifier(page: Page, email: string) {
  const emailBox = page
    .locator(
      'input[name="identifier"], input[type="email"], input[autocomplete="username"]',
    )
    .first();
  await emailBox.waitFor({ state: "visible", timeout: 20_000 });
  await emailBox.fill(email);
  await clickContinue(page);
}

async function fillClerkPassword(page: Page, password: string) {
  const pass = page
    .locator(
      'input[name="password"], input[type="password"], input[autocomplete="current-password"]',
    )
    .first();
  await pass.waitFor({ state: "visible", timeout: 20_000 });
  await pass.fill(password);
  await clickContinue(page);
}

async function fillClerkOtpIfPresent(page: Page, otp: string) {
  const otpInput = page
    .locator(
      'input[name="code"], input[autocomplete="one-time-code"], input[inputmode="numeric"]',
    )
    .first();
  try {
    await otpInput.waitFor({ state: "visible", timeout: 4_000 });
  } catch {
    return;
  }
  await otpInput.fill(otp);
  await clickContinue(page);
}

async function waitUntilOperatorApp(page: Page, baseUrl: string) {
  await page.waitForURL(
    (url) => {
      const u = url.toString();
      return (
        u.startsWith(`${baseUrl}/operator`) &&
        !u.includes("/sign-in") &&
        !u.includes("/sign-up") &&
        !u.includes("/enter")
      );
    },
    { timeout: 60_000 },
  );
}

/**
 * Sign up once (if needed), then sign in as demo operator.
 * Leaves the browser on /operator dashboard.
 */
async function ensureOperatorSession(
  page: Page,
  baseUrl: string,
): Promise<boolean> {
  console.log(`\nOperator auth → ${DEMO_OPERATOR.email}`);

  // Quick check: already in?
  await page.goto(`${baseUrl}/operator`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForTimeout(1500);
  if (
    !page.url().includes("sign-in") &&
    !page.url().includes("sign-up") &&
    !page.url().includes("/enter") &&
    page.url().includes("/operator")
  ) {
    console.log("  already signed in\n");
    return true;
  }

  // Try sign-in first
  await page.goto(`${baseUrl}/operator/sign-in`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForTimeout(1200);

  try {
    await fillClerkIdentifier(page, DEMO_OPERATOR.email);
    await page.waitForTimeout(800);
    await fillClerkPassword(page, DEMO_OPERATOR.password);
    await fillClerkOtpIfPresent(page, DEMO_OPERATOR.otp);
    await waitUntilOperatorApp(page, baseUrl);
    console.log("  signed in ✓\n");
    return true;
  } catch (e) {
    console.warn("  sign-in failed, trying sign-up…", (e as Error).message);
  }

  // Sign up with same demo creds
  await page.goto(`${baseUrl}/operator/sign-up`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForTimeout(1200);

  try {
    await fillClerkIdentifier(page, DEMO_OPERATOR.email);
    await page.waitForTimeout(800);

    // Sign-up password fields (sometimes password + confirm)
    const passwords = page.locator('input[type="password"]');
    const count = await passwords.count();
    if (count >= 1) {
      await passwords.nth(0).fill(DEMO_OPERATOR.password);
      if (count >= 2) await passwords.nth(1).fill(DEMO_OPERATOR.password);
      await clickContinue(page);
    }

    await fillClerkOtpIfPresent(page, DEMO_OPERATOR.otp);
    await page.waitForTimeout(1500);

    // After sign-up, product sends to sign-in
    if (page.url().includes("sign-in") || page.url().includes("sign-up")) {
      await page.goto(`${baseUrl}/operator/sign-in`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForTimeout(1000);
      await fillClerkIdentifier(page, DEMO_OPERATOR.email);
      await page.waitForTimeout(800);
      await fillClerkPassword(page, DEMO_OPERATOR.password);
      await fillClerkOtpIfPresent(page, DEMO_OPERATOR.otp);
    }

    await waitUntilOperatorApp(page, baseUrl);
    console.log("  signed up + signed in ✓\n");
    return true;
  } catch (e) {
    console.error("  auth failed:", (e as Error).message);
    await page
      .screenshot({
        path: path.join("screenshots", "auth-failure.png"),
        fullPage: true,
      })
      .catch(() => undefined);
    return false;
  }
}

async function discoverDynamicRoutes(page: Page, baseUrl: string) {
  const found: Route[] = [];

  async function collect(hrefs: string[], kind: "listing" | "operator") {
    const uniq = Array.from(new Set(hrefs)).slice(
      0,
      kind === "listing" ? 4 : 3,
    );
    for (const href of uniq) {
      try {
        const u = new URL(href, baseUrl);
        if (u.origin !== new URL(baseUrl).origin) continue;
        const p = u.pathname;
        if (kind === "listing" && p.startsWith("/listings/")) {
          const slug = p.split("/").pop() || "x";
          found.push({
            path: p,
            name: `listing-${slugifyFile(slug)}`,
            settleMs: 1000,
          });
          found.push({
            path: `/book/${slug}`,
            name: `book-${slugifyFile(slug)}`,
            settleMs: 900,
          });
        }
        if (kind === "operator" && /^\/operators\/[^/]+$/.test(p)) {
          found.push({
            path: p,
            name: `operator-profile-${slugifyFile(p.split("/").pop() || "x")}`,
            settleMs: 1000,
          });
        }
      } catch {
        /* ignore */
      }
    }
  }

  try {
    await page.goto(`${baseUrl}/discover`, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    await page.waitForTimeout(2000);
    await page
      .waitForSelector('a[href*="/listings/"]', { timeout: 20_000 })
      .catch(() => null);
    const listingHrefs = await page.$$eval('a[href*="/listings/"]', (els) =>
      els.map((el) => (el as HTMLAnchorElement).href),
    );
    await collect(listingHrefs, "listing");
  } catch (e) {
    console.warn("  ! discover crawl failed:", (e as Error).message);
  }

  try {
    await page.goto(`${baseUrl}/operators`, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    await page.waitForTimeout(2000);
    const opHrefs = await page.$$eval('a[href*="/operators/"]', (els) =>
      els.map((el) => (el as HTMLAnchorElement).href),
    );
    await collect(opHrefs, "operator");
  } catch (e) {
    console.warn("  ! operators crawl failed:", (e as Error).message);
  }

  return found;
}

/** After auth: open first booking detail + first listing edit if links exist */
async function discoverOperatorDeepLinks(page: Page, baseUrl: string) {
  const extra: Route[] = [];

  try {
    await page.goto(`${baseUrl}/operator/bookings`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(1200);
    const bookingHref = await page
      .locator('a[href*="/operator/bookings/"]')
      .first()
      .getAttribute("href")
      .catch(() => null);
    if (bookingHref && /\/operator\/bookings\/[^/]+/.test(bookingHref)) {
      const p = bookingHref.startsWith("http")
        ? new URL(bookingHref).pathname
        : bookingHref;
      extra.push({
        path: p,
        name: `op-booking-${slugifyFile(p.split("/").pop() || "detail")}`,
        settleMs: 1000,
      });
    }
  } catch {
    /* no bookings yet */
  }

  try {
    await page.goto(`${baseUrl}/operator/listings`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(1200);
    // Prefer edit/detail links if present
    const listingAction = await page
      .locator(
        'a[href*="/operator/listings/"], button:has-text("Edit"), a:has-text("Edit")',
      )
      .first()
      .getAttribute("href")
      .catch(() => null);
    if (listingAction && listingAction.includes("/operator/")) {
      const p = listingAction.startsWith("http")
        ? new URL(listingAction).pathname
        : listingAction;
      extra.push({
        path: p,
        name: `op-listing-action-${slugifyFile(p.split("/").pop() || "x")}`,
        settleMs: 900,
      });
    }
  } catch {
    /* ok */
  }

  return extra;
}

async function shotPage(
  page: Page,
  opts: {
    baseUrl: string;
    route: Route;
    outDir: string;
    mode: ShotMode;
    keepMotion: boolean;
    index: number;
    total: number;
  },
) {
  const url = `${opts.baseUrl}${opts.route.path}`;
  process.stdout.write(
    `[${opts.index}/${opts.total}] ${opts.route.name}  ${opts.route.path} … `,
  );

  const response = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  const status = response?.status() ?? 0;
  const landed = page.url();

  // Detect auth bounce for operator app routes
  const wantedOp =
    opts.route.path.startsWith("/operator") &&
    !opts.route.path.includes("sign-");
  const bouncedToAuth =
    wantedOp &&
    (landed.includes("sign-in") ||
      landed.includes("sign-up") ||
      landed.includes("/enter"));

  await waitForPageReady(page, opts.route.settleMs ?? 700, opts.keepMotion);
  await hideFloatingChrome(page);

  const baseName = `${String(opts.index).padStart(2, "0")}-${opts.route.name}`;
  const tag = bouncedToAuth ? "--AUTH-WALL" : "";

  if (opts.mode === "fold" || opts.mode === "both") {
    await page.screenshot({
      path: path.join(opts.outDir, `${baseName}${tag}--fold.png`),
      fullPage: false,
    });
  }
  if (opts.mode === "full" || opts.mode === "both") {
    await page.screenshot({
      path: path.join(opts.outDir, `${baseName}${tag}--full.png`),
      fullPage: true,
    });
  }

  if (bouncedToAuth) console.log("AUTH WALL (not logged in)");
  else console.log(status >= 400 ? `HTTP ${status}` : "ok");

  return {
    name: opts.route.name,
    path: opts.route.path,
    status,
    url,
    landed,
    bouncedToAuth,
  };
}

async function runBatch(
  page: Page,
  routes: Route[],
  opts: {
    baseUrl: string;
    outDir: string;
    mode: ShotMode;
    keepMotion: boolean;
    startIndex: number;
    total: number;
  },
) {
  const results: Awaited<ReturnType<typeof shotPage>>[] = [];
  for (let i = 0; i < routes.length; i++) {
    try {
      results.push(
        await shotPage(page, {
          ...opts,
          route: routes[i],
          index: opts.startIndex + i,
        }),
      );
    } catch (e) {
      console.log("FAIL");
      console.warn(`  ${(e as Error).message}`);
      results.push({
        name: routes[i].name,
        path: routes[i].path,
        status: 0,
        url: `${opts.baseUrl}${routes[i].path}`,
        landed: "",
        bouncedToAuth: false,
      });
    }
  }
  return results;
}

async function main() {
  const { baseUrl, keepMotion, mode, outDir, headed, skipAuth } = parseArgs(
    process.argv.slice(2),
  );
  await fs.mkdir(outDir, { recursive: true });

  console.log(`\nBhraman screenshots`);
  console.log(`  base:   ${baseUrl}`);
  console.log(`  out:    ${outDir}`);
  console.log(`  mode:   ${mode}`);
  console.log(
    `  auth:   ${skipAuth ? "skipped" : "operator login + dashboards"}`,
  );
  console.log(`  motion: ${keepMotion ? "on" : "reduced"}\n`);

  try {
    const probe = await fetch(baseUrl, { signal: AbortSignal.timeout(60_000) });
    console.log(`  server: HTTP ${probe.status}\n`);
  } catch {
    console.error(
      `\nCould not reach ${baseUrl}.\nStart: npx next dev -p 3001\n`,
    );
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: !headed });
  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: keepMotion ? "no-preference" : "reduce",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(90_000);

  console.log("Discovering public listing / operator URLs…");
  const dynamic = await discoverDynamicRoutes(page, baseUrl);
  console.log(`  found ${dynamic.length} dynamic routes\n`);

  const publicRoutes = [...PUBLIC_ROUTES, ...dynamic];
  const seen = new Set<string>();
  const uniquePublic = publicRoutes.filter((r) => {
    if (seen.has(r.path)) return false;
    seen.add(r.path);
    return true;
  });

  let allRoutesEstimate =
    uniquePublic.length +
    AUTH_UI_ROUTES.length +
    OPERATOR_APP_ROUTES.length +
    2;
  let index = 1;
  const results: Awaited<ReturnType<typeof shotPage>>[] = [];

  // 1) Public
  results.push(
    ...(await runBatch(page, uniquePublic, {
      baseUrl,
      outDir,
      mode,
      keepMotion,
      startIndex: index,
      total: allRoutesEstimate,
    })),
  );
  index += uniquePublic.length;

  // 2) Auth UI (document the walls once)
  results.push(
    ...(await runBatch(page, AUTH_UI_ROUTES, {
      baseUrl,
      outDir,
      mode,
      keepMotion,
      startIndex: index,
      total: allRoutesEstimate,
    })),
  );
  index += AUTH_UI_ROUTES.length;

  // 3) Sign in + operator app
  if (!skipAuth) {
    const ok = await ensureOperatorSession(page, baseUrl);
    if (ok) {
      const deep = await discoverOperatorDeepLinks(page, baseUrl);
      const opRoutes = [...OPERATOR_APP_ROUTES, ...deep];
      allRoutesEstimate = index + opRoutes.length - 1;
      results.push(
        ...(await runBatch(page, opRoutes, {
          baseUrl,
          outDir,
          mode,
          keepMotion,
          startIndex: index,
          total: index + opRoutes.length - 1,
        })),
      );

      // Action: on verification page, scroll form; on availability click a control if any
      try {
        await page.goto(`${baseUrl}/operator/verification`, {
          waitUntil: "domcontentloaded",
        });
        await page.waitForTimeout(800);
        const input = page.locator("input, textarea, select").first();
        if (await input.count()) {
          await input.focus({ timeout: 1000 }).catch(() => undefined);
          await page.screenshot({
            path: path.join(outDir, `zz-op-verification-focused--fold.png`),
            fullPage: false,
          });
          console.log("  action: focused verification field");
        }
      } catch {
        /* optional */
      }
    } else {
      console.warn(
        "\nSkipping operator dashboards - could not complete Clerk login.\n",
      );
    }
  }

  await browser.close();

  const manifest = {
    createdAt: new Date().toISOString(),
    baseUrl,
    mode,
    keepMotion,
    operatorEmail: DEMO_OPERATOR.email,
    count: results.length,
    authWalls: results.filter((r) => r.bouncedToAuth).length,
    results,
  };
  await fs.writeFile(
    path.join(outDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  const ok = results.filter((r) => r.status > 0 && r.status < 400).length;
  const walls = results.filter((r) => r.bouncedToAuth).length;
  console.log(
    `\nDone. ${ok}/${results.length} reachable` +
      (walls ? ` (${walls} still hit auth wall)` : "") +
      ` → ${outDir}\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
