"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Classroom, 
  TranscriptLine, 
  ClassroomNote, 
  getRoomTranscripts, 
  getClassroomNotes, 
  saveClassroomNote 
} from "../../lib/firestore";
import { 
  Sparkles, 
  Copy, 
  FileText, 
  X, 
  BookOpen, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";

interface ClassHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom | null;
}

// Markdown renderer to render preview styling for notes in the UI
const renderNotesContent = (text: string) => {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];
  let isInsideList = false;
  let listType: "ul" | "ol" | null = null;

  const flushList = (key: string | number) => {
    if (currentListItems.length > 0) {
      if (listType === "ul") {
        elements.push(
          <ul key={`ul-${key}`} style={{ paddingLeft: "20px", margin: "10px 0 18px 0", listStyleType: "disc", display: "flex", flexDirection: "column", gap: "6px" }}>
            {currentListItems}
          </ul>
        );
      } else if (listType === "ol") {
        elements.push(
          <ol key={`ol-${key}`} style={{ paddingLeft: "20px", margin: "10px 0 18px 0", listStyleType: "decimal", display: "flex", flexDirection: "column", gap: "6px" }}>
            {currentListItems}
          </ol>
        );
      }
      currentListItems = [];
    }
    isInsideList = false;
    listType = null;
  };

  const parseInlineStyles = (lineText: string) => {
    const parts = lineText.split(/(\*\*.*?\*\*|\*.*?\*)/);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} style={{ color: "#cfbcff", fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} style={{ color: "#e3e1e9", fontStyle: "italic" }}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(idx);
      return;
    }

    // Headers
    if (trimmed.startsWith("#")) {
      flushList(idx);
      const level = (trimmed.match(/^#+/) || [""])[0].length;
      const headerText = trimmed.replace(/^#+\s*/, "");
      
      const headerStyle: React.CSSProperties = {
        color: level === 1 ? "#ffffff" : level === 2 ? "#cfbcff" : "#38bdf8",
        fontSize: level === 1 ? "1.45rem" : level === 2 ? "1.2rem" : "1.0rem",
        fontWeight: 700,
        marginTop: "20px",
        marginBottom: "10px",
        letterSpacing: "-0.01em",
      };

      elements.push(<h4 key={idx} style={headerStyle}>{parseInlineStyles(headerText)}</h4>);
      return;
    }

    // Bullet lists
    const bulletMatch = trimmed.match(/^[-*+]\s+(.*)/);
    if (bulletMatch) {
      if (!isInsideList || listType !== "ul") {
        flushList(idx);
        isInsideList = true;
        listType = "ul";
      }
      const itemText = bulletMatch[1];
      currentListItems.push(
        <li key={`li-${idx}`} style={{ color: "#cbc3d5", lineHeight: "1.6" }}>
          {parseInlineStyles(itemText)}
        </li>
      );
      return;
    }

    // Numbered lists
    const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberMatch) {
      if (!isInsideList || listType !== "ol") {
        flushList(idx);
        isInsideList = true;
        listType = "ol";
      }
      const itemText = numberMatch[2];
      currentListItems.push(
        <li key={`li-${idx}`} style={{ color: "#cbc3d5", lineHeight: "1.6" }}>
          {parseInlineStyles(itemText)}
        </li>
      );
      return;
    }

    // Paragraph
    flushList(idx);
    elements.push(
      <p key={idx} style={{ margin: "8px 0 12px 0", color: "#cbc3d5", lineHeight: "1.65" }}>
        {parseInlineStyles(trimmed)}
      </p>
    );
  });

  flushList("end");
  return elements;
};

