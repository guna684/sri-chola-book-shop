import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
                console.error("API Error:", parsed.error.message, "Status:", parsed.error.code);
            } else {
                console.log("Success! Models found:", parsed.models?.length);
                import('fs').then(fs => fs.writeFileSync('models.json', JSON.stringify(parsed.models.map(m => m.name), null, 2)));
            }
        } catch (e) { console.log("Raw response:", data); }
    });
}).on('error', (err) => {
    console.log("Network Error:", err.message);
});
