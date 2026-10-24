import React, { useState } from 'react';
import { FileText, Copy, Check, X, Printer, Building2, Sparkles } from 'lucide-react';
import { Complaint } from '../types';

import { getOrganizationById } from '../data/organizations';

interface FormalLetterModalProps {
  complaint: Complaint;
  onClose: () => void;
  onSaveLetter?: (letterText: string) => void;
  language?: any;
}

export const FormalLetterModal: React.FC<FormalLetterModalProps> = ({
  complaint,
  onClose,
  onSaveLetter,
}) => {
  const initialLetter = complaint.letter || complaint.formalLetter || '';
  const [letterText, setLetterText] = useState<string>(initialLetter);
  const [isGenerating, setIsGenerating] = useState(!initialLetter);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const org = getOrganizationById(complaint.organizationId);

  React.useEffect(() => {
    if (!initialLetter) {
      generateLetter();
    }
  }, []);

  const generateLetter = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint,
          organizationName: org.name,
          organizationShortName: org.shortName,
          organizationEmail: org.email,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate letter');
      const data = await res.json();
      setLetterText(data.letter_text);
      if (onSaveLetter) onSaveLetter(data.letter_text);
    } catch (err: any) {
      setError(err.message || 'Failed to draft letter. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Official Municipal Letter - ${complaint.id}</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; font-size: 14pt; }
              pre { font-family: inherit; white-space: pre-wrap; word-wrap: break-word; }
            </style>
          </head>
          <body>
            <pre>${letterText}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Draft Formal Municipal Letter
                </h3>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  AI Official Draft
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Formatted dispatch to {complaint.aiAnalysis.department} (Peshawar Administration)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Letter Preview Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isGenerating ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-3 border-teal-600/30 border-t-teal-700 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-800">
                Gemini is composing official dispatch letter...
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Structuring reference codes, location coordinates, and legal compliance mandates
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-600 text-xs">
              <p className="mb-3">{error}</p>
              <button
                type="button"
                onClick={generateLetter}
                className="px-4 py-2 rounded-xl bg-teal-700 text-white font-bold"
              >
                Retry Generation
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-text shadow-inner">
              {letterText}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        {!isGenerating && !error && (
          <div className="pt-4 border-t border-slate-200 mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] text-slate-500">
              {copied ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Copied to clipboard!
                </span>
              ) : (
                'Ready to copy into email, WhatsApp, or official CMS'
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-98 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Letter'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
