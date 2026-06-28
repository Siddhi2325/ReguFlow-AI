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
    sm: "h-6",
    md: "h-8",
    lg: "h-11",
  };

  const height = heightClasses[size] || heightClasses.md;

  if (collapsed) {
    return (
      <div 
        onClick={handleClick}
        className={cn(
          "flex items-center justify-center cursor-pointer select-none overflow-hidden rounded-lg",
          size === "sm" ? "w-6 h-6" : size === "lg" ? "w-11 h-11" : "w-8 h-8",
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