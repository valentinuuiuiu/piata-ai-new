import { Resend } from 'resend';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY || 're_L1gYhLge_A5oXpL5itXzXskwYnLskvK6w');

async function testEmail() {
  console.log('Testing Resend...');
  const { data, error } = await resend.emails.send({
    from: 'Piata AI <onboarding@resend.dev>',
    to: 'ionutbaltag3@gmail.com',
    subject: 'Test Email from Antigravity',
    html: '<h1>Salut, VasukiNaga!</h1><p>Acesta este un email de test direct pentru a verifica dacă Resend funcționează.</p>'
  });

  if (error) {
    console.error('❌ Resend Error:', error);
  } else {
    console.log('✅ Email sent successfully:', data);
  }
}

testEmail();
