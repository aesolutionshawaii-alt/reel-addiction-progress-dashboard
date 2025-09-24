import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    await resend.emails.send({
      from: "alerts@yourdomain.com", // must be verified in Resend
      to: "youremail@example.com",   // replace with your email
      subject: "Test Alert",
      text: "This is a test alert from the Reel Addiction dashboard.",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
