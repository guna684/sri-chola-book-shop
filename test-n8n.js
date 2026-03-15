const axios = require('axios');
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

axios.post('https://gunaggx.app.n8n.cloud/webhook/ai-book', payload)
    .then(res => console.log("Response:", JSON.stringify(res.data, null, 2)))
    .catch(err => console.error("Error:", err.response ? err.response.data : err.message));
