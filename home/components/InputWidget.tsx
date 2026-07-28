
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import MediaUpload from '../../../components/base/MediaUpload';
import { aiAgentService, type MessageResponse } from '../../../services/aiAgentService';
import { analyzeImage } from '../../../services/imageAnalysisService';

interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
  imageUrl?: string;
  phase?: string;
}


export default function InputWidget() {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const inConversation = messages.length > 0;

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading]);

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

    // Must have text or an image
    if (!text && !imageFile) return;

    setLoading(true);
    setError(null);
    setDescription('');

    // If an image is attached, validate it's home-related before proceeding
    if (imageFile) {
      try {
        const result = await analyzeImage(imageFile);
        if (!result.isHomeRelated) {
          setError(
            "This image doesn't appear to be related to a home or property issue. Please upload a relevant photo.",
          );
          setFiles([]);
          setPreviewUrls([]);
          setLoading(false);
          return;
        }
      } catch (_err) {
        // Fail open: a transient pre-validation error shouldn't block a
        // legitimate photo. The AI agent runs its own home-topic check.
        console.warn('Image pre-validation failed; proceeding to agent.');
      }
    }

    // Build the user chat bubble
    const userMessage: ChatMessage = {
      role: 'user',
      text: text || 'Uploaded an image',
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      let currentSessionId = sessionId;

      // Create a session on the first message
      if (!currentSessionId) {
        const session = await aiAgentService.createSession();
        currentSessionId = session.session_id;
        setSessionId(currentSessionId);
      }

      // Send the message (with optional image)
      const response: MessageResponse = await aiAgentService.sendMessage(
        currentSessionId,
        text || 'Please analyze this image.',
        imageFile || undefined,
      );

      // Clear files after successful send
      setFiles([]);
      setPreviewUrls([]);

      setMessages(prev => [
        ...prev,
        { role: 'agent', text: response.content, phase: response.phase },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[InputWidget] AI agent error:', message);
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[#F9F9FB] rounded-2xl p-6 shadow-lg border-2 border-[#6B7C8F]/20">

        {/* Conversation history */}
        {inConversation && (
          <div ref={chatContainerRef} className="mb-4 max-h-96 overflow-y-auto space-y-3 rounded-lg bg-white border border-gray-200 p-4">
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

        {/* Text input */}
        {!inConversation && (
          <div className="mb-4">
            <label
              className="block text-sm font-semibold text-[#333645] mb-2"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Ask anything about your home
            </label>
          </div>
        )}

        <div className={inConversation ? '' : 'mb-4'}>
          <textarea
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

        {/* Submit / Send */}
        <button
          onClick={handleSend}
          disabled={loading || (!description.trim() && files.length === 0)}
          className="w-full mt-4 px-6 py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#0a1a2a] transition-all duration-300 font-semibold text-base shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {loading ? 'Analyzing...' : inConversation ? 'Send Reply' : 'Ask Emporva AI'}
        </button>
      </div>
    </div>
  );
}
