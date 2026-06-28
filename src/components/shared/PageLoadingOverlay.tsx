import { usePageLoading } from "@/state/PageLoadingContext";

export default function PageLoadingOverlay() {
  const { isLoading } = usePageLoading();

  if (!isLoading) return null;

  return (
    <div 
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/50 backdrop-blur-md transition-all duration-300 animate-fade-in"
    >
      <div className="bg-card/90 border border-border/80 rounded-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden text-center backdrop-blur-lg">
        {/* Glow effects */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
        
        {/* Spinner logo */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping w-16 h-16 pointer-events-none" />
          <div className="w-16 h-16 rounded-full border border-primary/10 flex items-center justify-center bg-card shadow-inner">
            <svg 
              viewBox="0 0 32 32" 
              className="w-9 h-9 animate-spin text-primary"
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="spinnerBlueGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1E90FF" />
                  <stop offset="100%" stopColor="#0057FF" />
                </linearGradient>
              </defs>
              <g 
                stroke="url(#spinnerBlueGrad)" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M8 6V26" />
                <path d="M8 8H17C20.5 8 23 10.5 23 13.5C23 16.5 20.5 19 17 19H8" />
                <path d="M13 19L21 27H27" />
                <path d="M24 24L27 27L24 30" />
              </g>
            </svg>
          </div>
        </div>

        <h3 className="text-xs font-extrabold text-foreground tracking-wider uppercase">
          Synchronizing Compliance
        </h3>
        <p className="text-[11px] text-muted-foreground mt-1.5 font-medium max-w-[240px]">
          Analyzing policies & regulatory intelligence logs...
        </p>

        {/* Shimmer loading bar */}
        <div className="w-full bg-muted h-1 rounded-full overflow-hidden mt-6 relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full w-1/2 animate-shimmer" style={{
            animation: "shimmer 1.5s infinite ease-in-out"
          }} />
        </div>
      </div>
    </div>
  );
}
