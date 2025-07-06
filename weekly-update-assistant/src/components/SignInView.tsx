"use client";

import { Button } from "@/components/ui/button";
import { Github, FileText, Mail, Calendar, Zap } from "lucide-react";
import { signInWithGitHub } from "@/lib/supabase";

export function SignInView() {
  const handleSignIn = async () => {
    const { error } = await signInWithGitHub();
    if (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem-1px)] relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/placeholder.svg?height=1080&width=1920')`,
        }}
      >
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Weekly Update Assistant
              </h1>
              <p className="text-slate-300">
                Automate your weekly progress reports
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 text-sm text-slate-300">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Github className="h-4 w-4 text-primary" />
                </div>
                <span>Connect to your GitHub repositories</span>
              </div>

              <div className="flex items-center space-x-3 text-sm text-slate-300">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <span>AI analyzes your commits and pull requests</span>
              </div>

              <div className="flex items-center space-x-3 text-sm text-slate-300">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <span>Review and customize your achievements</span>
              </div>

              <div className="flex items-center space-x-3 text-sm text-slate-300">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span>Generate professional email updates</span>
              </div>
            </div>

            {/* GitHub Sign In Button */}
            <Button
              onClick={handleSignIn}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/25 border-0"
            >
              <Github className="h-5 w-5 mr-2" />
              Continue with GitHub
            </Button>

            {/* Privacy Notice */}
            <p className="text-xs text-center text-slate-400 mt-6">
              We only access your public repositories and basic profile
              information
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
