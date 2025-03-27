const os = require("os");
const path = require("path");

function getUserDataDir() {
  const platform = os.platform();
  const homeDir = os.homedir();

  switch (platform) {
    case "win32": // Windows
      return path.join(
        homeDir,
        "AppData",
        "Local",
        "Google",
        "Chrome",
        "User Data"
      );
    case "darwin": // macOS
      return path.join(
        homeDir,
        "Library",
        "Application Support",
        "Google",
        "Chrome"
      );
    case "linux": // Linux
      return path.join(homeDir, ".config", "google-chrome");
    default:
      throw new Error("Unsupported platform");
  }
}

module.exports = getUserDataDir;
