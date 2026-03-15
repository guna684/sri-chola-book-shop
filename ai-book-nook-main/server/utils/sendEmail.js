import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const sendEmail = async ({ to, subject, html }) => {
    // EmailJS Credentials
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    // Check if keys are missing
    if (!serviceId || !templateId || !publicKey || !privateKey) {
        const errorMsg = '[EMAIL] EmailJS keys missing. Set them in .env file.';
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    try {
        const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            accessToken: privateKey,
            template_params: {
                email: 'sricholabookgob@gmail.com', // Sender email (required by template)
                to_email: to,
                subject: subject,
                html_content: html,
            }
        });

        console.log('[EMAIL] Sent via EmailJS:', response.data);
        return { success: true, data: response.data };

    } catch (error) {
        const errorDetails = error.response?.data || error.message;
        console.error('[EMAIL] EmailJS Error:', errorDetails);
        throw new Error(`Email sending failed: ${typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)}`);
    }
};

export default sendEmail;
