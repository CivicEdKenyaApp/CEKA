import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

const ConstitutionChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('constitution-rag', {
        body: { query: userMsg }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I encountered an error accessing the constitutional archives. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[400px] max-w-[90vw]"
          >
            <Card className="border-none shadow-2xl glass-card overflow-hidden h-[500px] flex flex-col">
              <CardHeader className="bg-kenya-black text-white p-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-black tracking-widest uppercase flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-kenya-green" />
                  Lex Neuralis
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-black/20">
                {messages.length === 0 && (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ask anything about</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white">THE CONSTITUTION</p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      m.role === 'user' 
                        ? 'bg-kenya-green text-white rounded-tr-none' 
                        : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-tl-none'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 rounded-2xl rounded-tl-none">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-black/40">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ask Article 43..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                  />
                  <Button onClick={handleSend} size="icon" className="rounded-xl bg-kenya-black hover:bg-kenya-black/90 text-white shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-kenya-red rotate-90' : 'bg-kenya-black hover:scale-110'
        }`}
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageSquare className="h-6 w-6 text-white" />}
      </Button>
    </div>
  );
};

export default ConstitutionChat;
