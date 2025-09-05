// pages/api/login.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { username, password } = JSON.parse(req.body);
  console.log(process.env.ADMIN_USERNAME)
  console.log(typeof req.body)
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    // Set a simple cookie (can also use JWT or session)
    const cookie = serialize("auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ error: "Invalid credentials" });
}
