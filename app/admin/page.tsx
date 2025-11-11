"use client";
import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setMessage("");
    } else {
      setMessage("Incorrect password");
    }
  };

  const handleAction = async (action: "clearBuckets" | "clearTables") => {
    try {
      const adminSecret = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";
      const res = await fetch(`/api/admin/${action}`, {
        method: "POST",
        headers: {
          "x-admin-secret": adminSecret
        }
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Error calling API");
    }
  };
  

  if (!isAuthenticated) {
    return (
      <div style={{ background: "#111", color: "#fff", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <h1>Admin Login</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" style={{ padding: 10, marginBottom: 10 }} />
        <button onClick={handleLogin} style={{ padding: 10 }}>Login</button>
        {message && <p>{message}</p>}
      </div>
    );
  }

  return (
    <div style={{ background: "#111", color: "#fff", minHeight: "100vh", padding: 20 }}>
      <h1>Admin Panel</h1>
      <button onClick={() => handleAction("clearBuckets")} style={{ marginRight: 10, padding: 10 }}>Clear Buckets</button>
      <button onClick={() => handleAction("clearTables")} style={{ padding: 10 }}>Clear Tables</button>
      {message && <p>{message}</p>}
    </div>
  );
}
