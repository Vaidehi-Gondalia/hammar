import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const from = process.env.EMAIL_FROM;

  if (!from) {
    throw new Error('EMAIL_FROM is not defined');
  }

  const { data, error } = await resend.emails.send({
    from,
    to: [email],
    subject: 'Reset your HAMMR password',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset your HAMMR password</h2>

        <p>
          We received a request to reset your HAMMR account password.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background-color: #000080;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This link will expire in 15 minutes.
        </p>

        <p>
          If you did not request a password reset, you can safely ignore this
          email.
        </p>

        <p>
          — HAMMR Team
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
