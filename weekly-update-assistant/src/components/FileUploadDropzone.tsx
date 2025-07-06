"use client";

import React, { useState, useCallback } from "react";
import { Upload, X, FileText, File, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  lastModified: number;
  file?: File; // Store original file for PDFs
}

interface FileUploadDropzoneProps {
  onFilesChange: (files: UploadedFile[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

export function FileUploadDropzone({
  onFilesChange,
  acceptedTypes = [".txt", ".md", ".pdf", ".doc", ".docx"],
  maxFiles = 10,
  maxFileSize = 5,
}: FileUploadDropzoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [pastedContent, setPastedContent] = useState("");

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Handle PDF files - we'll send them directly to AI
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      console.log(
        `PDF file detected: ${file.name} - will be sent directly to AI for analysis`
      );
      return `[PDF File: ${file.name} - Will be analyzed directly by AI]`;
    }

    // Handle other file types with FileReader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () =>
        reject(new Error(`Failed to read file: ${file.name}`));

      reader.readAsText(file);
    });
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setError(null);

    try {
      const processedFiles: UploadedFile[] = [];

      for (const file of files) {
        // Check file size
        if (file.size > maxFileSize * 1024 * 1024) {
          throw new Error(
            `File "${file.name}" is too large. Maximum size is ${maxFileSize}MB.`
          );
        }

        try {
          const content = await extractTextFromFile(file);
          const uploadedFile: UploadedFile = {
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            content,
            lastModified: file.lastModified,
          };

          // For PDFs, also store the original file
          if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
            uploadedFile.file = file;
          }

          processedFiles.push(uploadedFile);
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          // Add file with error indicator
          processedFiles.push({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            content: `[Error: Could not extract content from ${file.name}]`,
            lastModified: file.lastModified,
          });
        }
      }

      const newFiles = [...uploadedFiles, ...processedFiles];

      // Check total file limit
      if (newFiles.length > maxFiles) {
        throw new Error(`Maximum ${maxFiles} files allowed.`);
      }

      setUploadedFiles(newFiles);
      onFilesChange(newFiles);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing files"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [uploadedFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    // Clear the input so the same file can be selected again
    e.target.value = "";
  };

  const removeFile = (fileId: string) => {
    const newFiles = uploadedFiles.filter((file) => file.id !== fileId);
    setUploadedFiles(newFiles);
    onFilesChange(newFiles);
  };

  const handlePasteContent = () => {
    if (!pastedContent.trim()) {
      setError("Please enter some content to add.");
      return;
    }

    const pastedFile: UploadedFile = {
      id: `pasted-${Date.now()}`,
      name: "Pasted Markdown Content",
      size: pastedContent.length,
      type: "text/markdown",
      content: pastedContent,
      lastModified: Date.now(),
    };

    const newFiles = [...uploadedFiles, pastedFile];

    if (newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    setUploadedFiles(newFiles);
    onFilesChange(newFiles);
    setPastedContent("");
    setError(null);
  };

  const clearPastedContent = () => {
    setPastedContent("");
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    if (fileName.endsWith(".pdf")) return <FileText className="h-4 w-4" />;
    if (fileName.endsWith(".md") || fileName.endsWith(".txt"))
      return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "upload"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          📁 Upload Files
        </button>
        <button
          onClick={() => setActiveTab("paste")}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "paste"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          📝 Paste Markdown
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            className="hidden"
          />

          <Upload
            className={`h-8 w-8 mx-auto mb-2 ${
              isDragging ? "text-primary" : "text-muted-foreground"
            }`}
          />

          <p className="text-sm font-medium mb-1">
            {isDragging
              ? "Drop files here"
              : "Drag files here or click to browse"}
          </p>

          <p className="text-xs text-muted-foreground">
            Supports: {acceptedTypes.join(", ")} • Max {maxFiles} files •{" "}
            {maxFileSize}MB each
          </p>

          {isProcessing && (
            <p className="text-xs text-primary mt-2">Processing files...</p>
          )}
        </div>
      )}

      {/* Paste Tab */}
      {activeTab === "paste" && (
        <div className="space-y-3">
          <div className="border rounded-lg p-4 bg-background">
            <label className="block text-sm font-medium text-foreground mb-2">
              Paste your research notes, documentation, or markdown content:
            </label>
            <textarea
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              placeholder="Paste your markdown content here...

Example:
# Research Findings
- Analyzed database performance optimization techniques
- Implemented new caching strategies
- Documented API design patterns

## Key Insights
- Performance improved by 40%
- User experience significantly enhanced"
              className="w-full h-64 p-3 border border-border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted-foreground">
                {pastedContent.length} characters
              </p>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearPastedContent}
                  disabled={!pastedContent.trim()}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  onClick={handlePasteContent}
                  disabled={!pastedContent.trim()}
                  size="sm"
                >
                  Add Content
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-auto h-auto p-1"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
              >
                {getFileIcon(file.name, file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} • {file.content.length}{" "}
                    characters extracted
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="h-auto p-1 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
