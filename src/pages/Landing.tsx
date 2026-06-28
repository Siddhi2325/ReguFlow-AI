import { useState } from "react";
import Logo from "@/components/shared/Logo";
import { 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  UploadCloud, 
  GitCompare, 
  AlertTriangle, 
  ListTodo, 
  Brain, 
  FileText, 
  CheckSquare, 
  ClipboardCheck, 
  Check, 
  X, 
  ExternalLink,
  Download,
  Terminal,
  Settings,
  Lock,
  Layers,
  Activity,
  Users,
  CheckCircle,
  Building,
  TrendingUp,
  Cpu,
  Share2,
  FileSpreadsheet,
  Clock,
  RefreshCw,
  FolderLock
} from "lucide-react";
import { DOWNLOAD_LINKS } from "@/config/download";
import { toast } from "@/hooks/use-toast";

export default function Landing() {
  // ── Demo modal state ────────────────────────────────────────────────────
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const emptyForm = {
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    jobTitle: "",
    organizationType: "",
    organizationSize: "",
    preferredDate: "",
    preferredTime: "",
    primaryInterest: "",
    notes: "",
  };
  const [demoForm, setDemoForm] = useState(emptyForm);

  const setField = (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setDemoForm((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Download handlers ────────────────────────────────────────────────────
  const handleDownload = (platform: "windows" | "android" | "pdf") => {
    if (platform === "android") {
      handleAndroidClick();
      return;
    }

    let url = "";
    if (platform === "windows") {
      url = DOWNLOAD_LINKS.windows;
    } else if (platform === "pdf") {
      url = DOWNLOAD_LINKS.documentationPdf;
    }

    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    if (platform === "pdf") {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      const filename = platform === "windows" ? "ReguFlow AI.exe" : "";
      link.setAttribute("download", filename);
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAutoDownload = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("android")) {
      handleDownload("android");
    } else {
      handleDownload("windows");
    }
  };

  const handleAndroidClick = () => {
    toast({
      title: "Android Client Coming Soon",
      description: "The ReguFlow AI Android client (.apk) is currently undergoing private enterprise testing and will be available soon.",
    });
  };

  const handleSourceClick = (source: string) => {
    if (source === "RBI") {
      toast({
        title: "Active Pipeline",
        description: "RBI Ingestion Stream is fully operational and monitoring circular updates in real-time.",
      });
    } else {
      toast({
        title: "Ingestion Coming Soon",
        description: `ReguFlow AI currently ingestion-tracks RBI (Reserve Bank of India) circulars. Ingestion pipelines for ${source} are under active development and will be available in a future release.`,
      });
    }
  };

  // ── Demo form submit — calls secure Vercel API function ──────────────────
  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormErrors({});

    // Client-side validation matching server-side logic
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+\d][\d\s\-\(\)]{6,19}$/;
    const errors: Record<string, string> = {};

    if (!demoForm.fullName.trim()) {
      errors.fullName = "Full name is required.";
    }
    if (!demoForm.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!phoneRegex.test(demoForm.phone.trim())) {
      errors.phone = "A valid phone number is required (minimum 7 digits).";
    }
    if (!demoForm.email.trim()) {
      errors.email = "Work email is required.";
    } else if (!emailRegex.test(demoForm.email.trim())) {
      errors.email = "A valid work email is required.";
    }
    if (!demoForm.companyName.trim()) {
      errors.companyName = "Company name is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const timestamp = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      });

      const accessKey = import.meta.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "";

      // Post directly to Web3Forms official API
      const web3FormsRes = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey.trim().replace(/^["']|["']$/g, ""),
          subject: "🔔 New Demo Request – ReguFlow AI",
          from_name: "ReguFlow AI Landing Page",
          "Full Name": demoForm.fullName,
          "Company": demoForm.companyName,
          "Job Title": demoForm.jobTitle || "—",
          "Email": demoForm.email,
          "Phone": demoForm.phone,
          "Organization Type": demoForm.organizationType || "—",
          "Organization Size": demoForm.organizationSize || "—",
          "Preferred Demo Date": demoForm.preferredDate || "—",
          "Preferred Demo Time": demoForm.preferredTime || "—",
          "Primary Interest": demoForm.primaryInterest || "—",
          "Additional Notes": demoForm.notes || "—",
          "Submission Time": timestamp,
          "Source": "ReguFlow AI Landing Page"
        }),
      });

      const web3FormsResult = await web3FormsRes.json();
      if (!web3FormsRes.ok || !web3FormsResult.success) {
        throw new Error(web3FormsResult.message || `Web3Forms responded with status ${web3FormsRes.status}`);
      }

      // Fire-and-forget background server logging (best-effort backup database update)
      fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demoForm),
      }).catch((dbErr) => {
        console.warn("Local Supabase database update warning (non-fatal):", dbErr);
      });

      // ── Success ──
      setShowDemoModal(false);
      setDemoForm(emptyForm);
      setFormErrors({});
      toast({
        title: "Demo Request Submitted",
        description: "Thank you! Your demo request has been received successfully. Our team will contact you shortly.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[demo-request] submission failed:", msg);
      toast({
        title: "Submission Failed",
        description: "We couldn't submit your request right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#0F172A] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="w-full h-16 bg-[#0F172A] border-b border-slate-800 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-40 font-medium">
        <div className="flex items-center">
          <Logo theme="dark" size="md" />
        </div>

        {/* Center Nav Items */}
        <nav className="hidden xl:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <button onClick={() => scrollToSection("features")} className="hover:text-white transition-colors uppercase tracking-wider">Features</button>
          <button onClick={() => scrollToSection("workflow")} className="hover:text-white transition-colors uppercase tracking-wider">How It Works</button>
          <button onClick={() => scrollToSection("agents")} className="hover:text-white transition-colors uppercase tracking-wider">Agents</button>
          <button onClick={() => scrollToSection("security")} className="hover:text-white transition-colors uppercase tracking-wider">Security</button>
          <button onClick={() => scrollToSection("integrations")} className="hover:text-white transition-colors uppercase tracking-wider">Integrations</button>
          <button onClick={() => scrollToSection("comparison")} className="hover:text-white transition-colors uppercase tracking-wider">Solutions</button>
          <button onClick={() => scrollToSection("documentation")} className="hover:text-white transition-colors uppercase tracking-wider">Documentation</button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleAutoDownload}
            className="border border-slate-700 text-white bg-transparent hover:bg-slate-800 font-bold text-xs px-4 py-2.5 rounded-none transition-colors uppercase tracking-wider flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
          <button 
            onClick={() => setShowDemoModal(true)}
            className="bg-[#1E40AF] hover:bg-[#1D4ED8] text-white font-bold text-xs px-4 py-2.5 rounded-none transition-colors uppercase tracking-wider"
          >
            Request Demo
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 grid lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 border-l-2 border-[#1E40AF] pl-3">
              <span className="text-xs font-mono font-bold tracking-widest text-[#1E40AF] uppercase">
                Agentic Regulatory Operations Platform
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">
              From Regulation to Action. From Action to Proof.
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              ReguFlow AI is an Agentic Regulatory Operations Platform that converts regulatory updates into measurable action points, implementation workflows, validated evidence, and audit-ready compliance for banks and financial institutions.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button 
                onClick={() => setShowDemoModal(true)}
                className="w-full sm:w-auto bg-[#1E40AF] hover:bg-[#1D4ED8] text-white font-bold text-sm px-8 py-3.5 rounded-none transition-colors uppercase tracking-wider text-center"
              >
                Request Custom Demo
              </button>
              
              <div className="relative w-full sm:w-auto flex flex-col items-center">
                <button 
                  onClick={handleAutoDownload}
                  className="w-full sm:w-auto border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-sm px-8 py-3.5 rounded-none transition-colors uppercase tracking-wider text-center flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#1E40AF]" />
                  <span>Download App</span>
                </button>
                <div className="flex justify-center gap-4 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <button onClick={() => handleDownload("windows")} className="hover:text-[#1E40AF] transition-colors">Windows (.exe)</button>
                  <span>•</span>
                  <button onClick={handleAndroidClick} className="hover:text-[#1E40AF] transition-colors">Android (.apk)</button>
                </div>
              </div>
            </div>

            {/* Enterprise Capability Strip */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>✓ Clause-Level Change Detection</span>
              <span>✓ Measurable Action Points</span>
              <span>✓ AI Document Drafting</span>
              <span>✓ Department Routing</span>
              <span>✓ Evidence Validation</span>
              <span>✓ Audit Readiness</span>
            </div>

            {/* Trusted Banks Ribbon */}
            <div className="pt-4 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                Aligned with Global Banking Standards
              </span>
              <div className="flex flex-wrap items-center gap-6 opacity-60 grayscale">
                <span className="text-xs font-extrabold tracking-wider text-slate-700">FEDERAL RESERVE</span>
                <span className="text-xs font-extrabold tracking-wider text-slate-700 font-mono">RBI COMPLIANT</span>
                <span className="text-xs font-extrabold tracking-wider text-slate-700">BASEL III COMPLIANT</span>
                <span className="text-xs font-extrabold tracking-wider text-slate-700">FINRA COMPLIANT</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="lg:col-span-6 border border-slate-200 bg-[#F8FAFC] p-6 rounded-none shadow-sm relative">
            <div className="bg-slate-900 text-slate-300 p-2 text-[10px] font-mono flex items-center justify-between border-b border-slate-800">
              <span>REGUFLOW AI COMPLIANCE ENGINE v1.2.0</span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-none inline-block"></span>
                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-none inline-block"></span>
                <span className="w-2.5 h-2.5 bg-green-500 rounded-none inline-block"></span>
              </div>
            </div>

            <div className="bg-white p-4 border border-slate-200 font-sans space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase">Live Ingestion Stream</h3>
                  <span className="text-[10px] text-slate-400">Environment: Production | Status: Connected</span>
                </div>
                <div className="bg-green-50 border border-green-200 text-green-700 font-mono text-[10px] px-2 py-0.5 font-bold uppercase">
                  Active
                </div>
              </div>

              {/* Simple Table representation of Circulars */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-2 border-r border-slate-200">Source</th>
                      <th className="p-2 border-r border-slate-200">Regulatory Reference</th>
                      <th className="p-2 border-r border-slate-200 font-bold">Severity</th>
                      <th className="p-2 border-r border-slate-200 text-right">Progress</th>
                      <th className="p-2 text-right">Readiness</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr onClick={() => handleSourceClick("RBI")} className="border-b border-slate-200 cursor-pointer hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 font-bold text-[#1E40AF]">RBI</td>
                      <td className="p-2 border-r border-slate-200 font-medium">Digital Lending Mandate V2.0</td>
                      <td className="p-2 border-r border-slate-200"><span className="bg-red-50 text-red-700 border border-red-200 px-1 py-0.5 text-[9px] font-bold">CRITICAL</span></td>
                      <td className="p-2 border-r border-slate-200 text-right font-mono">5/6 MAPs</td>
                      <td className="p-2 text-right font-bold text-yellow-600">83.3%</td>
                    </tr>
                    <tr onClick={() => handleSourceClick("SEBI")} className="border-b border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                      <td className="p-2 border-r border-slate-200 font-bold text-[#1E40AF]">SEBI</td>
                      <td className="p-2 border-r border-slate-200 font-medium">Cybersecurity Master Circular (Beta)</td>
                      <td className="p-2 border-r border-slate-200"><span className="bg-orange-50 text-orange-700 border border-orange-200 px-1 py-0.5 text-[9px] font-bold">HIGH</span></td>
                      <td className="p-2 border-r border-slate-200 text-right font-mono">11/12 MAPs</td>
                      <td className="p-2 text-right font-bold text-yellow-600">91.6%</td>
                    </tr>
                    <tr onClick={() => handleSourceClick("NPCI")} className="border-b border-slate-200 cursor-pointer hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 font-bold text-[#1E40AF]">NPCI</td>
                      <td className="p-2 border-r border-slate-200 font-medium">UPI Transaction Limits Update (Beta)</td>
                      <td className="p-2 border-r border-slate-200"><span className="bg-amber-50 text-amber-700 border border-amber-200 px-1 py-0.5 text-[9px] font-bold">MEDIUM</span></td>
                      <td className="p-2 border-r border-slate-200 text-right font-mono">4/4 MAPs</td>
                      <td className="p-2 text-right font-bold text-green-700">100.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* System Stats Block */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="border border-slate-200 p-2.5 bg-slate-50">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">System Health</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">SECURE</span>
                </div>
                <div className="border border-slate-200 p-2.5 bg-slate-50">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Active MAPs</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">22 Active</span>
                </div>
                <div className="border border-slate-200 p-2.5 bg-slate-50">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Audit Readiness</span>
                  <span className="text-sm font-bold text-[#1E40AF] font-mono">91.6%</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Why Compliance Needs Reinvention */}
      <section className="py-16 lg:py-24 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-[#1E40AF] uppercase tracking-wider">
              Industry Challenges
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
              Why Compliance Needs Reinvention
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Traditional compliance operations struggle to keep pace with the volume and velocity of regulatory updates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="border border-slate-200 bg-white p-6 space-y-4">
              <div className="w-8 h-8 border border-slate-200 bg-[#F1F5F9] flex items-center justify-center font-bold text-slate-700">1</div>
              <h3 className="text-sm font-bold uppercase text-slate-900">Manual Regulation Review</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Compliance teams spend hours manually parsing multi-page PDFs from RBI, SEBI, and NPCI, creating bottlenecks.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[10px] font-mono font-bold text-[#1E40AF]">
                BANKING IMPACT: HIGH RESOURCE COST
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-6 space-y-4">
              <div className="w-8 h-8 border border-slate-200 bg-[#F1F5F9] flex items-center justify-center font-bold text-slate-700">2</div>
              <h3 className="text-sm font-bold uppercase text-slate-900">Fragmented Ownership</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Obligations are distributed via ad-hoc emails and spreadsheets, leading to lost tracking and ownership confusion.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[10px] font-mono font-bold text-[#1E40AF]">
                BANKING IMPACT: ACCIDENT EXPOSURE
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-6 space-y-4">
              <div className="w-8 h-8 border border-slate-200 bg-[#F1F5F9] flex items-center justify-center font-bold text-slate-700">3</div>
              <h3 className="text-sm font-bold uppercase text-slate-900">Delayed Implementation</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Drafting policy revisions, SOP amendments, and internal circulars manually causes delays, leaving banks exposed.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[10px] font-mono font-bold text-[#1E40AF]">
                BANKING IMPACT: LATE COMPLIANCE PENALTY
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-6 space-y-4">
              <div className="w-8 h-8 border border-slate-200 bg-[#F1F5F9] flex items-center justify-center font-bold text-slate-700">4</div>
              <h3 className="text-sm font-bold uppercase text-slate-900">Weak Audit Traceability</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Evidence logs and configuration metrics are scattered across silos, forcing manual preparation when auditors arrive.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[10px] font-mono font-bold text-[#1E40AF]">
                BANKING IMPACT: AUDIT FAILURE RISK
              </div>
            </div>
          </div>

          <div className="mt-12 bg-white border border-[#1E40AF] p-6 text-center">
            <p className="text-sm font-bold text-slate-900 italic">
              "Understanding regulations is only the first step. Compliance is complete only when implementation is verified and audit-ready."
            </p>
          </div>
        </div>
      </section>

      {/* Why ReguFlow AI is Different */}
      <section className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-[#1E40AF] uppercase tracking-wider">
              Strategic Advantages
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
              Why ReguFlow AI is Different
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              We replace passive documents with a structured workflow that guarantees compliance ownership and proof.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Diff Card 1 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase text-slate-900">Regulation → Action → Proof</h3>
                <p className="text-slate-500 font-mono text-[10px] uppercase font-bold">How it works</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Streamlines the compliance lifecycle in a unified record, mapping circulars directly to operational tasks and immutable evidence log files.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/50">
                <p className="text-slate-500 font-mono text-[9px] uppercase font-bold">Banking Value</p>
                <p className="text-xs font-bold text-[#1E40AF]">Builds a structured compliance audit trail.</p>
              </div>
            </div>

            {/* Diff Card 2 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase text-slate-900">Clause-Level Change Detection</h3>
                <p className="text-slate-500 font-mono text-[10px] uppercase font-bold">How it works</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Compares incoming circular versions side-by-side, isolating modified or added obligations.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/50">
                <p className="text-slate-500 font-mono text-[9px] uppercase font-bold">Banking Value</p>
                <p className="text-xs font-bold text-[#1E40AF]">Compliance teams review only what changed instead of re-reading entire documents.</p>
              </div>
            </div>

            {/* Diff Card 3 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase text-slate-900">Measurable Action Points</h3>
                <p className="text-slate-500 font-mono text-[10px] uppercase font-bold">How it works</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Extracts compliance mandates into actionable tasks (MAPs) with deadlines and expected evidence outcomes.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/50">
                <p className="text-slate-500 font-mono text-[9px] uppercase font-bold">Banking Value</p>
                <p className="text-xs font-bold text-[#1E40AF]">Replaces subjective checklists with verifiable actions.</p>
              </div>
            </div>

            {/* Diff Card 4 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase text-slate-900">AI Compliance Document Drafting</h3>
                <p className="text-slate-500 font-mono text-[10px] uppercase font-bold">How it works</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Drafts draft policy changes, updated SOPs, and internal circulars based on the new mandate text.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/50">
                <p className="text-slate-500 font-mono text-[9px] uppercase font-bold">Banking Value</p>
                <p className="text-xs font-bold text-[#1E40AF]">Reduces policy writing cycles from weeks to hours.</p>
              </div>
            </div>

            {/* Diff Card 5 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase text-slate-900">Evidence Validation</h3>
                <p className="text-slate-500 font-mono text-[10px] uppercase font-bold">How it works</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Compares uploaded evidence logs, configuration parameters, and screenshots against clause rules to verify completion.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/50">
                <p className="text-slate-500 font-mono text-[9px] uppercase font-bold">Banking Value</p>
                <p className="text-xs font-bold text-[#1E40AF]">Flags non-compliant deliverables before audit checkoffs.</p>
              </div>
            </div>

            {/* Diff Card 6 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase text-slate-900">Explainable AI</h3>
                <p className="text-slate-500 font-mono text-[10px] uppercase font-bold">How it works</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Provides contextual analysis of complex clauses into operational definitions with exact source index references.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/50">
                <p className="text-slate-500 font-mono text-[9px] uppercase font-bold">Banking Value</p>
                <p className="text-xs font-bold text-[#1E40AF]">Speeds up legal interpretation and technical alignment.</p>
              </div>
            </div>

            {/* Diff Card 7 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase text-slate-900">Risk Intelligence</h3>
                <p className="text-slate-500 font-mono text-[10px] uppercase font-bold">How it works</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Calculates impact severities and system vulnerabilities by crossing regulatory updates with organizational profiles.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/50">
                <p className="text-slate-500 font-mono text-[9px] uppercase font-bold">Banking Value</p>
                <p className="text-xs font-bold text-[#1E40AF]">Directs compliance resources to highest risk exposures first.</p>
              </div>
            </div>

            {/* Diff Card 8 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase text-slate-900">Department Workflow Automation</h3>
                <p className="text-slate-500 font-mono text-[10px] uppercase font-bold">How it works</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Instantly assigns and logs tasks directly inside the targeted department compliance dashboard queues.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/50">
                <p className="text-slate-500 font-mono text-[9px] uppercase font-bold">Banking Value</p>
                <p className="text-xs font-bold text-[#1E40AF]">Cuts routing delays and tracks cross-department action items.</p>
              </div>
            </div>

            {/* Diff Card 9 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase text-slate-900">Version Traceability</h3>
                <p className="text-slate-500 font-mono text-[10px] uppercase font-bold">How it works</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Links completed actions back to the specific version of the document clause that triggered it.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/50">
                <p className="text-slate-500 font-mono text-[9px] uppercase font-bold">Banking Value</p>
                <p className="text-xs font-bold text-[#1E40AF]">Secures the bank against backtracking during inspections.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-[#1E40AF] uppercase tracking-wider">
              Platform Features
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
              Comprehensive Regulatory Control Suit
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Verifiable tools mapping onto bank workflows to operationalize risk management and provide absolute audit proof.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><Eye className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Regulatory Monitoring</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Real-time ingestion of circular circular documents directly from RBI, SEBI, NPCI, and CERT-In. Compliance teams receive instant notifications of updates, ensuring no regulatory changes are missed.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: ZERO MISSED NOTIFICATIONS
              </div>
            </div>

            {/* Feature 2 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><UploadCloud className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">PDF Ingestion & Analysis</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Processes uploaded regulatory PDFs and segments text blocks into distinct obligations. This converts flat documents into searchable databases of individual regulatory rules.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: SYSTEM-PARSED CLAUSES
              </div>
            </div>

            {/* Feature 3 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><GitCompare className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Clause-Level Change Detection</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Run comparisons on regulatory updates against existing drafts to isolate exact clause additions, deletions, and alterations. Reviews are focused on actual changes rather than manual re-reads.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: AUTOMATED SIDE-BY-SIDE DIFF
              </div>
            </div>

            {/* Feature 4 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><AlertTriangle className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Impact Analysis Mapping</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Maps regulatory mandates onto bank divisions (IT, Compliance, Security, Audit) with calculated risk scoring and implementation priorities, ensuring critical tasks are scheduled first.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: RISK-PRIORITIZED TASK MAP
              </div>
            </div>

            {/* Feature 5 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><ListTodo className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">MAP Generation & Tracking</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Converts impact assessments into executable Measurable Action Points (MAPs). Assigns task ownership, sets deadlines, and tracks the lifecycle of every compliance requirement.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: VERIFIABLE TASK PROGRESS
              </div>
            </div>

            {/* Feature 6 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><Brain className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Explainable AI Explanations</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Translates legal guidelines and complex circular language into clear business statements with index reference points, helping teams align on implementation goals.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: TRANSPARENT REGULATORY MAPPING
              </div>
            </div>

            {/* Feature 7 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><FileText className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">AI SOP & Policy Drafting</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Generates drafted SOPs, internal circulars, and policy amendments aligned to regulatory updates. Reduces manual drafting times while maintaining quality.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: READY-TO-REVIEW DOCUMENTS
              </div>
            </div>

            {/* Feature 8 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><CheckSquare className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Evidence Validation Engine</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Compares uploaded evidence logs and audit assets against clause requirements, checking implementation status and validating results before marking tasks complete.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: APPROVED COMPLIANCE PROOF
              </div>
            </div>

            {/* Feature 9 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><ClipboardCheck className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Audit Readiness Scoring</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Tracks real-time readiness scoring mapped to completion formulas, ensuring regulatory tasks are traced from original document to final evidence submission.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: AUDIT-READY TRACEABILITY LOG
              </div>
            </div>

            {/* Feature 10 (AI SOP Generator) */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><Settings className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">AI SOP Generator</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Processes parsed circular guidelines and drafts complete Standard Operating Procedures (SOPs) for the operational teams to ensure aligned day-to-day execution.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: STANDARD PROCEDURAL ALIGNMENT
              </div>
            </div>

            {/* Feature 11 (Policy Amendment Generator) */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><FileText className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Policy Amendment Generator</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Drafts specific policy amendment clauses that can be dropped directly into existing policy frameworks to reflect the latest regulatory updates.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: COMPLIANT AMENDMENT CLAUSES
              </div>
            </div>

            {/* Feature 12 (Internal Circular Generator) */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><Share2 className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Internal Circular Generator</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Generates ready-to-distribute internal memos explaining the compliance changes, deadlines, and responsibilities for banking divisions.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: ALIGNED INTERNAL COMMUNICATIONS
              </div>
            </div>

            {/* Feature 13 (Audit Checklist Generator) */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><ClipboardCheck className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Audit Checklist Generator</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Assembles direct checklists matching every newly introduced regulatory obligation, enabling audit teams to verify internal compliance status.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: TARGETED COMPLIANCE AUDIT SHEETS
              </div>
            </div>

            {/* Feature 14 (Regulatory Response Draft Generator) */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><FileText className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Regulatory Response Drafting</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Drafts professional response packages detailing how the bank has operationalized and complied with circular mandates for regulators.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: PREPARED SUBMISSION PACKAGES
              </div>
            </div>

            {/* Feature 15 (Executive Compliance Dashboard) */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><Building className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Executive Dashboard</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Provides risk dashboards for compliance officers to track overall readiness, pending MAPs, and department progress.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: TOTAL EXECUTIVE VISIBILITY
              </div>
            </div>

            {/* Feature 16 (Compliance Timeline Tracking) */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><Clock className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Timeline Tracking</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Maps and monitors milestones from circular publication to task completions and final sign-off, preventing overdue actions.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: ELIMINATED DELINQUENT TASKS
              </div>
            </div>

            {/* Feature 17 (Version History) */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><RefreshCw className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Version History</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Tracks and maintains previous document states, mapping historical changes to illustrate progression over time.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: CLEAR AUDIT TRAILS
              </div>
            </div>

            {/* Feature 18 (Workflow Orchestration) */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 hover:border-[#1E40AF] transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 border border-slate-200 bg-white flex items-center justify-center text-[#1E40AF]"><Layers className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Workflow Orchestration</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Manages the task flow sequentially, routing requirements through review stages before final compliance approval.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] font-mono font-bold text-[#1E40AF]">
                OUTCOME: RIGOROUS WORKFLOW EXECUTION
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Pipeline Section) */}
      <section id="workflow" className="py-16 lg:py-24 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-[#1E40AF] uppercase tracking-wider">
              The Regulation-to-Action Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
              Audit-Proven Compliance Process
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              We replace ad-hoc policies with a structured, step-by-step pipeline that guarantees full task accountability.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-white border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#1E40AF] uppercase block mb-3">Phase 01 / Ingestion</span>
                <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 mb-2">Ingest & Segment</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Upload official regulatory circular PDFs. ReguFlow AI automatically processes the text and segments it into individual clauses.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#1E40AF] uppercase block mb-3">Phase 02 / Analysis</span>
                <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 mb-2">Version Comparison</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Compare incoming updates side-by-side with older drafts. Track added, removed, or modified clauses with precision.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#1E40AF] uppercase block mb-3">Phase 03 / Evaluation</span>
                <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 mb-2">Impact Mapping</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Assess regulatory impact across standard banking divisions (IT, Compliance, Security, Audit) and determine priority.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#1E40AF] uppercase block mb-3">Phase 04 / Proof</span>
                <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 mb-2">MAP Assignment</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Convert impact findings into assigned Measurable Action Points (MAPs). Securely lock evidence to prove compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agentic AI Architecture Section */}
      <section id="agents" className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-[#1E40AF] uppercase tracking-wider">
              System Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
              Agentic AI Architecture
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              A collaborative network of specialized AI agents working together to automate regulatory operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Agent 1 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-3">
              <span className="text-[10px] font-mono font-bold bg-[#E0E7FF] text-[#1E40AF] px-2 py-0.5 uppercase">Ingestion</span>
              <h3 className="text-sm font-bold uppercase text-slate-900">Regulation Ingestion Agent</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Extracts text from uploaded regulatory circulars and converts unstructured files into structured clauses, processing layout formats.
              </p>
            </div>

            {/* Agent 2 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-3">
              <span className="text-[10px] font-mono font-bold bg-[#E0E7FF] text-[#1E40AF] px-2 py-0.5 uppercase">Parsing</span>
              <h3 className="text-sm font-bold uppercase text-slate-900">Clause Intelligence Agent</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Identifies compliance obligations, entities, and deadlines within the parsed clauses, classifying rules.
              </p>
            </div>

            {/* Agent 3 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-3">
              <span className="text-[10px] font-mono font-bold bg-[#E0E7FF] text-[#1E40AF] px-2 py-0.5 uppercase">Analysis</span>
              <h3 className="text-sm font-bold uppercase text-slate-900">Change Detection Agent</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Compares versions at the clause level to isolate modifications, additions, or deletions from older guidelines.
              </p>
            </div>

            {/* Agent 4 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-3">
              <span className="text-[10px] font-mono font-bold bg-[#E0E7FF] text-[#1E40AF] px-2 py-0.5 uppercase">Mapping</span>
              <h3 className="text-sm font-bold uppercase text-slate-900">Business Impact Agent</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Maps obligations onto departments, systems, products, and policies, evaluating risk weights.
              </p>
            </div>

            {/* Agent 5 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-3">
              <span className="text-[10px] font-mono font-bold bg-[#E0E7FF] text-[#1E40AF] px-2 py-0.5 uppercase">Tasking</span>
              <h3 className="text-sm font-bold uppercase text-slate-900">MAP Generation Agent</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Creates structured Measurable Action Points (MAPs) from impact analysis, assigning details, deadlines, and verification rules.
              </p>
            </div>

            {/* Agent 6 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-3">
              <span className="text-[10px] font-mono font-bold bg-[#E0E7FF] text-[#1E40AF] px-2 py-0.5 uppercase">Routing</span>
              <h3 className="text-sm font-bold uppercase text-slate-900">Workflow Routing Agent</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Distributes MAPs automatically into appropriate queues for IT, Compliance, Legal, Cyber, Risk, and Audit teams.
              </p>
            </div>

            {/* Agent 7 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-3">
              <span className="text-[10px] font-mono font-bold bg-[#E0E7FF] text-[#1E40AF] px-2 py-0.5 uppercase">Verification</span>
              <h3 className="text-sm font-bold uppercase text-slate-900">Evidence Validation Agent</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Analyzes evidence logs, reports, and assets against expectations, certifying that obligations have been met before closing tasks.
              </p>
            </div>

            {/* Agent 8 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-3">
              <span className="text-[10px] font-mono font-bold bg-[#E0E7FF] text-[#1E40AF] px-2 py-0.5 uppercase">Reporting</span>
              <h3 className="text-sm font-bold uppercase text-slate-900">Audit Intelligence Agent</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Consolidates status into reports with step-by-step traceability back to source regulations.
              </p>
            </div>

            {/* Agent 9 */}
            <div className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-3">
              <span className="text-[10px] font-mono font-bold bg-[#E0E7FF] text-[#1E40AF] px-2 py-0.5 uppercase">Insights</span>
              <h3 className="text-sm font-bold uppercase text-slate-900">Executive Insights Agent</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Feeds progress stats, readiness levels, and bottlenecks into executive compliance dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* End-to-End Compliance Lifecycle Timeline */}
      <section className="py-16 lg:py-24 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-[#1E40AF] uppercase tracking-wider">
              Operational Framework
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
              End-to-End Compliance Lifecycle
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              How ReguFlow AI drives a circular update through execution to final validation.
            </p>
          </div>

          <div className="relative border-l-2 border-[#1E40AF]/30 ml-4 space-y-8">
            {[
              { title: "Regulatory Circular", desc: "RBI circular published online and detected in real-time." },
              { title: "AI Ingestion", desc: "File text is ingested and processed into structured datasets." },
              { title: "Clause Extraction", desc: "Specific compliance obligations are parsed out from the text." },
              { title: "Change Detection", desc: "AI diffs the new obligations against existing policy archives." },
              { title: "Business Impact Analysis", desc: "Calculates impact and risk scoring across standard banking divisions." },
              { title: "MAP Generation", desc: "Obligations are turned into action points with deliverables." },
              { title: "Department Assignment", desc: "Tasks are routed to compliance, IT, risk, or legal queues." },
              { title: "Implementation", desc: "Teams execute actions and update controls." },
              { title: "Evidence Upload", desc: "Teams submit configuration logs, screenshot assets, or updated policy documents." },
              { title: "Evidence Validation", desc: "AI checks evidence against expected rules before sign-off." },
              { title: "Audit Report", desc: "A report with full traceability log files is generated." },
              { title: "Compliance Closed", desc: "The regulation is logged as complete and archived." }
            ].map((step, idx) => (
              <div key={idx} className="relative pl-6">
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-none bg-[#1E40AF] border border-white flex items-center justify-center text-[8px] text-white font-mono font-bold">
                  {idx + 1}
                </span>
                <h4 className="text-sm font-bold uppercase text-slate-900">{step.title}</h4>
                <p className="text-slate-600 text-xs font-medium mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Premium Dashboard Showcase */}
      <section className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="max-w-3xl space-y-4 mb-12">
            <span className="text-xs font-mono font-bold text-[#1E40AF] uppercase tracking-wider">
              Control Panel
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
              ReguFlow AI Executive Dashboard
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Real-time monitoring of compliance score, pending action items, and audit logs.
            </p>
          </div>

          <div className="border border-slate-200 bg-[#0F172A] p-6 text-white space-y-6">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">ReguFlow AI | Operations Console</span>
                <h3 className="text-base font-bold uppercase tracking-tight">System Overview Dashboard</h3>
              </div>
              <div className="flex gap-2">
                <span className="bg-[#1E40AF] text-white font-mono text-[10px] px-2.5 py-1 uppercase font-bold">CONNECTED TO DB</span>
                <span className="bg-green-900/35 border border-green-700 text-green-400 font-mono text-[10px] px-2.5 py-1 uppercase font-bold">AUDIT READY</span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-slate-800 p-4 bg-slate-900/50 space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block uppercase">Compliance Score</span>
                <span className="text-2xl font-bold text-[#60A5FA] font-mono">94.2%</span>
                <p className="text-[10px] text-green-400 font-semibold">✓ Meets RBI Threshold</p>
              </div>

              <div className="border border-slate-800 p-4 bg-slate-900/50 space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block uppercase">Pending MAPs</span>
                <span className="text-2xl font-bold text-yellow-500 font-mono">18 Tasks</span>
                <p className="text-[10px] text-slate-400">12 Under Review | 6 Open</p>
              </div>

              <div className="border border-slate-800 p-4 bg-slate-900/50 space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block uppercase">Critical Regulations</span>
                <span className="text-2xl font-bold text-red-500 font-mono">3 Active</span>
                <p className="text-[10px] text-red-400 font-semibold">⚠ Attention Required</p>
              </div>

              <div className="border border-slate-800 p-4 bg-slate-900/50 space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block uppercase">Audit Traceability</span>
                <span className="text-2xl font-bold text-green-500 font-mono">100%</span>
                <p className="text-[10px] text-green-400 font-semibold">✓ Logs Verified</p>
              </div>
            </div>

            {/* Detail Layout */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Department Progress */}
              <div className="lg:col-span-6 border border-slate-800 p-4 bg-slate-900/30 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-tight text-slate-300 border-b border-slate-800 pb-2">Department Progress</h4>
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>IT Operations</span>
                      <span className="font-bold">88.5%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5"><div className="bg-[#1E40AF] h-full" style={{ width: "88.5%" }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Information Security</span>
                      <span className="font-bold">95.0%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5"><div className="bg-[#1E40AF] h-full" style={{ width: "95%" }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Risk Governance</span>
                      <span className="font-bold">92.1%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5"><div className="bg-[#1E40AF] h-full" style={{ width: "92.1%" }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Legal Compliance</span>
                      <span className="font-bold">100%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5"><div className="bg-green-600 h-full" style={{ width: "100%" }}></div></div>
                  </div>
                </div>
              </div>

              {/* Risk Distribution & Calendar */}
              <div className="lg:col-span-6 border border-slate-800 p-4 bg-slate-900/30 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-tight text-slate-300 border-b border-slate-800 pb-2">Upcoming Deadlines</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                      <p className="font-bold">RBI Digital Ingestion Audit</p>
                      <p className="text-[10px] text-slate-400">Task: Evidence lock upload</p>
                    </div>
                    <span className="text-red-400 font-mono font-bold">JULY 15</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                      <p className="font-bold">SEBI Cyber Circular Policy Sync</p>
                      <p className="text-[10px] text-slate-400">Task: SOP amendment drafting</p>
                    </div>
                    <span className="text-yellow-400 font-mono font-bold">AUG 01</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <div>
                      <p className="font-bold">NPCI Transaction Cap Verification</p>
                      <p className="text-[10px] text-slate-400">Task: System logging validation</p>
                    </div>
                    <span className="text-slate-400 font-mono font-bold">SEP 10</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Enterprise Security Section */}
      <section id="security" className="py-16 lg:py-24 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-[#1E40AF] uppercase tracking-wider">
              Bank-Grade Security
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
              Enterprise Security & Control
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Engineered for strict security standards in regulated banking environments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sec 1 */}
            <div className="bg-white border border-slate-200 p-6 space-y-3">
              <div className="w-10 h-10 border border-slate-200 bg-[#F1F5F9] flex items-center justify-center text-[#1E40AF]"><Lock className="w-5 h-5" /></div>
              <h3 className="text-sm font-bold uppercase text-slate-900">Role-Based Access Control</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Restricts view and write permissions across departments. IT personnel review only technical items, and legal parameters remain read-only.
              </p>
            </div>

            {/* Sec 2 */}
            <div className="bg-white border border-slate-200 p-6 space-y-3">
              <div className="w-10 h-10 border border-slate-200 bg-[#F1F5F9] flex items-center justify-center text-[#1E40AF]"><Terminal className="w-5 h-5" /></div>
              <h3 className="text-sm font-bold uppercase text-slate-900">Immutable Audit Logs</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Saves a timestamped registry of all user actions, document uploads, validations, and status adjustments. Logs cannot be altered.
              </p>
            </div>

            {/* Sec 3 */}
            <div className="bg-white border border-slate-200 p-6 space-y-3">
              <div className="w-10 h-10 border border-slate-200 bg-[#F1F5F9] flex items-center justify-center text-[#1E40AF]"><RefreshCw className="w-5 h-5" /></div>
              <h3 className="text-sm font-bold uppercase text-slate-900">Version History</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Preserves every draft iteration of compliance policies and amendments. Tracks modifications to identify who changed what version.
              </p>
            </div>

            {/* Sec 4 */}
            <div className="bg-white border border-slate-200 p-6 space-y-3">
              <div className="w-10 h-10 border border-slate-200 bg-[#F1F5F9] flex items-center justify-center text-[#1E40AF]"><FolderLock className="w-5 h-5" /></div>
              <h3 className="text-sm font-bold uppercase text-slate-900">Encrypted Document Storage</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Encrypts files at rest using AES-256 and in transit using TLS 1.3, safeguarding internal documentation from unauthorized leaks.
              </p>
            </div>

            {/* Sec 5 */}
            <div className="bg-white border border-slate-200 p-6 space-y-3">
              <div className="w-10 h-10 border border-slate-200 bg-[#F1F5F9] flex items-center justify-center text-[#1E40AF]"><Layers className="w-5 h-5" /></div>
              <h3 className="text-sm font-bold uppercase text-slate-900">Private Cloud & On-Prem</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Supports isolated private cloud deployments or complete on-premise installation to ensure data never leaves the organization's network.
              </p>
            </div>

            {/* Sec 6 */}
            <div className="bg-white border border-slate-200 p-6 space-y-3">
              <div className="w-10 h-10 border border-slate-200 bg-[#F1F5F9] flex items-center justify-center text-[#1E40AF]"><Users className="w-5 h-5" /></div>
              <h3 className="text-sm font-bold uppercase text-slate-900">SSO Ready & Integrations</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Connects directly to corporate identity providers using SAML 2.0 or OIDC. Supports REST API endpoints to link with central IT queues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-[#1E40AF] uppercase tracking-wider">
              System Connections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
              Enterprise Workflow Integrations
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              We focus on connecting with existing systems rather than logo counts.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { category: "Communications", title: "Slack & Microsoft Teams", desc: "Routes critical alerts and task updates directly to private channels, keeping teams aligned without relying on inbox notifications." },
              { category: "Operations Workflows", title: "Jira & ServiceNow", desc: "Spawns operational tickets matching compliance MAP tasks in engineering or IT help desks automatically." },
              { category: "File Management", title: "SharePoint & Document Systems", desc: "Syncs policy amendments and PDF guides directly to authorized enterprise archives." },
              { category: "Core Databases", title: "REST APIs & Core Platforms", desc: "Exposes endpoints to retrieve real-time scoring data and status parameters for internal BI platforms." },
              { category: "Corporate Mail", title: "Enterprise Email Systems", desc: "Sends custom compliance reports, upcoming task schedules, and milestone alerts straight to stakeholders." },
              { category: "Security Layers", title: "Identity Providers (SAML/OIDC)", desc: "Enforces single sign-on access rules, managing authentication flows with active directory definitions." }
            ].map((int, idx) => (
              <div key={idx} className="border border-slate-200 bg-[#F8FAFC] p-6 space-y-3">
                <span className="text-[9px] font-mono font-bold text-[#1E40AF] uppercase tracking-wider block">{int.category}</span>
                <h3 className="text-sm font-bold uppercase text-slate-900">{int.title}</h3>
                <p className="text-[#64748B] text-xs font-medium leading-relaxed">{int.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Every Banking Team */}
      <section className="py-16 lg:py-24 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-[#1E40AF] uppercase tracking-wider">
              User Personas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
              Built for Every Banking Team
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Optimized workspaces for cross-functional compliance management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Team 1 */}
            <div className="border border-slate-200 bg-white p-6 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Compliance Team</h3>
                <p className="text-slate-500 font-mono text-[9px] uppercase font-bold">Daily Workflow</p>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Identifies circular alerts, reviews AI-mapped impact scores, and audits tasks from creation to final checkoffs.
                </p>
              </div>
            </div>

            {/* Team 2 */}
            <div className="border border-slate-200 bg-white p-6 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Legal Team</h3>
                <p className="text-slate-500 font-mono text-[9px] uppercase font-bold">Daily Workflow</p>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Reviews and edits policy draft suggestions and circular texts directly on-screen, ensuring formatting compliance.
                </p>
              </div>
            </div>

            {/* Team 3 */}
            <div className="border border-slate-200 bg-white p-6 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Risk & Cybersecurity</h3>
                <p className="text-slate-500 font-mono text-[9px] uppercase font-bold">Daily Workflow</p>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Monitors severities and schedules system checks, confirming that technical operations adhere to strict security mandates.
                </p>
              </div>
            </div>

            {/* Team 4 */}
            <div className="border border-slate-200 bg-white p-6 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-900">Internal Audit</h3>
                <p className="text-slate-500 font-mono text-[9px] uppercase font-bold">Daily Workflow</p>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Accesses central logs mapping completed tasks back to the original clause, reducing manual evidence gathering.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Outcomes Section */}
      <section className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-[#1E40AF] uppercase tracking-wider">
              Operational Value
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
              Verifiable Business Outcomes
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              We define value by operational improvements, not by vague metrics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2 border-l-2 border-slate-300 pl-4 py-1">
              <h3 className="text-sm font-bold uppercase text-slate-900">Efficiency</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Reduces manual regulatory review effort by automatically isolating altered parameters between circular drafts.
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-slate-300 pl-4 py-1">
              <h3 className="text-sm font-bold uppercase text-slate-900">Accountability</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Coordinates responsibility through automated routing and dashboard ownership markers.
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-slate-300 pl-4 py-1">
              <h3 className="text-sm font-bold uppercase text-slate-900">Response Speed</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Accelerates policy revisions and SOP upgrades using AI drafting aligned to the rules.
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-slate-300 pl-4 py-1">
              <h3 className="text-sm font-bold uppercase text-slate-900">Traceability</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Secures evidence history by mapping completed actions back to the original clause references.
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-slate-300 pl-4 py-1">
              <h3 className="text-sm font-bold uppercase text-slate-900">Audit Readiness</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Maintains readiness scores through centralized evidence repositories, tracking task verification.
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-slate-300 pl-4 py-1">
              <h3 className="text-sm font-bold uppercase text-slate-900">Leadership Oversight</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Provides executives with clear organizational progress views, identifying implementation status.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-widest">
              * Note: Metrics and dashboards shown are illustrative of standard enterprise configurations.
            </span>
          </div>
        </div>
      </section>

      {/* Improved Comparison Section */}
      <section id="comparison" className="py-16 lg:py-24 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-[#1E40AF] uppercase tracking-wider">
              Strategic Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
              Traditional Operations vs ReguFlow AI
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Understand how ReguFlow AI drives compliance operations with measurable accountability.
            </p>
          </div>

          <div className="border border-slate-200 overflow-x-auto bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1E40AF] text-white uppercase tracking-wider">
                  <th className="p-4 font-bold border-r border-slate-300/35">Operational Capability</th>
                  <th className="p-4 font-semibold border-r border-slate-300/35">Traditional Compliance</th>
                  <th className="p-4 font-bold">ReguFlow AI Operations</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Ingestion & Tracking</td>
                  <td className="p-4 border-r border-slate-200 text-slate-600 font-medium">Manual checks on RBI/SEBI sites; prone to missed notices.</td>
                  <td className="p-4 text-[#1E40AF] font-bold">Centralized ingestion stream with real-time source feeds.</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Version Comparison</td>
                  <td className="p-4 border-r border-slate-200 text-slate-600 font-medium">Line-by-line manual read of PDFs; slow and error-prone.</td>
                  <td className="p-4 text-[#1E40AF] font-bold">Automated clause-level diffing highlighting exact changes.</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Impact Assessment</td>
                  <td className="p-4 border-r border-slate-200 text-slate-600 font-medium">Ad-hoc internal emails and highly subjective checklists.</td>
                  <td className="p-4 text-[#1E40AF] font-bold">Traceable department impact mapping with clear risk scores.</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Task Lifecycle</td>
                  <td className="p-4 border-r border-slate-200 text-slate-600 font-medium">Static shared spreadsheets; no progress verification.</td>
                  <td className="p-4 text-[#1E40AF] font-bold">Sequential MAP tracking (Pending to Completed) with owners.</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">AI Document Drafting</td>
                  <td className="p-4 border-r border-slate-200 text-slate-600 font-medium">Manual writing of SOPs and amendments from scratch.</td>
                  <td className="p-4 text-[#1E40AF] font-bold">Initial drafting of policies, circulars, and checklists.</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Workflow Automation</td>
                  <td className="p-4 border-r border-slate-200 text-slate-600 font-medium">Manual assignment tasks via email threads.</td>
                  <td className="p-4 text-[#1E40AF] font-bold">Direct routing to IT, Security, and Risk dashboards.</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Explainable AI</td>
                  <td className="p-4 border-r border-slate-200 text-slate-600 font-medium">Extensive research to define requirements.</td>
                  <td className="p-4 text-[#1E40AF] font-bold">Operational definition mapping with exact citations.</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Evidence Validation</td>
                  <td className="p-4 border-r border-slate-200 text-slate-600 font-medium">Post-implementation checks during review weeks.</td>
                  <td className="p-4 text-[#1E40AF] font-bold">Verifies screenshots and logs against expectations.</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Version Traceability</td>
                  <td className="p-4 border-r border-slate-200 text-slate-600 font-medium">No direct link between actions and original clause text.</td>
                  <td className="p-4 text-[#1E40AF] font-bold">Verifies completion logs map directly back to target clauses.</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Audit Reports</td>
                  <td className="p-4 border-r border-slate-200 text-slate-600 font-medium">Scattered files gathered manually during audit weeks.</td>
                  <td className="p-4 text-[#1E40AF] font-bold">Real-time readiness scoring with locked, immutable evidence.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Improved Documentation Section */}
      <section id="documentation" className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-mono font-bold text-[#1E40AF] uppercase tracking-wider">
                Setup Guides & Resources
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
                Product Documentation & Installation Guide
              </h2>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Access the official setup manual to install and configure the ReguFlow AI client on your organization's infrastructure. The documentation covers system requirements, database connection setups, user permissions, and deployment procedures.
              </p>
              
              <div className="border border-slate-200 bg-white p-6 rounded-none flex items-start gap-4 shadow-sm">
                <div className="w-12 h-12 border border-slate-200 bg-[#F1F5F9] flex items-center justify-center text-[#1E40AF] shrink-0">
                  <FileText className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-tight text-slate-900">Installation Guide (PDF)</h4>
                  <p className="text-slate-500 text-xs font-medium">Includes step-by-step instructions for Windows (.exe) client deployment.</p>
                  <div className="pt-2 flex flex-wrap gap-4">
                    <a 
                      href={DOWNLOAD_LINKS.documentationPdf}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E40AF] hover:text-[#1D4ED8] transition-colors uppercase tracking-wider"
                    >
                      <span>View Setup PDF</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button 
                      onClick={() => handleDownload("pdf")}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider"
                    >
                      <span>Download Guide</span>
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Specs List */}
            <div className="lg:col-span-5 bg-white border border-slate-200 p-8 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 border-b border-slate-100 pb-3">Deployment Specifications</h3>
              
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Deployment Guide</span>
                  <span className="text-[#1E40AF]">Configured Setup</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">API Documentation</span>
                  <span className="text-[#1E40AF]">REST Endpoint Specs</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Administrator Guide</span>
                  <span className="text-[#1E40AF]">Role & Policy Control</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Workflow Guide</span>
                  <span className="text-[#1E40AF]">MAP Execution Flow</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Integration Guide</span>
                  <span className="text-[#1E40AF]">SSO & Queue Links</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">System Requirements</span>
                  <span className="text-slate-700">Windows 10/11 x64</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">User Manual</span>
                  <span className="text-slate-700">Operational Guide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-[#F8FAFC] border-b border-slate-200 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
            Ready to Operationalize Your Compliance Strategy?
          </h2>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto font-medium">
            Schedule a platform review with our compliance consultants, or download the client to get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => setShowDemoModal(true)}
              className="w-full sm:w-auto bg-[#1E40AF] hover:bg-[#1D4ED8] text-white font-bold text-sm px-8 py-3.5 rounded-none transition-colors uppercase tracking-wider"
            >
              Request Custom Demo
            </button>
            <div className="flex flex-col items-center">
              <button 
                onClick={handleAutoDownload}
                className="w-full sm:w-auto border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-sm px-8 py-3.5 rounded-none transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#1E40AF]" />
                <span>Download App</span>
              </button>
              <div className="flex justify-center gap-4 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <button onClick={() => handleDownload("windows")} className="hover:text-[#1E40AF] transition-colors">Windows (.exe)</button>
                <span>•</span>
                <button onClick={handleAndroidClick} className="hover:text-[#1E40AF] transition-colors">Android (.apk)</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="w-full bg-[#0F172A] text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><button onClick={() => scrollToSection("features")} className="hover:text-white transition-colors">Platform Features</button></li>
              <li><button onClick={() => scrollToSection("workflow")} className="hover:text-white transition-colors">How It Works</button></li>
              <li><button onClick={() => scrollToSection("agents")} className="hover:text-white transition-colors">Architecture</button></li>
              <li><button onClick={() => scrollToSection("security")} className="hover:text-white transition-colors">Security</button></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Documentation</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><button onClick={() => scrollToSection("documentation")} className="hover:text-white transition-colors font-semibold">Deployment Guide</button></li>
              <li><button onClick={() => scrollToSection("documentation")} className="hover:text-white transition-colors">API References</button></li>
              <li><button onClick={() => scrollToSection("documentation")} className="hover:text-white transition-colors">System Settings</button></li>
              <li><span className="text-slate-500">Release Notes v1.2.0</span></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Enterprise Compliance</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><span className="hover:text-white transition-colors">SOC 2 Certification</span></li>
              <li><span className="hover:text-white transition-colors">ISO 27001 Standard</span></li>
              <li><span className="hover:text-white transition-colors">SAML/OIDC SSO</span></li>
              <li><span className="hover:text-white transition-colors">Encrypted Vault Storage</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">ReguFlow AI Contact</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setShowDemoModal(true)} className="hover:text-white transition-colors">Request Callback</button></li>
              <li><span className="hover:text-white transition-colors">Enterprise SLA</span></li>
              <li><span className="hover:text-white transition-colors">LinkedIn</span></li>
              <li><span className="hover:text-white transition-colors">GitHub</span></li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs gap-4 font-medium">
          <span>&copy; {new Date().getFullYear()} ReguFlow AI operations. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Security Disclosures</a>
          </div>
        </div>
      </footer>

      {/* Request Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) { setShowDemoModal(false); setFormErrors({}); } }}>
          <div className="bg-white border border-slate-300 w-full max-w-lg p-8 rounded-none shadow-xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => { if (!isSubmitting) { setShowDemoModal(false); setFormErrors({}); } }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 focus:outline-none disabled:opacity-40"
              disabled={isSubmitting}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {demoSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 border-2 border-green-500 text-green-500 rounded-none flex items-center justify-center mx-auto bg-green-50">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="text-base font-bold uppercase text-slate-900">Request Received</h3>
                <p className="text-slate-600 text-xs font-medium">
                  A banking compliance specialist from our enterprise team will contact you at your work email within 1 business day.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-extrabold uppercase text-slate-900">Request Custom Demo</h3>
                  <p className="text-slate-500 text-xs font-medium mt-1">Specify your details to request an interactive platform demo.</p>
                </div>

                <form onSubmit={handleDemoSubmit} className="space-y-4" noValidate>

                  {/* ── Row: Full Name + Phone ── */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Full Name *</label>
                      <input
                        required
                        type="text"
                        maxLength={100}
                        value={demoForm.fullName}
                        onChange={setField("fullName")}
                        placeholder="Sarah Miller"
                        className={`w-full border px-3 py-2 text-xs text-slate-800 bg-slate-50 focus:border-[#1E40AF] focus:ring-0 focus:outline-none rounded-none font-medium ${
                          formErrors.fullName ? "border-red-500 focus:border-red-500" : "border-slate-300"
                        }`}
                      />
                      {formErrors.fullName && (
                        <span className="text-red-500 text-[10px] font-semibold mt-1 block">{formErrors.fullName}</span>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Phone Number *</label>
                      <input
                        required
                        type="tel"
                        maxLength={20}
                        value={demoForm.phone}
                        onChange={setField("phone")}
                        placeholder="+91 98765 43210"
                        className={`w-full border px-3 py-2 text-xs text-slate-800 bg-slate-50 focus:border-[#1E40AF] focus:ring-0 focus:outline-none rounded-none font-medium ${
                          formErrors.phone ? "border-red-500 focus:border-red-500" : "border-slate-300"
                        }`}
                      />
                      {formErrors.phone && (
                        <span className="text-red-500 text-[10px] font-semibold mt-1 block">{formErrors.phone}</span>
                      )}
                    </div>
                  </div>

                  {/* ── Work Email ── */}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Work Email *</label>
                    <input
                      required
                      type="email"
                      maxLength={150}
                      value={demoForm.email}
                      onChange={setField("email")}
                      placeholder="s.miller@citi.com"
                      className={`w-full border px-3 py-2 text-xs text-slate-800 bg-slate-50 focus:border-[#1E40AF] focus:ring-0 focus:outline-none rounded-none font-medium ${
                        formErrors.email ? "border-red-500 focus:border-red-500" : "border-slate-300"
                      }`}
                    />
                    {formErrors.email && (
                      <span className="text-red-500 text-[10px] font-semibold mt-1 block">{formErrors.email}</span>
                    )}
                  </div>

                  {/* ── Row: Company + Job Title ── */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Company Name *</label>
                      <input
                        required
                        type="text"
                        maxLength={150}
                        value={demoForm.companyName}
                        onChange={setField("companyName")}
                        placeholder="Citi Bank India"
                        className={`w-full border px-3 py-2 text-xs text-slate-800 bg-slate-50 focus:border-[#1E40AF] focus:ring-0 focus:outline-none rounded-none font-medium ${
                          formErrors.companyName ? "border-red-500 focus:border-red-500" : "border-slate-300"
                        }`}
                      />
                      {formErrors.companyName && (
                        <span className="text-red-500 text-[10px] font-semibold mt-1 block">{formErrors.companyName}</span>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Job Title</label>
                      <input
                        type="text"
                        maxLength={100}
                        value={demoForm.jobTitle}
                        onChange={setField("jobTitle")}
                        placeholder="Head of IT Compliance"
                        className="w-full border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-slate-50 focus:border-[#1E40AF] focus:ring-0 focus:outline-none rounded-none font-medium"
                      />
                    </div>
                  </div>

                  {/* ── Row: Org Type + Org Size ── */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Organization Type</label>
                      <select
                        value={demoForm.organizationType}
                        onChange={setField("organizationType")}
                        className="w-full border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-slate-50 focus:border-[#1E40AF] focus:ring-0 focus:outline-none rounded-none font-medium"
                      >
                        <option value="">Select type…</option>
                        <option>Bank</option>
                        <option>NBFC</option>
                        <option>FinTech</option>
                        <option>Insurance</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Organization Size</label>
                      <select
                        value={demoForm.organizationSize}
                        onChange={setField("organizationSize")}
                        className="w-full border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-slate-50 focus:border-[#1E40AF] focus:ring-0 focus:outline-none rounded-none font-medium"
                      >
                        <option value="">Select size…</option>
                        <option>1–50</option>
                        <option>51–200</option>
                        <option>201–1000</option>
                        <option>1001–5000</option>
                        <option>5000+</option>
                      </select>
                    </div>
                  </div>

                  {/* ── Row: Preferred Date + Time ── */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Preferred Demo Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={demoForm.preferredDate}
                        onChange={setField("preferredDate")}
                        className="w-full border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-slate-50 focus:border-[#1E40AF] focus:ring-0 focus:outline-none rounded-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Preferred Demo Time</label>
                      <input
                        type="time"
                        value={demoForm.preferredTime}
                        onChange={setField("preferredTime")}
                        className="w-full border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-slate-50 focus:border-[#1E40AF] focus:ring-0 focus:outline-none rounded-none font-medium"
                      />
                    </div>
                  </div>

                  {/* ── Primary Interest ── */}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Primary Interest</label>
                    <input
                      type="text"
                      maxLength={200}
                      value={demoForm.primaryInterest}
                      onChange={setField("primaryInterest")}
                      placeholder="e.g. RBI Digital Lending Guidelines, MAP Generation"
                      className="w-full border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-slate-50 focus:border-[#1E40AF] focus:ring-0 focus:outline-none rounded-none font-medium"
                    />
                  </div>

                  {/* ── Additional Notes ── */}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Additional Notes</label>
                    <textarea
                      rows={2}
                      maxLength={500}
                      value={demoForm.notes}
                      onChange={setField("notes")}
                      placeholder="Any specific requirements, compliance areas, or integration needs…"
                      className="w-full border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-slate-50 focus:border-[#1E40AF] focus:ring-0 focus:outline-none rounded-none font-medium resize-none"
                    />
                  </div>

                  {/* ── Submit ── */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1E40AF] hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs py-3 rounded-none transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span>Submitting…</span>
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </button>

                  <p className="text-[10px] text-slate-400 text-center font-medium">* Required fields. Our team will respond within 1 business day.</p>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
