import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
        console.log("About to send:", {
      from: "onboarding@resend.dev",
      to: "aesolutionshawaii@gmail.com",
    });
await resend.emails.send({
      from: "onboarding@resend.dev", // or your verified sender in Resend
      to: "aesolutionshawaii@gmail.com",
      subject: "Website Project Checklist Updated",
      html: `
        <p>Aloha,</p>
        <p>The internal website overhaul checklist has changed (tab: <b>Progress</b>).</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }
}
