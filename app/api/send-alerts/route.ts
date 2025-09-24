import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    await resend.emails.send({
      from: "alerts@yourdomain.com",   // use the same verified sender you already used in your other apps
      to: "yourname@gmail.com",        // your Gmail (or whichever inbox you want)
      subject: "Dashboard Alert",
      text: "This is a test alert from the Reel Addiction III dashboard.",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }
}
