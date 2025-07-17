"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AchievementItem } from "./AchievementItem";
import { AlternativeGitHubAuth } from "./AlternativeGitHubAuth";
import { FileUploadDropzone } from "./FileUploadDropzone";
import { EmailPreviewDisplay } from "./EmailPreviewDisplay";
import {
  Calendar,
  FileText,
  Copy,
  Loader2,
  Plus,
  Settings,
  Eye,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Github,
} from "lucide-react";
import { Achievement } from "@/lib/ai";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  lastModified: number;
  file?: File; // Store original file for PDFs
}

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

interface ApplicationViewProps {
  user: User;
}

export function ApplicationView({ user }: ApplicationViewProps) {
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState("basic");

  // Form data
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [prUrls, setPrUrls] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Generated data
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [emailContent, setEmailContent] = useState("");
  const [newAchievement, setNewAchievement] = useState("");

  useEffect(() => {
    // Set default dates (last week)
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    setStartDate(lastWeek.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  const steps = [
    {
      id: "basic",
      label: "Basic Setup",
      icon: Calendar,
      description: "Configure your repository and date range",
      completed: repoUrl && startDate && endDate,
    },
    {
      id: "context",
      label: "Add Context",
      icon: FileText,
      description: "Include additional information (optional)",
      completed: true, // Always accessible after basic
    },
    {
      id: "review",
      label: "Review",
      icon: Settings,
      description: "Review and customize your achievements",
      completed: achievements?.length > 0,
    },
    {
      id: "preview",
      label: "Generate",
      icon: Eye,
      description: "Generate and preview your email",
      completed: emailContent?.length > 0,
    },
  ];

  const handleAnalyze = async () => {
    const githubToken =
      user?.user_metadata?.github_token ||
      user?.user_metadata?.provider_token ||
      localStorage.getItem("github_manual_token");

    if (!githubToken) {
      alert(
        "GitHub access token not found. Please either:\n" +
          "1. Sign out and sign in again with GitHub, OR\n" +
          "2. Use the manual token option below"
      );
      return;
    }

    setLoading(true);
    try {
      const prUrlList = prUrls.split("\n").filter((url) => url.trim());

      // Separate PDF files from text content
      const pdfFiles = uploadedFiles.filter(
        (file) => file.type === "application/pdf" || file.name.endsWith(".pdf")
      );
      const textFiles = uploadedFiles.filter(
        (file) => file.type !== "application/pdf" && !file.name.endsWith(".pdf")
      );

      // Combine text file content into a single research summary
      const additionalContext =
        textFiles.length > 0
          ? textFiles
              .map((file) => `--- ${file.name} ---\n${file.content}`)
              .join("\n\n")
          : undefined;

      // Prepare request - use FormData if we have PDF files, otherwise JSON
      let response;
      if (pdfFiles.length > 0) {
        console.log(
          `📎 Sending ${pdfFiles.length} PDF files to AI for analysis`
        );

        const formData = new FormData();
        formData.append("accessToken", githubToken);
        formData.append("repoUrl", repoUrl);
        formData.append("startDate", startDate);
        formData.append("endDate", endDate);
        if (prUrlList.length > 0) {
          formData.append("prUrls", JSON.stringify(prUrlList));
        }
        if (additionalContext) {
          formData.append("notionContent", additionalContext);
        }

        // Add PDF files
        pdfFiles.forEach((uploadedFile, index) => {
          if (uploadedFile.file) {
            formData.append(`pdf_${index}`, uploadedFile.file);
          }
        });

        response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
      } else {
        // Fallback to JSON for text-only analysis
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: githubToken,
            repoUrl,
            startDate,
            endDate,
            prUrls: prUrlList.length > 0 ? prUrlList : undefined,
            notionContent: additionalContext,
          }),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to analyze GitHub data");
      }

      const data = await response.json();
      setAchievements(data.achievements || []);
      setActiveStep("review");
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze GitHub data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEmail = async () => {
    const selectedAchievements = achievements?.filter((a) => a.selected) || [];
    console.log("🔄 Starting email generation with:", {
      selectedAchievements,
      startDate,
      endDate,
    });
    setLoading(true);

    try {
      console.log("📤 Making API call to /api/generate-email");
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          achievements: selectedAchievements.map((a) => a.text),
          startDate,
          endDate,
        }),
      });

      console.log("📥 API response status:", response.status);

      if (!response.ok) {
        console.error(
          "❌ API response not ok:",
          response.status,
          response.statusText
        );
        throw new Error("Failed to generate email");
      }

      const data = await response.json();
      console.log("📧 API response data:", data);
      console.log("📧 Email content received:", data.email ? "Yes" : "No");
      console.log("📧 Email content length:", data.email?.length || 0);

      setEmailContent(data.email);
      console.log("✅ Email content set, switching to preview step");
      setActiveStep("preview");
    } catch (error) {
      console.error("❌ Email generation error:", error);
      alert("Failed to generate email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailContent);
  };

  const toggleAchievement = (id: string) => {
    setAchievements(
      achievements?.map((a) =>
        a.id === id ? { ...a, selected: !a.selected } : a
      ) || []
    );
  };

  const updateAchievement = (id: string, text: string) => {
    setAchievements(
      achievements?.map((a) => (a.id === id ? { ...a, text } : a)) || []
    );
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      const newId = Date.now().toString();
      setAchievements([
        ...(achievements || []),
        { id: newId, text: newAchievement.trim(), selected: true },
      ]);
      setNewAchievement("");
    }
  };

  const removeAchievement = (id: string) => {
    setAchievements(achievements?.filter((a) => a.id !== id) || []);
  };

  const canProceedToStep = (stepId: string) => {
    switch (stepId) {
      case "basic":
        return true;
      case "context":
        return repoUrl && startDate && endDate;
      case "review":
        return achievements?.length > 0;
      case "preview":
        return emailContent?.length > 0;
      default:
        return false;
    }
  };

  const renderLeftColumn = () => {
    return (
      <div className="w-1/3 p-8">
        <div className="space-y-8">
          {/* Progress Steps */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Progress</h2>
            <nav className="space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep === step.id;
                const isCompleted = step.completed;

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (canProceedToStep(step.id)) {
                        setActiveStep(step.id);
                      }
                    }}
                    disabled={!canProceedToStep(step.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                        : isCompleted
                        ? "bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30"
                        : canProceedToStep(step.id)
                        ? "text-slate-300 hover:bg-slate-700/50"
                        : "text-slate-500 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{step.label}</div>
                        <div
                          className={`text-xs mt-1 ${
                            isActive
                              ? "text-white/80"
                              : isCompleted
                              ? "text-green-300/80"
                              : "text-slate-400"
                          }`}
                        >
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* GitHub Auth Section */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Github className="h-5 w-5 text-primary" />
              <h3 className="text-white font-semibold">GitHub Access</h3>
            </div>
            <p className="text-slate-400 text-sm mb-2">
              Alternative authentication method if needed
            </p>
            <AlternativeGitHubAuth />
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    console.log("🎨 renderMainContent called with activeStep:", activeStep);
    console.log("🎨 emailContent state:", {
      hasContent: !!emailContent,
      length: emailContent?.length || 0,
    });

    switch (activeStep) {
      case "basic":
        return (
          <div className="glass-card p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Repository Configuration
              </h2>
              <p className="text-slate-300">
                Set up your GitHub repository and date range for analysis
              </p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-slate-200">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-slate-200">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="glass-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="repoUrl" className="text-slate-200">
                  GitHub Repository URL
                </Label>
                <Input
                  id="repoUrl"
                  type="url"
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="glass-input"
                />
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep("basic")}
                  className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-slate-500"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="gradient-button text-white font-semibold py-3 px-6 rounded-xl border-0"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze GitHub Data
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case "context":
        return (
          <div className="glass-card p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Add Additional Context
              </h2>
              <p className="text-slate-300">
                Include extra information to provide more context for your
                achievements
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prUrls" className="text-slate-200">
                  Pull Request URLs (optional)
                </Label>
                <textarea
                  id="prUrls"
                  placeholder="https://github.com/username/repo/pull/123&#10;https://github.com/username/repo/pull/456"
                  value={prUrls}
                  onChange={(e) => setPrUrls(e.target.value)}
                  rows={4}
                  className="glass-input resize-none"
                />
                <p className="text-slate-400 text-sm">
                  Add one URL per line for specific pull requests you want to
                  highlight
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">
                  Upload Files (optional)
                </Label>
                <FileUploadDropzone
                  onFilesChange={setUploadedFiles}
                  files={uploadedFiles}
                />
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep("basic")}
                  className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-slate-500"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setActiveStep("review")}
                  disabled={!canProceedToStep("review")}
                  className="gradient-button text-white font-semibold py-3 px-6 rounded-xl border-0"
                  size="lg"
                >
                  Continue to Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="glass-card p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Review Your Achievements
              </h2>
              <p className="text-slate-300">
                Edit, add, or remove achievements before generating your email
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                {achievements?.map((achievement) => (
                  <AchievementItem
                    key={achievement.id}
                    achievement={achievement}
                    onToggle={() => toggleAchievement(achievement.id)}
                    onUpdate={(text) => updateAchievement(achievement.id, text)}
                    onRemove={() => removeAchievement(achievement.id)}
                  />
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a new achievement..."
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  className="glass-input"
                  onKeyPress={(e) => e.key === "Enter" && addAchievement()}
                />
                <Button
                  onClick={addAchievement}
                  disabled={!newAchievement.trim()}
                  className="gradient-button text-white font-semibold py-3 px-6 rounded-xl border-0"
                >
                  Add
                </Button>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep("context")}
                  className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-slate-500"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleGenerateEmail}
                  disabled={
                    loading ||
                    (achievements?.filter((a) => a.selected).length || 0) === 0
                  }
                  className="gradient-button text-white font-semibold py-3 px-6 rounded-xl border-0"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Email
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case "preview":
        console.log("🎯 Rendering EmailPreviewDisplay with emailContent:", {
          hasContent: !!emailContent,
          length: emailContent?.length || 0,
        });
        return (
          <EmailPreviewDisplay
            emailContent={emailContent}
            onBack={() => setActiveStep("review")}
            onCopy={handleCopyEmail}
          />
        );

      default:
        console.log("❌ Unknown activeStep:", activeStep);
        return null;
    }
  };

  return (
    <div className="flex flex-1">
      {/* Left Column - Navigation & Settings */}
      {renderLeftColumn()}

      {/* Right Column - Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">{renderMainContent()}</div>
      </div>
    </div>
  );
}
