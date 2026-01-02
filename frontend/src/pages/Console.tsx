import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Trash2, Bot, User, Loader2, Terminal, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface LogEntry {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: Date;
}

export const Console = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add log entry
    setLogs((prev) => [
      ...prev,
      { id: Date.now().toString(), type: 'info', message: 'Processing request...', timestamp: new Date() },
    ]);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you want to: "${input}". I'm ready to help you with your biomedical analysis task. Please provide your data files or specify the parameters you'd like to use.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setLogs((prev) => [
        ...prev,
        { id: (Date.now() + 2).toString(), type: 'success', message: 'Task completed successfully', timestamp: new Date() },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  const handleClear = () => {
    setMessages([]);
    setLogs([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const exampleQueries = [
    t('console.examples.scRNA'),
    t('console.examples.gwas'),
    t('console.examples.crispr'),
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-foreground">{t('console.title')}</h1>
        <Button variant="outline" size="sm" onClick={handleClear} className="gap-2">
          <Trash2 className="h-4 w-4" />
          {t('console.clear')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="flex h-[600px] flex-col">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-primary" />
                AI Agent
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                  <Bot className="mb-4 h-16 w-16 text-muted" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {t('console.examples.title')}
                  </h3>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {exampleQueries.map((query, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setInput(query)}
                        className="text-sm"
                      >
                        {query}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                        }`}
                      >
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="mt-1 block text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Bot className="h-4 w-4 text-foreground" />
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                        <span className="text-sm text-foreground">{t('common.loading')}</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('console.placeholder')}
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="h-[60px] w-[60px]">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Logs & Results */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="logs" className="h-[600px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="logs" className="gap-2">
                <Terminal className="h-4 w-4" />
                {t('console.logs')}
              </TabsTrigger>
              <TabsTrigger value="results" className="gap-2">
                <FileText className="h-4 w-4" />
                {t('console.results')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="logs" className="h-[calc(100%-48px)]">
              <Card className="h-full">
                <ScrollArea className="h-full p-4">
                  {logs.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">
                      No logs yet
                    </p>
                  ) : (
                    <div className="space-y-2 font-mono text-sm">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-2">
                          <Badge
                            variant={
                              log.type === 'success'
                                ? 'default'
                                : log.type === 'error'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="shrink-0 text-xs"
                          >
                            {log.type}
                          </Badge>
                          <span className="text-muted-foreground">
                            [{log.timestamp.toLocaleTimeString()}]
                          </span>
                          <span className="text-foreground">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </TabsContent>
            <TabsContent value="results" className="h-[calc(100%-48px)]">
              <Card className="h-full">
                <ScrollArea className="h-full p-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Results will appear here after analysis
                  </p>
                </ScrollArea>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
