"use client";

import { useState, useEffect } from "react";
import { Copy, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailPreviewDisplayProps {
  emailContent: string;
  onBack: () => void;
  onCopy: () => void;
}

export function EmailPreviewDisplay({
  emailContent,
  onBack,
  onCopy,
}: EmailPreviewDisplayProps) {
  console.log("🎯 EmailPreviewDisplay rendered with emailContent:", {
    hasContent: !!emailContent,
    contentLength: emailContent?.length || 0,
    contentPreview: emailContent?.substring(0, 100) + "...",
  });

  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    console.log(
      "🔄 EmailPreviewDisplay useEffect triggered with emailContent:",
      {
        hasContent: !!emailContent,
        contentLength: emailContent?.length || 0,
      }
    );

    if (!emailContent) {
      console.log("❌ No email content provided to EmailPreviewDisplay");
      return;
    }

    let index = 0;
    setDisplayedText("");
    setIsTyping(true);

    const timer = setInterval(() => {
      if (index < emailContent.length) {
        setDisplayedText(emailContent.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 15); // Slightly faster typing speed

    return () => clearInterval(timer);
  }, [emailContent]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(emailContent);
      setCopied(true);
      onCopy(); // Call the original onCopy handler
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Fallback for older browsers
      onCopy();
    }
  };

  // Calculate statistics
  const wordCount = emailContent
    ? emailContent.split(/\s+/).filter((word) => word.length > 0).length
    : 0;
  const charCount = emailContent ? emailContent.length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed

  return (
    <div>
      {/* Browser-style Email Container */}
      <div className="max-w-5xl mx-auto">
        <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
          {/* Browser Header */}
          <div className="bg-slate-700/50 border-b border-slate-600/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-slate-300 text-sm font-mono">
                Weekly Update Generator
              </div>
            </div>
          </div>

          {/* Email Content */}
          <div className="p-8">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-600/30 font-mono text-sm leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
              <pre className="text-slate-200 whitespace-pre-wrap">
                {displayedText}
                {isTyping && (
                  <span className="animate-pulse bg-violet-400 w-2 h-5 inline-block ml-1"></span>
                )}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                onClick={handleCopyToClipboard}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/25"
                disabled={isTyping}
                size="lg"
              >
                {copied ? (
                  <>
                    <CheckCircle size={18} className="mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} className="mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>

              <Button
                onClick={onBack}
                variant="outline"
                className="flex-1 bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-slate-500 transition-all duration-200 py-3"
                size="lg"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Review
              </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-600/50">
              <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                <div className="text-2xl font-bold text-violet-400">
                  {wordCount}
                </div>
                <div className="text-slate-300 text-sm">Words</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                <div className="text-2xl font-bold text-sky-400">
                  {charCount}
                </div>
                <div className="text-slate-300 text-sm">Characters</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                <div className="text-2xl font-bold text-amber-400">
                  ~{readTimeMinutes} min
                </div>
                <div className="text-slate-300 text-sm">Read Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
