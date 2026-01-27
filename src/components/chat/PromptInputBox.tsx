import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUp, 
  Paperclip, 
  X, 
  Mic, 
  Globe, 
  MessageSquare,
  StopCircle,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

interface PromptInputBoxProps {
  onSend?: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface VoiceRecorderProps {
  isRecording: boolean;
  onStopRecording: (duration: number) => void;
  visualizerBars?: number;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  onStopRecording,
  visualizerBars = 32,
}) => {
  const [time, setTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (time > 0) {
        onStopRecording(time);
      }
      setTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex flex-col items-center justify-center w-full py-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
        <span className="font-mono text-sm text-foreground/80">{formatTime(time)}</span>
      </div>
      <div className="w-full h-10 flex items-center justify-center gap-0.5 px-4">
        {[...Array(visualizerBars)].map((_, i) => (
          <motion.div
            key={i}
            className="w-0.5 rounded-full bg-primary/50"
            animate={{
              height: `${Math.max(15, Math.random() * 100)}%`,
            }}
            transition={{
              duration: 0.3 + Math.random() * 0.3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export const PromptInputBox = React.forwardRef<HTMLDivElement, PromptInputBoxProps>(
  ({ onSend, isLoading = false, placeholder, className, disabled = false }, ref) => {
    const { language } = useLanguage();
    const [input, setInput] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const defaultPlaceholder = translate('Type your message...', language);

    const isImageFile = (file: File) => file.type.startsWith('image/');

    const processFile = useCallback((file: File) => {
      if (!isImageFile(file)) {
        console.log('Only image files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        console.log('File too large (max 10MB)');
        return;
      }
      setFiles([file]);
      const reader = new FileReader();
      reader.onload = (e) => setFilePreviews({ [file.name]: e.target?.result as string });
      reader.readAsDataURL(file);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const droppedFiles = Array.from(e.dataTransfer.files);
      const imageFiles = droppedFiles.filter(isImageFile);
      if (imageFiles.length > 0) processFile(imageFiles[0]);
    }, [processFile]);

    const handleRemoveFile = (index: number) => {
      const fileToRemove = files[index];
      if (fileToRemove && filePreviews[fileToRemove.name]) {
        const newPreviews = { ...filePreviews };
        delete newPreviews[fileToRemove.name];
        setFilePreviews(newPreviews);
      }
      setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handlePaste = useCallback((e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            break;
          }
        }
      }
    }, [processFile]);

    useEffect(() => {
      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    // Auto-resize textarea
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }, [input]);

    const handleSubmit = () => {
      if ((input.trim() || files.length > 0) && !disabled && !isLoading) {
        let messagePrefix = '';
        if (showSearch) messagePrefix = '[Search: ';
        const formattedInput = messagePrefix ? `${messagePrefix}${input}]` : input;
        onSend?.(formattedInput, files);
        setInput('');
        setFiles([]);
        setFilePreviews({});
        setShowSearch(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    const handleStopRecording = (duration: number) => {
      setIsRecording(false);
      onSend?.(`[Voice message - ${duration} seconds]`, []);
    };

    const hasContent = input.trim() !== '' || files.length > 0;

    return (
      <TooltipProvider>
        <div
          ref={ref}
          className={cn(
            'relative rounded-3xl border border-border bg-card/95 backdrop-blur-sm p-3 shadow-lg transition-all duration-300',
            isRecording && 'border-destructive/50',
            isLoading && 'opacity-70',
            className
          )}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* File Previews */}
          <AnimatePresence>
            {files.length > 0 && !isRecording && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 pb-3"
              >
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type.startsWith('image/') && filePreviews[file.name] && (
                      <div
                        className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer border border-border hover:border-primary transition-colors"
                        onClick={() => setSelectedImage(filePreviews[file.name])}
                      >
                        <img
                          src={filePreviews[file.name]}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(index);
                          }}
                          className="absolute -top-1 -right-1 rounded-full bg-destructive p-1 shadow-md hover:bg-destructive/80 transition-colors"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Recorder */}
          <AnimatePresence>
            {isRecording && (
              <VoiceRecorder
                isRecording={isRecording}
                onStopRecording={handleStopRecording}
              />
            )}
          </AnimatePresence>

          {/* Text Input */}
          <AnimatePresence>
            {!isRecording && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={showSearch ? translate('Search the web...', language) : (placeholder || defaultPlaceholder)}
                  disabled={disabled || isLoading}
                  className="min-h-[44px] max-h-[200px] resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/70"
                  rows={1}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions Bar */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50 mt-2">
            <div className="flex items-center gap-1">
              {/* Attach File */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-primary/10"
                    onClick={() => uploadInputRef.current?.click()}
                    disabled={disabled || isLoading || isRecording}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{translate('Attach image', language)}</TooltipContent>
              </Tooltip>

              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processFile(file);
                  e.target.value = '';
                }}
              />

              {/* Web Search Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={showSearch ? 'default' : 'ghost'}
                    size="icon"
                    className={cn(
                      'h-9 w-9 rounded-full',
                      showSearch ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'
                    )}
                    onClick={() => setShowSearch(!showSearch)}
                    disabled={disabled || isLoading || isRecording}
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{translate('Web search', language)}</TooltipContent>
              </Tooltip>

              {/* Voice Recording Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isRecording ? 'destructive' : 'ghost'}
                    size="icon"
                    className={cn(
                      'h-9 w-9 rounded-full',
                      isRecording ? '' : 'hover:bg-primary/10'
                    )}
                    onClick={() => setIsRecording(!isRecording)}
                    disabled={disabled || isLoading}
                  >
                    {isRecording ? (
                      <StopCircle className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {isRecording ? translate('Stop recording', language) : translate('Voice message', language)}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Send Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  className={cn(
                    'h-10 w-10 rounded-full transition-all duration-200',
                    hasContent && !isLoading && !isRecording
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                  onClick={handleSubmit}
                  disabled={!hasContent || isLoading || disabled || isRecording}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{translate('Send message', language)}</TooltipContent>
            </Tooltip>
          </div>

          {/* Image Preview Dialog */}
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-[90vw] md:max-w-[800px] p-0 border-none bg-transparent">
              <DialogTitle className="sr-only">{translate('Image Preview', language)}</DialogTitle>
              {selectedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative bg-card rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img
                    src={selectedImage}
                    alt="Full preview"
                    className="w-full max-h-[80vh] object-contain rounded-2xl"
                  />
                </motion.div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    );
  }
);

PromptInputBox.displayName = 'PromptInputBox';

export default PromptInputBox;
