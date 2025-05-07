import React, { useState } from 'react';
import { supabase } from "../lib/supabase";


export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  const handleAuth = async () => {
    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        isLogin ? "Login successful!" : "Check your email to confirm!"
      );
      onAuthSuccess();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="text-2xl font-bold">{isLogin ? "Supabase Login" : "Sign Up"}</h2>
      <input
        className="border p-2 w-64 rounded"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-64 rounded"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleAuth}
        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        {isLogin ? "Login" : "Sign Up"}
      </button>
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="text-sm text-gray-600 underline cursor-pointer"
      >
        {isLogin ? "Need an account?" : "Already have one?"}
      </button>
      <p className="text-red-500">{message}</p>
    </div>
  );
}