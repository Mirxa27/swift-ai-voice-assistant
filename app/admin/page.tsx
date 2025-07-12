import AdminClient from "./client";

export const metadata = {
  title: "Admin - Newomen",
};

export default function AdminPage() {
  const groq = !!process.env.GROQ_API_KEY;
  const cartesia = !!process.env.CARTESIA_API_KEY;
  return <AdminClient groq={groq} cartesia={cartesia} />;
}
