import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [twitterName, setTwitterName] = useState<string | null>(null);

  const [qrcode, setQrcode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  const selectTwitter = async () => {
    const inputElement = document.getElementById("twitter") as HTMLInputElement;
    const username = inputElement.value.trim().replace(/^@/, "");

    if (!/^[a-zA-Z0-9_]{1,49}$/.test(username)) {
      alert("用户名只包含字母、数字和下划线");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/twitter?username=${encodeURIComponent(
          username
        )}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to find twitter address");
      }

      setAvatar(data.avatar);
      setTwitterName(data.name);
    } catch (error) {
      console.error(
        error instanceof Error
          ? error.message
          : "Unknown error in selectTwitter"
      );
    }
  };

  const fetchQRCode = async () => {
    setIsLoading(true);
    setQrError(null);
    try {
      const response = await fetch("http://localhost:3000/api/login");
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch QR code");
      setQrcode(data.qrcodeUrl);
      console.log(data);
    } catch (error) {
      setQrError(
        error instanceof Error
          ? error.message +
              ", please check if backend started and refresh this page."
          : "Unknown error in fetchQRCode"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCode();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <h1>Binance Square Auto Poster</h1>
      <p className="p-4">请务必注意顺序，先确认推特地址再扫码。</p>
      <div className="p-4 flex flex-col">
        <label className="text-lg pb-2" htmlFor="twitter">
          <span>Step 1. 请输入您的推特用户名： </span>
        </label>
        <div className="pb-4">
          <input
            type="text"
            placeholder="@mirrorzk"
            className="w-80 rounded-md px-4 py-1 border-2"
            id="twitter"
            name="twitter"
          />
          <button
            type="button"
            className="rounded-md mx-2 px-4 py-1 text-lg"
            onClick={selectTwitter}
          >
            确认
          </button>
        </div>

        {avatar ? (
          <div className="flex flex-row items-center justify-around px-12">
            <img className="w-32" src={avatar} alt="Twitter avatar" />
            <span className="text-2xl">{twitterName}</span>
          </div>
        ) : (
          <div></div>
        )}
      </div>

      <div className="pt-12 pb-4 flex flex-col items-center justify-center">
        <div>
          <p className="pb-2 text-lg">
            Step 2. 请使用币安 App 或手机相机扫码登录使用
          </p>
        </div>
        {qrcode ? (
          <div>
            <img src={qrcode} alt="Binance login QR code" />
          </div>
        ) : isLoading ? (
          <p>正在加载币安登录二维码</p>
        ) : qrError ? (
          <div>
            <p>出错了：{qrError}</p>
          </div>
        ) : (
          <p>正在获取二维码……</p>
        )}
      </div>
    </div>
  );
}

export default App;
