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
        <h3 className="text-sm font-medium text-gray-900 mb-3">GitHub Token</h3>
        <div className="space-y-2">
          <Button
            onClick={() => setShowTokenInput(!showTokenInput)}
            variant="outline"
            size="sm"
            className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Key className="h-4 w-4 mr-2" />
            {showTokenInput ? "Hide Token Input" : "Add Personal Token"}
          </Button>
        </div>
      </div>

      {showTokenInput && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            Enter your GitHub Personal Access Token:
          </p>
          <div className="space-y-2">
            <Input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              onClick={() => {
                if (token) {
                  localStorage.setItem("github_manual_token", token);
                  window.location.reload();
                }
              }}
              disabled={!token}
              size="sm"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs"
            >
              Save Token
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Create a token at github.com/settings/tokens with &apos;repo&apos;
            scope
          </p>
        </div>
      )}
    </div>
  );
}
