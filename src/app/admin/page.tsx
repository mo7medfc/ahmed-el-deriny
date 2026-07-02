"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        setError("بيانات الدخول غير صحيحة / Invalid credentials");
      }
    } catch {
      setError("حدث خطأ / Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-glow bg-dark-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <Image src="/logo/logo.png" alt="Logo" width={80} height={80} className="mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
          <p className="text-dark-400 text-sm mt-1">Admin Panel — مطابع أحمد الدريني</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            dir="ltr"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : "تسجيل الدخول / Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
