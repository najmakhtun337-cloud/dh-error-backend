import express from "express";
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

const app = express();
app.use(express.json());

let sock;

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);
}
start();

app.post("/pair", async (req, res) => {
  try {
    const number = req.body.number?.replace(/[^0-9]/g, "");
    if (!number) return res.json({ ok: false, msg: "Number missing" });

    const code = await sock.requestPairingCode(number);
    res.json({ ok: true, code });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

app.get("/", (_, res) => res.send("DH ERROR Backend Running"));

app.listen(3000, () => console.log("Running on 3000"));
