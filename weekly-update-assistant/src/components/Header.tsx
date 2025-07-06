"use client";

import { Button } from "@/components/ui/button";
import { Github, LogOut } from "lucide-react";
import { signInWithGitHub, signOut } from "@/lib/supabase";

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    github_token?: string;
    provider_token?: string;
  };
}

interface HeaderProps {
  user: User | null;
}

export function Header({ user }: HeaderProps) {
  const handleSignIn = async () => {
    const { error } = await signInWithGitHub();
    if (error) {
      console.error("Sign in error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Sign out error:", error);
      } else {
        // Force page reload to update the UI state
        window.location.reload();
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Weekly Update Assistant
          </h1>
        </div>

        <div>
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full border border-border"
                  />
                )}
                <span className="text-sm text-foreground font-medium">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={handleSignIn}>
              <Github className="h-4 w-4 mr-2" />
              Sign In with GitHub
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
