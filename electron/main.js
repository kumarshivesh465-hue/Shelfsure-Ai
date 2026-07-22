const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let mainWindow;
let pythonProcess;

function startPythonBackend() {
  const backendPath = path.join(__dirname, "..", "backend");
  const pythonExecutable = path.join(backendPath, "venv", "Scripts", "python.exe");

  console.log("[Electron] Starting Python backend...");

  pythonProcess = spawn(
    pythonExecutable,
    ["main.py"],
    {
      cwd: backendPath,
      stdio: "pipe",
    }
  );

  pythonProcess.stdout.on("data", (data) => {
    console.log(`[Python] ${data.toString().trim()}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`[Python Error] ${data.toString().trim()}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`[Python] Process exited with code ${code}`);
  });
}

function waitForBackend(url, retries, callback) {
  const http = require("http");
  http.get(url, (res) => {
    if (res.statusCode === 200) {
      callback();
    } else {
      retry();
    }
  }).on("error", () => {
    retry();
  });

  function retry() {
    if (retries > 0) {
      console.log(`[Electron] Waiting for backend... (${retries} retries left)`);
      setTimeout(() => waitForBackend(url, retries - 1, callback), 1000);
    } else {
      console.error("[Electron] Backend failed to start. Loading anyway...");
      callback();
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "ShelfSure AI",
    show: false,
  });

  // Development: load Vite dev server
  // Production: load built React files directly
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.log("[Electron] Development mode — loading Vite dev server");
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    console.log("[Electron] Production mode — loading built files");
    mainWindow.loadFile(
      path.join(__dirname, "..", "frontend", "dist", "index.html")
    );
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startPythonBackend();
  waitForBackend("http://127.0.0.1:8000/api/health", 30, () => {
    createWindow();
  });
});

app.on("window-all-closed", () => {
  if (pythonProcess) {
    pythonProcess.kill();
    console.log("[Electron] Python backend killed.");
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});