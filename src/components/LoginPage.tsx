import React, { useState } from "react";
import { 
  User, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginPageProps {
  onLoginSuccess?: (userData: { email: string; name: string }) => void;
  onGoBack?: () => void;
}

export function LoginPage({ onLoginSuccess, onGoBack }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password || (isRegister && !name)) {
      setError("Please complete all requested credentials.");
      return;
    }

    setIsLoading(true);

    // Simulated authentic authentication block
    setTimeout(() => {
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess({
          email: email.trim(),
          name: isRegister ? name.trim() : email.split("@")[0]
        });
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
      
      {/* Background design accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden"
      >
        {/* Subtle colorful top bar */}
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-650 w-full" />

        {/* Content Box */}
        <div className="p-8 sm:p-10 text-left">
          
          {/* Brand/Product Identification */}
          <div className="flex items-center space-x-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg text-white">
              <Sparkles className="h-4.5 w-4.5 text-rose-450 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase text-slate-950 tracking-wider font-sans">
                Arriboyina Portal
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest -mt-0.5 font-mono">
                Sovereign Study Desk
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {isRegister ? "Start your sovereign journey" : "Welcome back, officer"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {isRegister 
                ? "Configure your personal dashboard node to sync with progress analytics."
                : "Authorize secure cabin node to load saved current affairs feed."
              }
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Aspirant Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sreeram"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:ring-1 focus:ring-slate-900 focus:outline-hidden transition-all placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Study Email Node</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@civils.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:ring-1 focus:ring-slate-900 focus:outline-hidden transition-all placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Secret Key / Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium focus:ring-1 focus:ring-slate-900 focus:outline-hidden transition-all placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-950 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-slate-500 font-medium font-sans">Persistent cabin session</span>
              </label>
              
              {!isRegister && (
                <button 
                  type="button" 
                  className="text-indigo-650 hover:underline font-bold"
                  onClick={() => alert("Simulated password reset sent to study node email.")}
                >
                  Forgot secret?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-950 hover:bg-slate-850 active:scale-98 text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50 mt-4"
            >
              <span>{isLoading ? "Authenticating Study Cabin..." : isRegister ? "Create Sovereign Desk" : "Authorize Entry"}</span>
              {!isLoading && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </form>

          {/* Prompt Toggle */}
          <div className="mt-6 text-center border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-500 font-medium">
              {isRegister ? "Already configured a cabinet key?" : "New to the platform?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                className="text-rose-600 hover:underline font-bold cursor-pointer"
              >
                {isRegister ? "Authorize Existing Cabinet" : "Request Study Cabinet"}
              </button>
            </p>
          </div>

          {/* High safety standard notice */}
          <div className="mt-6 p-3 bg-slate-50 rounded-xl flex items-start space-x-2 border border-slate-150 select-none">
            <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-normal font-sans font-medium">
              Self-contained architecture ready for Firebase authentication, Custom JWT, or OAuth standard setup keys in your local VS Code workspace.
            </p>
          </div>

          {onGoBack && (
            <button
              type="button"
              onClick={onGoBack}
              className="mt-4 w-full text-center text-xs text-slate-400 hover:text-slate-650 font-bold tracking-wide uppercase font-mono cursor-pointer"
            >
              ← Clear cabin slate & exit
            </button>
          )}

        </div>
      </motion.div>
    </div>
  );
}
