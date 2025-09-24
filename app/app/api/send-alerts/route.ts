import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    await resend.emails.send({
      from: "alerts@yourdomain.com", // Replace with your Resend verified sender
      to: "youremail@example.com",   // Replace with YOUR email
      subject: "Dashboard Alert",
      text: "This is a test alert from Reel Addiction III dashboard.",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }
}
