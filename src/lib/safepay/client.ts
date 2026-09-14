import "server-only";
import crypto from "crypto";

/**
 * Minimal Safepay client, hand-rolled against the same API the official
 * `@sfpy/node-sdk` wraps (verified by reading its source directly — see
 * https://github.com/getsafepay/safepay-node). Reimplemented with native
 * `fetch` instead of depending on that package, because it pins an old axios
 * with multiple unpatched high-severity CVEs and no available fix; the
 * surface actually needed here is one POST call, pure URL building, and an
 * HMAC check, so vendoring it is safer than adding that dependency.
 */

export type SafepayCurrency = "PKR" | "USD";

interface SafepayConfig {
  environment: "sandbox" | "production";
  apiKey: string;
  secretKey: string;
  webhookSecret: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function getSafepayConfig(): SafepayConfig {
  const environment = process.env.SAFEPAY_ENVIRONMENT === "production" ? "production" : "sandbox";
  return {
    environment,
    apiKey: requireEnv("SAFEPAY_API_KEY"),
    secretKey: requireEnv("SAFEPAY_SECRET_KEY"),
    webhookSecret: requireEnv("SAFEPAY_WEBHOOK_SECRET")
  };
}

function apiBaseUrl(environment: SafepayConfig["environment"]): string {
  return environment === "production" ? "https://api.getsafepay.com" : "https://sandbox.api.getsafepay.com";
}

function checkoutBaseUrl(environment: SafepayConfig["environment"]): string {
  return environment === "production" ? "https://getsafepay.com/checkout" : "https://sandbox.api.getsafepay.com/checkout";
}

/**
 * Initializes a payment "tracker" and returns a beacon token used to build
 * the hosted checkout link. `amount` is in the currency's MAJOR units (e.g.
 * pass 100 for PKR 100, not 10000 paisa) — confirmed against the SDK's own
 * webhook test fixture, which shows amount/fee/net as decimal major-unit
 * strings (e.g. "150", "4.92", "145.08").
 */
export async function createSafepayPayment(params: { amount: number; currency: SafepayCurrency }): Promise<{ token: string }> {
  const config = getSafepayConfig();
  const res = await fetch(`${apiBaseUrl(config.environment)}/order/v1/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: params.amount,
      client: config.apiKey,
      currency: params.currency,
      environment: config.environment
    })
  });

  if (!res.ok) {
    throw new Error(`Safepay payment init failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { data: { token: string } };
  return json.data;
}

/** Builds the hosted checkout URL the donor is redirected to. Pure URL construction, no network call. */
export function buildSafepayCheckoutUrl(params: {
  token: string;
  orderId: string;
  cancelUrl: string;
  redirectUrl: string;
  source?: string;
  webhooks?: boolean;
}): string {
  const config = getSafepayConfig();
  const url = checkoutBaseUrl(config.environment);

  const query = new URLSearchParams({
    beacon: params.token,
    cancel_url: params.cancelUrl,
    env: config.environment,
    order_id: params.orderId,
    redirect_url: params.redirectUrl,
    source: params.source ?? "custom",
    webhooks: String(params.webhooks ?? true)
  });

  return `${url}/pay?${query.toString()}`;
}

export interface SafepayWebhookNotification {
  amount: string;
  currency: SafepayCurrency;
  fee: string;
  intent: string;
  metadata: Record<string, string>;
  net: string;
  state: string;
  tracker: string;
  user: string;
}

export interface SafepayWebhookPayload {
  client_id: string;
  created_at: string;
  endpoint: string;
  notification: SafepayWebhookNotification;
  token: string;
  type: string;
  updated_at: string;
}

/**
 * Verifies a webhook request's HMAC-SHA512 signature against the shared
 * webhook secret. Mirrors the official SDK exactly: the signature covers
 * `JSON.stringify(body.data)`, compared against the `x-sfpy-signature`
 * header.
 */
export function verifySafepayWebhookSignature(body: { data: SafepayWebhookPayload }, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const config = getSafepayConfig();
  const data = Buffer.from(JSON.stringify(body.data));
  const expected = crypto.createHmac("sha512", config.webhookSecret).update(data).digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signatureHeader, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
