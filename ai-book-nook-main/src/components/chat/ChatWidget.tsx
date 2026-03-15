import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot, BookOpen, Trash2, History, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '@/context/ChatContext';
import { useNavigate } from 'react-router-dom';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Use global chat context
    const { messages, isLoading, sendMessage, hasMoreHistory, fetchOlderMessages, clearChat } = useChatContext();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const messageText = inputValue;
        setInputValue('');
        await sendMessage(messageText);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 bg-card border border-border shadow-2xl rounded-2xl w-[350px] sm:w-[380px] overflow-hidden flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-primary/10 p-4 flex justify-between items-center border-b border-border">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/20 rounded-full">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">AI Assistant</h3>
                                    <p className="text-xs text-muted-foreground">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" 
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to clear your chat history?')) {
                                            clearChat();
                                        }
                                    }}
                                    title="Clear Chat"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4 bg-secondary/5">
                            <div className="space-y-4">
                                {hasMoreHistory && (
                                    <div className="flex justify-center pb-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-[10px] h-7 gap-1.5 text-muted-foreground hover:text-primary"
                                            onClick={fetchOlderMessages}
                                            disabled={isLoading}
                                        >
                                            <History className="h-3 w-3" />
                                            Load Older Messages
                                        </Button>
                                    </div>
                                )}
                                
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <div className={`
                      h-8 w-8 rounded-full flex items-center justify-center shrink-0
                      ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                    `}>
                                            {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                        </div>
                                        <div
                                            className={`p-3 rounded-lg text-sm max-w-[80%] whitespace-pre-wrap break-words
                                              ${msg.sender === 'user'
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                    : 'bg-card border border-border rounded-tl-none shadow-sm'}`}
                                            style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                                        >
                                            {msg.text.split('\n').map((line, i) => (
                                                <span key={i}>
                                                    {line.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\)|https?:\/\/[^\s]+)/g).map((part, j) => {
                                                        if (part.startsWith('**') && part.endsWith('**')) {
                                                            return <strong key={j}>{part.slice(2, -2)}</strong>;
                                                        } else if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
                                                            const match = part.match(/\[(.*?)\]\((.*?)\)/);
                                                            if (match) {
                                                                return (
                                                                    <a
                                                                        key={j}
                                                                        href={match[2]}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-500 underline hover:text-blue-700 break-all"
                                                                    >
                                                                        {match[1]}
                                                                    </a>
                                                                );
                                                            }
                                                        } else if (/^https?:\/\//.test(part)) {
                                                            return (
                                                                <a
                                                                    key={j}
                                                                    href={part}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-500 underline hover:text-blue-700 break-all"
                                                                    style={{ wordBreak: 'break-all' }}
                                                                >
                                                                    {part}
                                                                </a>
                                                            );
                                                        }
                                                        return part;
                                                    })}
                                                    <br />
                                                </span>
                                            ))}
                                            {msg.bookIds && msg.bookIds.length > 0 && msg.sender === 'bot' && (
                                                <div className="mt-3 flex flex-col gap-3 border-t border-primary/10 pt-3">
                                                    {msg.text.includes('bestselling books') && (
                                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                                                            Featured Collection
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {msg.bookIds.map((id, idx) => (
                                                            <Button
                                                                key={idx}
                                                                size="sm"
                                                                variant="secondary"
                                                                className="w-full justify-start text-xs bg-primary/5 hover:bg-primary/15 text-primary border border-primary/10 h-10 font-medium group transition-all"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    navigate(`/book/${id}`);
                                                                    setIsOpen(false);
                                                                }}
                                                            >
                                                                <BookOpen className="mr-2 h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                                                                <span className="truncate">View Details</span>
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-card border-t border-border mt-auto">
                            <div className="flex gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask for book recommendations..."
                                    disabled={isLoading}
                                    className="bg-secondary/50"
                                    autoFocus
                                />
                                <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="shrink-0 bg-primary hover:bg-primary/90">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white p-0 flex items-center justify-center"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            </Button>
        </div>
    );
};
export default ChatWidget;
