import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.RESEND_FROM || "onboarding@resend.dev";

if (!process.env.RESEND_API_KEY) {
  console.warn("[mail] RESEND_API_KEY is missing — emails will fail");
}

export const sendFailureMail = async (emailTo, url) => {
  console.log("[mail] sending failure alert", { to: emailTo, url, from });

  const { data, error } = await resend.emails.send({
    from,
    to: [emailTo],
    subject: `Monitor alert: ${url} is down`,
    html: `<p>Your monitored URL <strong>${url}</strong> failed 5 checks in a row.</p>`,
  });

  if (error) {
    console.error("[mail] sendFailureMail failed", error);
    return { success: false, error };
  }

  console.log("[mail] sendFailureMail ok", { id: data?.id, to: emailTo });
  return { success: true, data };
};

export const sendUpAgainMail = async (emailTo, url) => {
  console.log("[mail] sending recovery alert", { to: emailTo, url, from });

  const { data, error } = await resend.emails.send({
    from,
    to: [emailTo],
    subject: `Monitor alert: ${url} is back up`,
    html: `<p>Your monitored URL <strong>${url}</strong> is responding again.</p>`,
  });

  if (error) {
    console.error("[mail] sendUpAgainMail failed", error);
    return { success: false, error };
  }

  console.log("[mail] sendUpAgainMail ok", { id: data?.id, to: emailTo });
  return { success: true, data };
};