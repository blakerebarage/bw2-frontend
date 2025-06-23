import { Button } from "@/components/ui/button";

export default function PrimaryButton({ children, icon: Icon, background }) {
  const isLogin = background === "red";
  
  return (
    <Button
      className={`
        ${isLogin 
          ? "bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 border-red-400/50 shadow-red-500/25 hover:shadow-red-500/40" 
          : "bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 hover:from-yellow-700 hover:via-yellow-600 hover:to-yellow-700 border-yellow-400/50 shadow-yellow-500/25 hover:shadow-yellow-500/40"
        } 
        flex items-center justify-center gap-2 px-4 py-2.5 
        text-white font-semibold text-sm 
        rounded-lg border-2 
        shadow-lg hover:shadow-xl 
        transform hover:scale-105 
        transition-all duration-300 ease-out
        backdrop-blur-sm
        hover:brightness-110
        active:scale-95
        min-w-[90px]
        hover:glow-effect
        relative
        overflow-hidden
        group
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
      <Icon className={`text-lg ${isLogin ? 'animate-pulse' : 'animate-bounce'} duration-2000 relative z-10`} />
      <span className="font-bold tracking-wide relative z-10">{children}</span>
    </Button>
  );
}
