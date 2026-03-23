import puppeteer from "puppeteer";

export async function submitAppeal(
  username: string,
  email: string,
  appealText: string
): Promise<{ success: boolean; error?: string }> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    // Go to Roblox support
    await page.goto("https://www.roblox.com/support", { waitUntil: "networkidle2", timeout: 30000 });

    // Fill date of birth to get past the age gate (use a generic adult DOB)
    await page.waitForSelector("select", { timeout: 10000 });
    const selects = await page.$$("select");
    if (selects.length >= 3) {
      await selects[0].select("1"); // January
      await selects[1].select("1"); // Day 1
      await selects[2].select("1995"); // Year
    }

    // Click Continue
    const continueBtn = await page.$("button[data-testid='dob-submit'], button[type='submit']");
    if (continueBtn) await continueBtn.click();

    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {});

    // Fill the support form
    await page.waitForSelector("input[name='username'], input[placeholder*='username' i]", { timeout: 10000 });

    // Username
    const usernameInput = await page.$("input[name='username'], input[placeholder*='username' i]");
    if (usernameInput) {
      await usernameInput.click({ clickCount: 3 });
      await usernameInput.type(username);
    }

    // Email
    const emailInput = await page.$("input[type='email'], input[name='email']");
    if (emailInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type(email);
    }

    // Issue type — select "Account" or "Moderation"
    const issueSelect = await page.$("select[name='issueType'], select[name='category']");
    if (issueSelect) {
      await issueSelect.select("Account");
    }

    // Description / message
    const textarea = await page.$("textarea");
    if (textarea) {
      await textarea.click({ clickCount: 3 });
      await textarea.type(appealText);
    }

    // Submit
    const submitBtn = await page.$("button[type='submit']");
    if (submitBtn) await submitBtn.click();

    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {});

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  } finally {
    await browser.close();
  }
}
