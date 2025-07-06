"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key } from "lucide-react";

export function AlternativeGitHubAuth() {
  const [token, setToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <div className="space-y-2">
          <Button
            onClick={() => setShowTokenInput(!showTokenInput)}
            className="gradient-button text-white font-semibold py-3 px-4 rounded-xl border-0 w-full justify-center"
            size="lg"
          >
            <Key className="h-4 w-4 mr-2" />
            {showTokenInput ? "Hide Token Input" : "Add Personal Token"}
          </Button>
        </div>
      </div>

      {showTokenInput && (
        <div className="space-y-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-xl">
          <p className="text-sm text-slate-300">
            Enter your GitHub Personal Access Token:
          </p>
          <div className="space-y-3">
            <Input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="glass-input"
            />
            <Button
              onClick={() => {
                if (token) {
                  localStorage.setItem("github_manual_token", token);
                  window.location.reload();
                }
              }}
              disabled={!token}
              className="gradient-button text-white font-semibold py-2 px-4 rounded-xl border-0 w-full"
              size="sm"
            >
              Save Token
            </Button>
          </div>
          <p className="text-xs text-slate-400">
            Create a token at github.com/settings/tokens with &apos;repo&apos;
            scope
          </p>
        </div>
      )}
    </div>
  );
}
