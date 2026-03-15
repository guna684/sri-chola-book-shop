import axios from 'axios';
const payload = {
    chatId: 'chat_unknown',
    sessionId: 'chat_unknown',
    message: "top 1 bestsellers book",
    bookInventory: "- \"The Great Gatsby\" by F. Scott Fitzgerald | ₹200 | Fiction | URL: https://ai-book-woad.vercel.app/book/1",
    websiteUrl: "https://ai-book-woad.vercel.app",
    userOrders: null,
    currentPage: "unknown",
    chatHistory: [],
    systemInstructions: {
        storeName: "Sri Chola Book Shop",
        urlFormat: "https://ai-book-woad.vercel.app/book/{bookId}",
        rules: ["ONLY recommend books from the inventory list provided", "Format recommendations clearly with title, price, and URL"]
    }
};

axios.post('https://gunaggx46.app.n8n.cloud/webhook/ai-book', payload)
    .then(res => {
        console.log("Status:", res.status);
        console.log("Headers:", res.headers);
        console.log("Data type:", typeof res.data);
        console.log("Raw Data:", res.data);
    })
    .catch(err => console.error("Error:", err.response ? err.response.data : err.message));
