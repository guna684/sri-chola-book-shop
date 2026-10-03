import axios from 'axios';

axios.post('http://localhost:5000/api/chat', {
    chatId: "test1234",
    message: "What is your best selling book?"
})
    .then(res => console.log("Success:", res.data))
    .catch(err => console.error("Error:", err.response ? err.response.data : err.message));
