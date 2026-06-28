import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DemoRequestBody {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  jobTitle?: string;
  organizationType?: string;
  organizationSize?: string;
  preferredDate?: string;
  preferredTime?: string;
  primaryInterest?: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Sanitisation helper — strip HTML / script tags, trim whitespace
// ---------------------------------------------------------------------------
function sanitise(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'`]/g, "")
    .trim()
    .slice(0, 500);
}

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[\+\d][\d\s\-\(\)]{6,19}$/.test(phone);
}

// ---------------------------------------------------------------------------
// Main handler — Saves lead data to Supabase (best-effort backup database logging)
// ---------------------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body as DemoRequestBody;

  const fullName = sanitise(body.fullName);
  const email = sanitise(body.email);
  const phone = sanitise(body.phone);
  const companyName = sanitise(body.companyName);

  const errors: string[] = [];
  if (!fullName) errors.push("Full name is required.");
  if (!email || !isValidEmail(email)) errors.push("A valid work email is required.");
  if (!phone || !isValidPhone(phone)) errors.push("A valid phone number is required.");
  if (!companyName) errors.push("Company name is required.");

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(" ") });
  }

  const data: DemoRequestBody = {
    fullName,
    email,
    phone,
    companyName,
    jobTitle: sanitise(body.jobTitle),
    organizationType: sanitise(body.organizationType),
    organizationSize: sanitise(body.organizationSize),
    preferredDate: sanitise(body.preferredDate),
    preferredTime: sanitise(body.preferredTime),
    primaryInterest: sanitise(body.primaryInterest),
    notes: sanitise(body.notes),
  };

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error: dbError } = await supabase.from("demo_requests").insert([
        {
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          institution: data.companyName,
          job_title: data.jobTitle || null,
          organization_type: data.organizationType || null,
          organization_size: data.organizationSize || null,
          preferred_date: data.preferredDate || null,
          preferred_time: data.preferredTime || null,
          primary_interest: data.primaryInterest || null,
          message: data.notes || null,
        },
      ]);

      if (dbError) {
        console.warn("[demo-request] Supabase insert warning (non-fatal):", dbError.message);
      } else {
        console.log("[demo-request] Lead saved to Supabase.");
      }
    } catch (dbErr: unknown) {
      console.warn("[demo-request] Supabase unavailable (non-fatal):", dbErr);
    }
  }

  return res.status(200).json({ success: true });
}
