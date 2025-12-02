const { Resend } = require('resend');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, body, html }) {
    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not set in .env.local');
        process.exit(1);
    }

    try {
        const emailOptions = {
            from: 'onboarding@resend.dev', // Default sender. This should probably be configurable.
            to: to,
            subject: subject,
        };

        if (html) {
            emailOptions.html = body;
        } else {
            emailOptions.text = body;
        }

        const { data, error } = await resend.emails.send(emailOptions);

        if (error) {
            console.error('Error sending email:', error);
            process.exit(1);
        }

        console.log('Email sent successfully:', data);
        process.exit(0);

    } catch (error) {
        console.error('An unexpected error occurred:', error);
        process.exit(1);
    }
}

// Parse command-line arguments
const args = process.argv.slice(2);
const params = {};
args.forEach(arg => {
    const [key, value] = arg.split('=');
    params[key] = value;
});

sendEmail({
    to: params.to,
    subject: params.subject,
    body: params.body,
    html: params.html === 'true'
});
