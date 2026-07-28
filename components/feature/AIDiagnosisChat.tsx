
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import MediaUpload from '../base/MediaUpload';
import CreditGateModal from './CreditGateModal';
import { aiAgentService, type MessageResponse } from '../../services/aiAgentService';
import { analyzeImage } from '../../services/imageAnalysisService';
import { useHomeownerAICredits } from '../../hooks/useHomeownerAICredits';

interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
  imageUrl?: string;
  phase?: string;
}

interface AIDiagnosisChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIDiagnosisChat({ isOpen, onClose }: AIDiagnosisChatProps) {
  const navigate = useNavigate();
  const { remaining, isPremium, isLoading: creditsLoading, consume, refresh: refreshCredits } = useHomeownerAICredits();

  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const inConversation = messages.length > 0;
  const outOfCredits = !isPremium && !creditsLoading && remaining <= 0;

  // Auto-scroll chat
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset state when modal closes; refresh credit balance when it opens
  useEffect(() => {
    if (!isOpen) {
      setDescription('');
      setFiles([]);
      setPreviewUrls([]);
      setError(null);
      setSessionId(null);
      setMessages([]);
      setLoading(false);
      setShowUpgradeModal(false);
    } else {
      refreshCredits();
    }
  }, [isOpen, refreshCredits]);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const text = description.trim();
    const imageFile = files[0] || null;

    if (!text && !imageFile) return;

    // Require a text description when photos are attached for better AI context
    if (imageFile && !text) {
      setError('Please describe the issue along with your photo so the AI can provide a more accurate diagnosis.');
      return;
    }

    // Credit gate (Core homeowners only). Premium bypasses entirely.
    if (!isPremium && remaining <= 0) {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setDescription('');

    // Validate image if attached
    if (imageFile) {
      try {
        const result = await analyzeImage(imageFile);
        if (!result.isHomeRelated) {
          setError("This image doesn't appear to be related to a home or property issue. Please upload a relevant photo.");
          setFiles([]);
          setPreviewUrls([]);
          setLoading(false);
          return;
        }
      } catch {
        // Fail open: a transient pre-validation error shouldn't block a
        // legitimate photo. The AI agent runs its own home-topic check.
        console.warn('Image pre-validation failed; proceeding to agent.');
      }
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      text: text || 'Uploaded an image',
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      let currentSessionId = sessionId;

      if (!currentSessionId) {
        const session = await aiAgentService.createSession();
        currentSessionId = session.session_id;
        setSessionId(currentSessionId);
      }

      const response: MessageResponse = await aiAgentService.sendMessage(
        currentSessionId,
        text || 'Please analyze this image.',
        imageFile || undefined,
      );

      setFiles([]);
      setPreviewUrls([]);

      setMessages(prev => [
        ...prev,
        { role: 'agent', text: response.content, phase: response.phase },
      ]);

      // Decrement only after a successful agent response so failed calls
      // (network, rate-limits, image rejected upstream) don't burn a credit.
      const result = await consume();
      if (!result.ok) {
        // Race: another tab exhausted the balance between our pre-check and now.
        setShowUpgradeModal(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[AIDiagnosisChat] AI agent error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-100 px-4 sm:px-6 py-4 rounded-t-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#D4B483]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-sparkling-line text-[#D4B483] text-lg sm:text-xl"></i>
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-[#0B1F33] truncate">AI Issue Diagnosis</h3>
              <p className="text-[10px] sm:text-xs text-[#6B7C8F]">Powered by Emporva AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!creditsLoading && (
              isPremium ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#D4B483]/10 text-[#0B1F33] border border-[#D4B483]/30">
                  <i className="ri-infinity-line"></i>
                  Unlimited
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                    remaining <= 0
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : remaining === 1
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-[#F0EDE8] text-[#0B1F33] border-[#D4B483]/30'
                  }`}
                  title="AI Diagnostic credits remaining this month"
                >
                  <i className="ri-sparkling-2-line"></i>
                  {remaining} {remaining === 1 ? 'credit' : 'credits'} left
                </span>
              )
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-[#6B7C8F] text-xl"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          {/* Chat history */}
          {inConversation && (
            <div ref={chatContainerRef} className="max-h-96 overflow-y-auto space-y-3 rounded-lg bg-white border border-gray-200 p-4 mb-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'user' ? (
                    <div
                      className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md bg-[#0B1F33] text-white text-sm leading-relaxed whitespace-pre-wrap text-left"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Uploaded"
                          className="max-w-full max-h-40 rounded-lg mb-2"
                        />
                      )}
                      {msg.text}
                    </div>
                  ) : (
                    <div
                      className="agent-message max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md bg-[#F0EDE8] text-[#333645] text-sm leading-relaxed text-left prose prose-sm"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-md bg-[#F0EDE8] text-[#6B7C8F] text-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Label (before conversation) */}
          {!inConversation && (
            <div className="mb-4">
              <label
                className="block text-sm font-semibold text-[#333645] mb-2 text-center"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Describe Your Issue *
              </label>
            </div>
          )}

          {/* Textarea */}
          <div className={inConversation ? '' : 'mb-4'}>
            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                inConversation
                  ? 'Type your reply...'
                  : 'Example: My kitchen faucet is leaking and there\'s water pooling under the sink...'
              }
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#D4B483] focus:outline-none resize-none text-sm transition-colors"
              rows={inConversation ? 2 : 3}
              style={{ fontFamily: 'Inter, sans-serif' }}
              maxLength={500}
            />
            {!inConversation && (
              <div className="text-right text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </div>
            )}
          </div>

          {/* File upload */}
          <MediaUpload
            onFilesSelected={handleFilesSelected}
            existingFiles={files}
            existingUrls={previewUrls}
            onRemove={handleRemove}
            maxFiles={1}
            accept="image"
            showPreviews={true}
          />

          {/* Error */}
          {error && (
            <p className="mt-3 text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              {error}
            </p>
          )}

          {/* Out-of-credits banner (Core only) */}
          {outOfCredits && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <i className="ri-information-line text-red-600 text-lg flex-shrink-0 mt-0.5"></i>
              <p className="text-sm text-red-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                You've used all 3 AI Diagnostic credits for this month. Upgrade to Premium for unlimited analyses.
              </p>
            </div>
          )}

          {/* Submit / Upgrade button */}
          {outOfCredits ? (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full mt-4 px-6 py-3 bg-[#D4B483] text-[#0B1F33] rounded-lg hover:bg-[#c4a473] transition-all duration-300 font-semibold text-base shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Upgrade to Premium
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={loading || !description.trim()}
              className="w-full mt-4 px-6 py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#0a1a2a] transition-all duration-300 font-semibold text-base shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {loading ? 'Analyzing...' : inConversation ? 'Send Reply' : 'Get AI Analysis'}
            </button>
          )}

        </div>
      </div>

      <CreditGateModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          setShowUpgradeModal(false);
          onClose();
          navigate('/homeowner-plans');
        }}
      />
    </div>
  );
}
