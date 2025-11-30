// server.js
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "indexnow-relay" });
});

// Relay endpoint: forwards the IndexNow payload to api.indexnow.org
app.post("/indexnow", async (req, res) => {
  const payload = req.body || {};

  if (!payload.host || !payload.key || !Array.isArray(payload.urlList)) {
    return res.status(400).json({ error: "Invalid IndexNow payload" });
  }

  try {
    const r = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const text = await r.text().catch(() => "");

    console.log("IndexNow relay result", {
      status: r.status,
      body: text.slice(0, 200),
    });

    res.status(r.status).json({
      relayed: true,
      upstreamStatus: r.status,
      upstreamBody: text,
    });
  } catch (e) {
    console.error("IndexNow relay error", e);
    res.status(502).json({ error: "indexnow_relay_failed", detail: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`IndexNow relay listening on port ${PORT}`);
});
