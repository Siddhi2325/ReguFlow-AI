import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  theme?: "default" | "dark" | "light";
  className?: string;
  onClick?: () => void;
  collapsed?: boolean;
}

export default function Logo({ size = "md", theme = "default", className, onClick, collapsed = false }: LogoProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      navigate("/");
    }
  };

  const heightClasses = {
    sm: "h-12",    // 48px
    md: "h-16",    // 64px
    lg: "h-24",    // 96px
  };

  const height = heightClasses[size] || heightClasses.md;

  if (collapsed) {
    return (
      <div 
        onClick={handleClick}
        className={cn(
          "flex items-center justify-center cursor-pointer select-none overflow-hidden rounded-lg",
          size === "sm" ? "w-12 h-12" : size === "lg" ? "w-24 h-24" : "w-16 h-16",
          className
        )}
      >
        <img 
          src="/logo.png" 
          alt="Logo Icon" 
          className="h-full max-w-none object-cover object-left" 
          style={{ width: '300%' }}
        />
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "flex items-center select-none cursor-pointer hover:opacity-90 transition-opacity",
        className
      )}
    >
      <img 
        src="/logo.png" 
        alt="ReguFlow AI" 
        className={cn(height, "object-contain")} 
      />
    </div>
  );
}