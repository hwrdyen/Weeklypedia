"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SignInView } from "@/components/SignInView";
import { ApplicationView } from "@/components/ApplicationView";
import { getCurrentUser } from "@/lib/supabase";

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

export default function WeeklyUpdateAssistant() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { user } = await getCurrentUser();
    setUser(user);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <Header user={user} />
      {user ? (
        <div className="flex h-[calc(100vh-4rem-1px)]">
          <ApplicationView user={user} />
        </div>
      ) : (
        <SignInView />
      )}
    </div>
  );
}
