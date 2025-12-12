"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loading } from "@/components/ui/loading";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate input
    if (!username || !password) {
      setError("Kullanıcı adı ve parola boş olamaz");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      console.log('Login response:', { status: response.status, username });
      
      if (response.ok) {
        const data = await response.json();
        // Store authentication info
        localStorage.setItem("adminAuthenticated", "true");
        localStorage.setItem("adminUser", data.user || username);
        router.push("/admin/panel");
      } else {
        const data = await response.json();
        setError(data.message || "Giriş başarısız");
      }
    } catch (_err) {
      setError("Giriş yapılırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="flex justify-center mb-2">
              <Image
                src="/images/logo_black.png"
                alt="Ceyhun Gayrimenkul"
                width={200}
                height={60}
                className="h-14 w-auto"
                priority
              />
            </div>
            <CardTitle className="text-3xl font-bold">Admin Paneli</CardTitle>
            <CardDescription className="text-base">Hesabınıza giriş yapınız</CardDescription>
          </CardHeader>
          
          <CardContent className="pb-6">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-base font-medium">Kullanıcı Adı</Label>
                <select
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  disabled={isLoading}
                >
                  <option value="">Kullanıcı seç...</option>
                  <option value="damla">Damla</option>
                  <option value="ceyhundan">Ceyhundan</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">Parola</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Parolanız"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="focus:ring-primary px-4 py-3 text-base"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-base font-medium py-3 mt-6"
                disabled={isLoading}
              >
                {isLoading ? <Loading /> : "Giriş Yap"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 