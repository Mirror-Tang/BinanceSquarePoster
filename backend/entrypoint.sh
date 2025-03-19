import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function TwitterBinanceSync() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncLogs, setSyncLogs] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [errorLog, setErrorLog] = useState([]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/user");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
    fetchSyncLogs();
    fetchErrorLogs();
  }, []);

  async function fetchSyncLogs() {
    try {
      const response = await fetch("/api/sync-logs");
      const data = await response.json();
      setSyncLogs(data);
    } catch (error) {
      console.error("Error fetching sync logs", error);
    }
  }

  async function fetchErrorLogs() {
    try {
      const response = await fetch("/api/error-logs");
      const data = await response.json();
      setErrorLog(data);
    } catch (error) {
      console.error("Error fetching error logs", error);
    }
  }

  async function handleManualSync() {
    setSyncing(true);
    try {
      const response = await fetch("/api/manual-sync", { method: "POST" });
      const result = await response.json();
      console.log("Manual sync result:", result);
      fetchSyncLogs();
      fetchErrorLogs();
    } catch (error) {
      console.error("Error syncing manually", error);
    } finally {
      setSyncing(false);
    }
  }

  async function handleRetrySync() {
    setRetrying(true);
    try {
      const response = await fetch("/api/retry_binance_sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user?.username })
      });
      const result = await response.json();
      console.log("Retry sync result:", result);
      fetchSyncLogs();
      fetchErrorLogs();
    } catch (error) {
      console.error("Error retrying sync", error);
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md text-center p-6">
        <CardContent>
          {loading ? (
            <Loader2 className="animate-spin mx-auto" size={24} />
          ) : user ? (
            <div>
              <h2 className="text-xl font-bold">欢迎, {user.username}!</h2>
              <p className="mt-2 text-gray-600">您的推文同步正在进行</p>
              <Button className="mt-4" onClick={handleManualSync} disabled={syncing}>
                {syncing ? "同步中..." : "手动同步"}
              </Button>
              <Button className="mt-4 ml-2" onClick={handleRetrySync} disabled={retrying}>
                {retrying ? "重试中..." : "重试 Binance 同步"}
              </Button>
              <div className="mt-4 text-left">
                <h3 className="text-lg font-bold">同步日志</h3>
                <ul className="mt-2 text-sm text-gray-600">
                  {syncLogs.length === 0 ? (
                    <p>暂无同步记录</p>
                  ) : (
                    syncLogs.map((log, index) => (
                      <li key={index} className="mt-1">{log}</li>
                    ))
                  )}
                </ul>
              </div>
              <div className="mt-4 text-left">
                <h3 className="text-lg font-bold text-red-600">错误日志</h3>
                <ul className="mt-2 text-sm text-gray-600">
                  {errorLog.length === 0 ? (
                    <p>暂无错误记录</p>
                  ) : (
                    errorLog.map((log, index) => (
                      <li key={index} className="mt-1 text-red-500">{log}</li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold">同步 Twitter 到 Binance Square</h2>
              <p className="mt-2 text-gray-600">点击下方按钮开始</p>
              <Button className="mt-4" onClick={() => (window.location.href = "/api/login")}>登录 Twitter</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
