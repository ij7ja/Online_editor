import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const commands = [
  {
    args: ["server.js"],
    command: process.execPath,
    name: "api",
  },
  {
    args: isWindows
      ? ["/d", "/s", "/c", "npm.cmd", "run", "dev", "--", "--host", "127.0.0.1"]
      : ["run", "dev", "--", "--host", "127.0.0.1"],
    command: isWindows ? process.env.ComSpec || "cmd.exe" : "npm",
    name: "vite",
  },
];

const children = [];

for (const { args, command, name } of commands) {
  const child = spawn(command, args, { stdio: ["inherit", "pipe", "pipe"] });

  child.stdout.on("data", (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(`[${name}] ${data}`);
  });

  child.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${name}] exited with code ${code}`);
      stopAll();
      process.exit(code);
    }
  });

  children.push(child);
}

function stopAll() {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
}

process.on("SIGINT", () => {
  stopAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopAll();
  process.exit(0);
});
