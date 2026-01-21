// server.js -- robust wrapper to run index.js with hourly restart + crash-restart/backoff
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const APP_FILE = "index.js";         // file to run
const CWD = path.join(__dirname);    // ensure runs from project root
const HOURLY_RESTART_MS = 60 * 60 * 1000; // 1 hour
const RESTART_DELAY_MS = 5000;       // base delay on crash
const MAX_BACKOFF_MS = 60 * 1000;    // max backoff between restarts

let bot = null;
let hourlyTimer = null;
let backoff = RESTART_DELAY_MS;

function spawnBot() {
  console.log(`[wrapper] Spawning node ${APP_FILE} (cwd=${CWD})`);
  bot = spawn(process.execPath, [APP_FILE], {
    cwd: CWD,
    stdio: "inherit", // inherit so logs appear in panel console
    env: process.env,
  });

  bot.once("error", (err) => {
    console.error("[wrapper] child process error:", err && err.stack ? err.stack : err);
  });

  bot.once("close", (code, signal) => {
    console.log(`[wrapper] child closed. code=${code} signal=${signal}`);
    // if code 0 and signal null — normal exit; we still restart after delay.
    scheduleRestart();
  });

  // reset backoff on successful spawn
  backoff = RESTART_DELAY_MS;
}

function scheduleRestart() {
  // avoid immediate tight loop — use backoff
  const delay = Math.min(backoff, MAX_BACKOFF_MS);
  console.log(`[wrapper] scheduling restart in ${delay}ms`);
  setTimeout(() => {
    // increment exponential backoff for next time if it fails again
    backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
    spawnBot();
  }, delay);
}

// Hourly restart (clear interval first)
function startHourlyRestart() {
  if (hourlyTimer) clearInterval(hourlyTimer);
  hourlyTimer = setInterval(() => {
    console.log("[wrapper] hourly restart triggered — restarting child");
    try {
      if (bot) {
        // forward graceful SIGTERM to child; if not closed in 8s, kill it
        bot.kill("SIGTERM");
        setTimeout(() => {
          try { if (bot && !bot.killed) bot.kill("SIGKILL"); } catch(e){}
        }, 8000);
      }
    } catch (e) {
      console.error("[wrapper] error sending hourly restart signal:", e);
    }
  }, HOURLY_RESTART_MS);
}

// Forward signals from wrapper (panel) to child so it can save state and exit cleanly
function forwardSignals() {
  ["SIGINT", "SIGTERM", "SIGHUP"].forEach((sig) => {
    process.on(sig, () => {
      console.log(`[wrapper] Received ${sig}, forwarding to child and exiting wrapper`);
      try {
        if (bot) bot.kill(sig);
      } catch (e) {}
      // give child a bit to shutdown
      setTimeout(() => process.exit(0), 3000);
    });
  });

  process.on("uncaughtException", (err) => {
    console.error("[wrapper] uncaughtException:", err && err.stack ? err.stack : err);
    try { if (bot) bot.kill("SIGTERM"); } catch(e){}
    setTimeout(() => process.exit(1), 2000);
  });

  process.on("unhandledRejection", (rej) => {
    console.error("[wrapper] unhandledRejection:", rej);
  });
}

// start everything
function start() {
  // basic checks
  try {
    if (!fs.existsSync(path.join(CWD, APP_FILE))) {
      console.error(`[wrapper] ERROR: ${APP_FILE} not found in ${CWD}`);
      process.exit(1);
    }
  } catch (e) {
    console.error("[wrapper] fs check error:", e);
  }

  forwardSignals();
  spawnBot();
  startHourlyRestart();
}

start();