import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQRCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/login");
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch QR code");
      setQrcode(data.qrcodeUrl);
      console.log(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCode();
  }, []);

  return (
    <>
      <h1>Binance Square Auto Poster</h1>
      <div className="card">
        {qrcode ? (
          <div>
            <img
              src={qrcode}
              alt="Binance login QR code"
              style={{ imageRendering: "crisp-edges" }}
            />
            <p>请使用币安 App 或手机相机扫码登录使用</p>
          </div>
        ) : isLoading ? (
          <p>正在加载币安登录二维码</p>
        ) : error ? (
          <div>
            <p>出错了：{error}</p>
          </div>
        ) : (
          <p>正在获取二维码……</p>
        )}
      </div>
    </>
  );
}

export default App;
