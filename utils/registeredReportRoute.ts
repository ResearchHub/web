import { buildWorkUrl, generateSlug } from '@/utils/url';
import type {
  RegisteredReportStage,
  RegisteredReportTrackerStep,
  RegisteredReportWorkResponse,
} from '@/types/registeredReport';

const TOKEN_VERSION = 1;
const TOKEN_KEY = 'rh-rr-v1';

export interface RegisteredReportRoutePayload {
  v: 1;
  r: number;
  g?: number;
  f?: number;
}

export type NextSearchParams = Record<string, string | string[] | undefined>;

/**
 * Encodes registered-report route context into a tiny reversible URL token.
 */
export function encodeRegisteredReportRoutePayload(
  payload: Omit<RegisteredReportRoutePayload, 'v'> | RegisteredReportRoutePayload
): string {
  const normalizedPayload: RegisteredReportRoutePayload = {
    v: TOKEN_VERSION,
    r: parsePositiveInteger(payload.r, 'registered report ID'),
    ...(payload.g === undefined ? {} : { g: parsePositiveInteger(payload.g, 'grant ID') }),
    ...(payload.f === undefined ? {} : { f: parsePositiveInteger(payload.f, 'fundraise ID') }),
  };
  const json = JSON.stringify(normalizedPayload);
  const encoded = encodeBase64Url(xorBytes(encodeUtf8(json)));
  return `${encoded}.${computeChecksum(encoded)}`;
}

/**
 * Decodes a registered-report route token and rejects malformed payloads.
 */
export function decodeRegisteredReportRoutePayload(
  token: string | null | undefined
): RegisteredReportRoutePayload | null {
  if (!token) return null;

  const [encoded, checksum, extra] = token.split('.');
  if (!encoded || !checksum || extra || computeChecksum(encoded) !== checksum) {
    return null;
  }

  try {
    const json = decodeUtf8(xorBytes(decodeBase64Url(encoded)));
    const parsed = JSON.parse(json) as Partial<RegisteredReportRoutePayload>;

    if (parsed.v !== TOKEN_VERSION || !isPositiveInteger(parsed.r)) {
      return null;
    }

    if (parsed.g !== undefined && !isPositiveInteger(parsed.g)) {
      return null;
    }

    if (parsed.f !== undefined && !isPositiveInteger(parsed.f)) {
      return null;
    }

    return {
      v: TOKEN_VERSION,
      r: parsed.r,
      ...(parsed.g === undefined ? {} : { g: parsed.g }),
      ...(parsed.f === undefined ? {} : { f: parsed.f }),
    };
  } catch {
    return null;
  }
}

/**
 * Builds a normal work-page route for a registered-report tracker step.
 */
export function buildRegisteredReportTrackerHref(
  step: RegisteredReportTrackerStep,
  rr: string
): string | null {
  if (!step.exists || !step.postId) return null;

  const baseHref = buildRegisteredReportStepHref(step.stage, step.postId, step.title);
  if (!baseHref) return null;
  if (step.stage === 'registered_report') return baseHref;

  const separator = baseHref.includes('?') ? '&' : '?';
  return `${baseHref}${separator}rr=${encodeURIComponent(rr)}`;
}

/**
 * Resolves the route path for a registered-report tracker stage.
 */
export function buildRegisteredReportStepHref(
  stage: RegisteredReportStage,
  postId: number,
  title?: string | null
): string | null {
  const slug = title ? generateSlug(title) : undefined;

  if (stage === 'grant') {
    return buildWorkUrl({ id: postId, slug, contentType: 'funding_request' });
  }

  if (stage === 'proposal') {
    return buildWorkUrl({ id: postId, slug, contentType: 'preregistration' });
  }

  if (stage === 'registered_report') {
    return slug ? `/report/${postId}/${slug}` : `/report/${postId}`;
  }

  return null;
}

/**
 * Reads a single string query value from Next search params.
 */
export function getSingleQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Creates URLSearchParams from Next's plain search params object.
 */
export function createUrlSearchParams(searchParams?: NextSearchParams): URLSearchParams {
  const urlSearchParams = new URLSearchParams();
  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => urlSearchParams.append(key, item));
      return;
    }

    if (value !== undefined) {
      urlSearchParams.set(key, value);
    }
  });

  return urlSearchParams;
}

/**
 * Returns true when a registered-report tracker payload matches the current route.
 */
export function doesRegisteredReportPayloadMatchRoute({
  payload,
  currentStage,
  currentPostId,
}: {
  payload: RegisteredReportWorkResponse;
  currentStage: RegisteredReportStage;
  currentPostId: number | string;
}): boolean {
  const normalizedPostId = Number(currentPostId);
  if (!Number.isInteger(normalizedPostId) || normalizedPostId <= 0) return false;

  if (currentStage === 'registered_report' && payload.work.id !== normalizedPostId) {
    return false;
  }

  const currentStep = payload.tracker.find((step) => step.stage === currentStage);
  if (!currentStep?.exists) return false;

  return currentStep.postId === normalizedPostId;
}

/**
 * Returns true when an optional token ID matches a known route ID.
 */
export function doesOptionalRouteIdMatch({
  tokenValue,
  currentValue,
}: {
  tokenValue: number | undefined;
  currentValue: number | string | null | undefined;
}): boolean {
  if (tokenValue === undefined) {
    return true;
  }

  if (currentValue === undefined || currentValue === null) return false;

  return tokenValue === Number(currentValue);
}

/**
 * Returns true when a value is a positive integer.
 */
function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

/**
 * Parses and validates a required positive integer payload value.
 */
function parsePositiveInteger(value: unknown, label: string): number {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new Error(`Invalid ${label}`);
  }

  return numberValue;
}

/**
 * Converts a string into UTF-8 bytes.
 */
function encodeUtf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

/**
 * Converts UTF-8 bytes into a string.
 */
function decodeUtf8(value: Uint8Array): string {
  return new TextDecoder().decode(value);
}

/**
 * Applies the reversible token obfuscation key to bytes.
 */
function xorBytes(bytes: Uint8Array): Uint8Array {
  const key = encodeUtf8(TOKEN_KEY);
  return bytes.map((byte, index) => byte ^ key[index % key.length]);
}

/**
 * Encodes bytes into base64url.
 */
function encodeBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  const base64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(bytes).toString('base64');

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/**
 * Decodes base64url into bytes.
 */
function decodeBase64Url(value: string): Uint8Array {
  const padded = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');

  if (typeof atob === 'function') {
    return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  }

  return Uint8Array.from(Buffer.from(padded, 'base64'));
}

/**
 * Computes a lightweight checksum for accidental token edits.
 */
function computeChecksum(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}