export default function ClassHistoryModal({ isOpen, onClose, classroom }: ClassHistoryModalProps) {
  const [transcripts, setTranscripts] = useState<TranscriptLine[]>([]);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);
  const [savedNotes, setSavedNotes] = useState<ClassroomNote | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const notesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll notes container while streaming notes
  useEffect(() => {
    if (notesEndRef.current) {
      notesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [notesText]);

  // Load classroom transcripts and notes on select
  useEffect(() => {
    if (isOpen && classroom) {
      setError("");
      setNotesText("");
      setSavedNotes(null);
      
      // Fetch Transcripts (stored transcripts needed to generate notes)
      setLoadingTranscripts(true);
      getRoomTranscripts(classroom.roomCode)
        .then((data) => {
          setTranscripts(data);
          setLoadingTranscripts(false);
        })
        .catch((err) => {
          console.error("Failed to load transcripts:", err);
          setLoadingTranscripts(false);
        });

      // Fetch saved notes
      setLoadingNotes(true);
      getClassroomNotes(classroom.roomCode)
        .then((notesList) => {
          if (notesList.length > 0) {
            setSavedNotes(notesList[0]); // Load the latest saved note
            setNotesText(notesList[0].content);
          }
          setLoadingNotes(false);
        })
        .catch((err) => {
          console.error("Failed to load saved notes:", err);
          setLoadingNotes(false);
        });
    }
  }, [isOpen, classroom]);

  if (!isOpen || !classroom) return null;

  // Handle note generation via the streamed API
  const handleGenerateNotes = async () => {
    if (transcripts.length === 0) {
      toast.warning("No transcript lines available to analyze. Educator must speak during a live class first.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setNotesText("");
    setSavedNotes(null);

    const transcriptsText = transcripts
      .map((t) => `${t.speakerName}: ${t.text}`)
      .join("\n");

    try {
      const response = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: classroom.roomCode,
          transcriptsText
        })
      });

      if (!response.ok) {
        let errMsg = "Failed to connect to AI server.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      if (!response.body) throw new Error("No response content stream.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let completeNotes = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          const finalChunk = decoder.decode();
          if (finalChunk) {
            completeNotes += finalChunk;
            setNotesText((prev) => prev + finalChunk);
          }
          break;
        }
        const chunkValue = decoder.decode(value, { stream: true });
        if (chunkValue) {
          completeNotes += chunkValue;
          setNotesText((prev) => prev + chunkValue);
        }
      }

      // Save complete notes to Firestore
      await saveClassroomNote(classroom.roomCode, completeNotes);
      toast.success("AI Notes generated and saved successfully!");
      
      // Reload notes from DB to sync UI state
      const updatedNotes = await getClassroomNotes(classroom.roomCode);
      if (updatedNotes.length > 0) {
        setSavedNotes(updatedNotes[0]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during AI note generation.");
      toast.error(err.message || "Failed to generate notes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!notesText) return;
    navigator.clipboard.writeText(notesText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Notes copied to clipboard!");
      })
      .catch((err) => {
        console.error("Clipboard copy failed:", err);
      });
  };

  // Dynamically load jsPDF CDN library in client environment
  const loadJsPDF = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Cannot load jsPDF on SSR"));
        return;
      }
      if ((window as any).jspdf) {
        resolve((window as any).jspdf.jsPDF);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => {
        resolve((window as any).jspdf.jsPDF);
      };
      script.onerror = () => {
        reject(new Error("Failed to load PDF library script."));
      };
      document.body.appendChild(script);
    });
  };

  // Convert Markdown notes into a cleanly formatted PDF document client-side
  const handleDownloadPDF = async () => {
    if (!notesText) return;
    setIsDownloadingPdf(true);
    
    try {
      const jsPDFClass = await loadJsPDF();
      const doc = new jsPDFClass({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      let y = margin;
      
      const checkPageOverflow = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // Set Document Header Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(148, 108, 254); // Match brand purple: #946cfe
      const docTitle = `${classroom.name} - Study Notes`;
      const wrappedTitle = doc.splitTextToSize(docTitle, contentWidth);
      doc.text(wrappedTitle, margin, y);
      y += (wrappedTitle.length * 8) + 6;

      // Add classroom context info
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Educator: ${classroom.teacherName}  |  Class Room Code: ${classroom.roomCode}`, margin, y);
      y += 8;

      // Add a line divider
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Split body into lines and format
      const lines = notesText.split("\n");
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
          y += 4;
          continue;
        }

        // Title Header Level 1 (e.g., # Main Title)
        if (line.startsWith("# ")) {
          const textVal = line.substring(2).replace(/\*\*/g, "");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.setTextColor(148, 108, 254);
          const wrapped = doc.splitTextToSize(textVal, contentWidth);
          checkPageOverflow(wrapped.length * 7 + 6);
          doc.text(wrapped, margin, y);
          y += (wrapped.length * 7) + 5;
        } 
        // Sub-Header Level 2 (e.g., ## Subtitle)
        else if (line.startsWith("## ")) {
          const textVal = line.substring(3).replace(/\*\*/g, "");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(41, 10, 131); // Dark blue accent
          const wrapped = doc.splitTextToSize(textVal, contentWidth);
          checkPageOverflow(wrapped.length * 6 + 5);
          doc.text(wrapped, margin, y);
          y += (wrapped.length * 6) + 4;
        } 
        // Sub-Header Level 3 (e.g., ### Sub-sub-title)
        else if (line.startsWith("### ")) {
          const textVal = line.substring(4).replace(/\*\*/g, "");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(60, 60, 60);
          const wrapped = doc.splitTextToSize(textVal, contentWidth);
          checkPageOverflow(wrapped.length * 5 + 4);
          doc.text(wrapped, margin, y);
          y += (wrapped.length * 5) + 3;
        } 
        // Bullet points (e.g., - Bullet or * Bullet)
        else if (line.startsWith("- ") || line.startsWith("* ")) {
          const textVal = line.substring(2).replace(/\*\*/g, "");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.5);
          doc.setTextColor(50, 50, 50);
          
          checkPageOverflow(5);
          doc.text("•", margin + 2, y); // Bullet symbol slightly offset
          
          const wrapped = doc.splitTextToSize(textVal, contentWidth - 8);
          doc.text(wrapped, margin + 7, y);
          y += (wrapped.length * 5.5) + 2;
        } 
        // Numbered list (e.g., 1. Item)
        else if (/^\d+\.\s+/.test(line)) {
          const numMatch = line.match(/^(\d+\.)\s+(.*)/);
          const numPrefix = numMatch ? numMatch[1] : "";
          const textVal = (numMatch ? numMatch[2] : line).replace(/\*\*/g, "");
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(50, 50, 50);
          checkPageOverflow(5);
          doc.text(numPrefix, margin + 2, y);
          
          doc.setFont("helvetica", "normal");
          const wrapped = doc.splitTextToSize(textVal, contentWidth - 10);
          doc.text(wrapped, margin + 9, y);
          y += (wrapped.length * 5.5) + 2;
        }
        // Standard text paragraph
        else {
          const textVal = line.replace(/\*\*/g, ""); // strip raw bold tags
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.5);
          doc.setTextColor(50, 50, 50);
          
          const wrapped = doc.splitTextToSize(textVal, contentWidth);
          checkPageOverflow(wrapped.length * 5.5 + 2);
          doc.text(wrapped, margin, y);
          y += (wrapped.length * 5.5) + 2.5;
        }
      }

      const safeTitle = classroom.name.replace(/\s+/g, "_");
      doc.save(`${safeTitle}_Lecture_Notes.pdf`);
      toast.success("PDF Study Notes downloaded successfully!");
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      toast.error("Could not export PDF: " + err.message);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Background Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10, 10, 15, 0.85)",
          backdropFilter: "blur(12px)",
        }}
      />

      {/* Main Centered Glassmorphic Modal Box */}
      <div
        className="glass-card"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "850px",
          height: "80vh",
          borderRadius: "24px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 50px rgba(160,124,254,0.12)",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(18, 19, 26, 0.85)"
        }}
      >
        {/* Header */}
        <div 
          style={{ 
            padding: "20px 32px", 
            borderBottom: "1px solid rgba(255,255,255,0.06)", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.2)"
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <BookOpen className="h-6 w-6 text-primary-container" />
              {classroom.name}
              <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#cfbcff", background: "rgba(160, 124, 254, 0.15)", border: "1px solid rgba(160, 124, 254, 0.2)", padding: "2px 8px", borderRadius: "6px" }}>
                Class Code: {classroom.roomCode}
              </span>
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#cbc3d5", marginTop: "4px", marginBottom: 0 }}>
              Educator: <span style={{ color: "#ffffff", fontWeight: 600 }}>{classroom.teacherName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)", border: "none", color: "#e3e1e9",
              width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div 
          style={{ 
            flex: 1, 
            padding: "28px 32px", 
            overflowY: "auto", 
            display: "flex", 
            flexDirection: "column",
            gap: "20px"
          }}
        >
          {/* Header Action Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#38bdf8", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles className="h-5 w-5 text-sky-400" />
              AI Generated Lecture Notes
            </h3>
            
            <div style={{ display: "flex", gap: "10px" }}>
              {notesText && (
                <>
                  <button
                    onClick={handleCopyToClipboard}
                    disabled={isGenerating || isDownloadingPdf}
                    title="Copy to clipboard"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#ffffff",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGenerating || isDownloadingPdf}
                    title="Download notes as PDF"
                    style={{
                      background: "rgba(148, 108, 254, 0.15)",
                      border: "1px solid rgba(148, 108, 254, 0.3)",
                      color: "#cfbcff",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(148, 108, 254, 0.25)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(148, 108, 254, 0.15)"}
                  >
                    <FileText className="h-4 w-4" />
                    {isDownloadingPdf ? "Creating PDF..." : "Download PDF"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notes Display Box */}
          <div 
            style={{ 
              flex: 1, 
              overflowY: "auto", 
              display: "flex", 
              flexDirection: "column",
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.04)",
              borderRadius: "16px",
              padding: "24px",
              minHeight: "250px"
            }}
          >
            {loadingTranscripts || loadingNotes ? (
              <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", color: "#cbc3d5" }}>
                <div style={{ width: "32px", height: "32px", border: "2.5px solid #38bdf8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "0.875rem" }}>Initializing class history records...</span>
              </div>
            ) : error ? (
              <div style={{ background: "rgba(248, 113, 113, 0.1)", color: "#f87171", padding: "16px", borderRadius: "12px", border: "1px solid rgba(248, 113, 113, 0.2)", fontSize: "0.9rem" }}>
                {error}
              </div>
            ) : notesText ? (
              <div style={{ color: "#e3e1e9", fontSize: "0.95rem", lineHeight: "1.65" }}>
                {renderNotesContent(notesText)}
                {isGenerating && (
                  <span 
                    style={{ 
                      display: "inline-block", 
                      width: "8px", 
                      height: "16px", 
                      background: "#38bdf8", 
                      marginLeft: "4px", 
                      animation: "blink 1s infinite" 
                    }} 
                  />
                )}
                <div ref={notesEndRef} />
              </div>
            ) : transcripts.length === 0 ? (
              // Alert when no transcripts are found
              <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
                <AlertCircle className="h-12 w-12 text-rose-400 mb-4" />
                <span style={{ fontSize: "1.0rem", color: "#ffffff", textAlign: "center", fontWeight: 700 }}>
                  No Transcription Data Available
                </span>
                <span style={{ fontSize: "0.8rem", color: "#cbc3d5", textAlign: "center", marginTop: "8px", maxWidth: "420px" }}>
                  This class has no voice transcript records. Notes cannot be generated. Please make sure the educator runs voice transcription during live sessions.
                </span>
              </div>
            ) : (
              // Ready to generate notes screen
              <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
                <Sparkles className="h-14 w-14 text-sky-400/80 mb-4 animate-pulse" />
                <span style={{ fontSize: "1.05rem", color: "#ffffff", textAlign: "center", fontWeight: 700 }}>
                  Lecture Data Ready for Analysis
                </span>
                <span style={{ fontSize: "0.825rem", color: "#cbc3d5", textAlign: "center", marginTop: "6px", maxWidth: "380px" }}>
                  We found **{transcripts.length} lines** of voice transcription records from this classroom session. Click the button below to generate premium study notes.
                </span>
              </div>
            )}
          </div>

          {/* Note generation control */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleGenerateNotes}
              disabled={isGenerating || transcripts.length === 0}
              style={{
                background: isGenerating 
                  ? "rgba(160, 124, 254, 0.3)" 
                  : transcripts.length === 0
                    ? "rgba(255,255,255,0.05)"
                    : "linear-gradient(90deg, #A07CFE 0%, #FE8495 50%, #FFD270 100%)",
                color: isGenerating || transcripts.length === 0 ? "rgba(255,255,255,0.3)" : "#090A0F",
                border: "none",
                borderRadius: "14px",
                padding: "14px 28px",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: isGenerating || transcripts.length === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: isGenerating || transcripts.length === 0 ? "none" : "0 4px 15px rgba(160, 124, 254, 0.25)"
              }}
              onMouseEnter={(e) => {
                if (!isGenerating && transcripts.length > 0) {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(160, 124, 254, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isGenerating && transcripts.length > 0) {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(160, 124, 254, 0.25)";
                }
              }}
            >
              <Sparkles className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating 
                ? "Analyzing Lecture Transcripts..." 
                : savedNotes 
                  ? "Regenerate Study Notes" 
                  : "Generate Study Notes"
              }
            </button>
          </div>

        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}
