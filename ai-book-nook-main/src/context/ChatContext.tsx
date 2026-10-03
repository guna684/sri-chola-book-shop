import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/axios';

export interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
    bookIds?: string[];
}

interface Order {
    _id: string;
    itemsPrice: number;
    shippingPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt: string;
    isDelivered: boolean;
    status: string;
    createdAt: string;
    orderItems: Array<{
        title: string;
        qty: number;
        image: string;
        price: number;
        product: string;
    }>;
}

interface ChatContextType {
    sessionId: string;
    messages: Message[];
    orderContext: Order[] | null;
    currentPage: string;
    isLoading: boolean;
    hasMoreHistory: boolean;
    sendMessage: (text: string) => Promise<void>;
    fetchHistory: () => Promise<void>;
    fetchOlderMessages: () => Promise<void>;
    clearChat: () => Promise<void>;
    injectOrderContext: (orders: Order[]) => void;
    updatePageContext: (page: string) => void;
    clearSession: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};

interface ChatProviderProps {
    children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
    const { user } = useAuth();
    const [sessionId, setSessionId] = useState<string>('');
    const getInitialMessages = (): Message[] => [{
        id: '1',
        sender: 'bot',
        text: "Hi! I'm your AI book assistant. Ask me for book recommendations, search for books, or inquire about our collection!",
        timestamp: new Date(),
    }];

    const getGuestMessages = (): Message[] => [{
        id: '1',
        sender: 'bot',
        text: 'Please login to use the AI assistant.',
        timestamp: new Date(),
    }];

    const [messages, setMessages] = useState<Message[]>(getInitialMessages());
    const [orderContext, setOrderContext] = useState<Order[] | null>(null);
    const [currentPage, setCurrentPage] = useState<string>('home');
    const [isLoading, setIsLoading] = useState(false);
    const [hasMoreHistory, setHasMoreHistory] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!user) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/api/chat/history', config);
            
            if (data && data.length > 0) {
                const formattedMessages: Message[] = [];
                data.forEach((item: any) => {
                    formattedMessages.push({
                        id: `u_${item._id}`,
                        sender: 'user',
                        text: item.message,
                        timestamp: new Date(item.timestamp)
                    });
                    formattedMessages.push({
                        id: `b_${item._id}`,
                        sender: 'bot',
                        text: item.response,
                        timestamp: new Date(item.timestamp)
                    });
                });
                
                setMessages(formattedMessages);
                setHasMoreHistory(data.length === 10);
            }
        } catch (error) {
            console.error('[ChatContext] Error fetching history:', error);
        }
    }, [user]);

    // Initial load and session ID initialization
    useEffect(() => {
        if (user) {
            const newSessionId = `chat_${user._id}`;
            setSessionId(newSessionId);
            setMessages(getInitialMessages());
            fetchHistory();
        } else {
            setMessages(getGuestMessages());
            setOrderContext(null);
            setCurrentPage('home');
            setSessionId(`chat_guest_${Date.now()}`);
        }
    }, [user, fetchHistory]);

    const fetchOlderMessages = async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            const currentMessagesCount = messages.filter(m => m.sender === 'user').length;
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get(`/api/chat/history/older?skip=${currentMessagesCount}`, config);
            
            if (data && data.length > 0) {
                const olderMessages: Message[] = [];
                data.forEach((item: any) => {
                    olderMessages.push({
                        id: `u_${item._id}`,
                        sender: 'user',
                        text: item.message,
                        timestamp: new Date(item.timestamp)
                    });
                    olderMessages.push({
                        id: `b_${item._id}`,
                        sender: 'bot',
                        text: item.response,
                        timestamp: new Date(item.timestamp)
                    });
                });
                
                setMessages(prev => [...olderMessages, ...prev]);
                setHasMoreHistory(data.length === 10);
            } else {
                setHasMoreHistory(false);
            }
        } catch (error) {
            console.error('[ChatContext] Error fetching older history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = async () => {
        if (!user) {
            clearSession();
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete('/api/chat/history', config);
            clearSession();
            setHasMoreHistory(false);
        } catch (error) {
            console.error('[ChatContext] Error clearing history:', error);
        }
    };

    // Send message with full context
    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        if (!user) {
            // Already showing the login prompt — don't add duplicates
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            // Build enhanced payload with session and context
            const payload = {
                chatId: sessionId,
                sessionId: sessionId,
                message: text,
                orderContext: orderContext,
                pageContext: currentPage,
                chatHistory: messages.slice(-5).map(m => ({ // Last 5 messages for context
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.text
                }))
            };

            console.log('Chat request:', text);

            const response = await api.post('/api/chat', payload, config);

            console.log('Chat response:', response.data);

            // Handle {success, text, bookIds} format (primary) with fallback to legacy formats
            let botText = "I received your message but couldn't parse the response.";
            let botBookIds: string[] | undefined;
            if (typeof response.data === 'string') {
                botText = response.data;
            } else if (response.data.success === false) {
                // Backend explicitly signalled failure
                botText = response.data.text || response.data.message || "I'm having trouble right now. Please try using the search bar!";
            } else {
                // success === true or legacy format
                if (response.data.text) {
                    botText = response.data.text;
                } else if (response.data.message) {
                    botText = response.data.message;
                } else if (response.data.output) {
                    botText = response.data.output;
                } else {
                    botText = JSON.stringify(response.data);
                }
                if (response.data.bookIds && Array.isArray(response.data.bookIds)) {
                    botBookIds = response.data.bookIds;
                }
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: botText,
                timestamp: new Date(),
                bookIds: botBookIds
            };
            setMessages((prev) => [...prev, botMsg]);

        } catch (error) {
            console.error('[ChatContext] Chat Error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: "Sorry, I'm having trouble connecting to the server right now.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    // Inject order context
    const injectOrderContext = (orders: Order[]) => {
        setOrderContext(orders);
        console.log('[ChatContext] Injected order context:', orders.length, 'orders');
    };

    // Update page context
    const updatePageContext = (page: string) => {
        setCurrentPage(page);
        console.log('[ChatContext] Updated page context:', page);
    };

    // Clear session
    const clearSession = () => {
        setMessages(user ? getInitialMessages() : getGuestMessages());
        setOrderContext(null);
        setCurrentPage('home');
        console.log('[ChatContext] Cleared session');
    };

    const value: ChatContextType = {
        sessionId,
        messages,
        orderContext,
        currentPage,
        isLoading,
        hasMoreHistory,
        sendMessage,
        fetchHistory,
        fetchOlderMessages,
        clearChat,
        injectOrderContext,
        updatePageContext,
        clearSession,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
