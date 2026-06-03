"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, Image, FileText, CheckCircle, AlertTriangle } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  acceptedTypes: string[];
  maxSizeMB: number;
  label?: string;
  sublabel?: string;
  icon?: "image" | "document";
}

export default function UploadZone({
  onFileSelect,
  acceptedTypes,
  maxSizeMB,
  label = "Upload your file",
  sublabel = "Drag & drop karo ya click karo",
  icon = "image",
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `Invalid file type. Accepted: ${acceptedTypes.map((t) => t.split("/")[1]).join(", ")}`;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `File too large. Maximum size: ${maxSizeMB}MB`;
      }
      return null;
    },
    [acceptedTypes, maxSizeMB]
  );

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setSelectedFile(file);
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const IconComponent = icon === "image" ? Image : FileText;

  return (
    <div style={{ width: "100%" }}>
      <div
        id="upload-zone"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label={label}
        style={{
          border: `2px dashed ${isDragging ? "var(--purple-primary)" : selectedFile ? "var(--severity-low)" : "#D1D5DB"}`,
          borderRadius: "16px",
          background: isDragging
            ? "var(--purple-glow)"
            : selectedFile
              ? "rgba(16, 185, 129, 0.05)"
              : "#F9FAFB",
          height: "280px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {selectedFile ? (
          <>
            <CheckCircle
              size={48}
              style={{
                color: "var(--severity-low)",
                marginBottom: "12px",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "15px",
                color: "var(--text-primary)",
              }}
            >
              {selectedFile.name}
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--text-secondary)",
                marginTop: "4px",
              }}
            >
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to
              change
            </p>
          </>
        ) : (
          <>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: isDragging
                  ? "rgba(124,58,237,0.15)"
                  : "rgba(124,58,237,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                transition: "all 0.3s ease",
              }}
            >
              {isDragging ? (
                <Upload size={28} style={{ color: "var(--purple-primary)" }} />
              ) : (
                <IconComponent
                  size={28}
                  style={{ color: "var(--purple-primary)" }}
                />
              )}
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "15px",
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}
            >
              {isDragging ? "Drop your file here" : label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--text-secondary)",
                marginBottom: "12px",
              }}
            >
              {sublabel}
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {acceptedTypes.map((t) => t.split("/")[1]).join(", ")} • Max{" "}
              {maxSizeMB}MB
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleInputChange}
          style={{ display: "none" }}
          aria-hidden="true"
        />
      </div>

      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "12px",
            padding: "10px 14px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "10px",
            color: "var(--severity-high)",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
          }}
        >
          <AlertTriangle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
