<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1PNn1tRCpm1dlNnNU4dml_hDWWRl6tSY2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## MT5 real‑time data bridge

This repo now supports fetching live bars & ticks from a MetaTrader 5 terminal
via a lightweight Python bridge. The frontend no longer uses the mock generator
and instead calls the HTTP/WS service at `localhost:8765`.

**Bridge setup**

1. Copy `mt5_bridge.py` (included in the repo root) to the machine running MT5.
2. Install dependencies and start the service:

   ```powershell
   python -m pip install MetaTrader5 aiohttp websockets
   python mt5_bridge.py
   ```

3. Verify with the browser or `curl`:
   `http://localhost:8765/ping` should return `pong`.

4. The frontend will automatically call `/historical` for bars and open a
   WebSocket to receive `{symbol,bid,ask,time,volume}` ticks.  By default the
   bridge listens on port **62100** (set `MT5_BRIDGE_URL` if you change it).
   Symbols are sent through `mt5Service.ts` and can be mapped using
   `toBrokerSymbol`/`fromBrokerSymbol` if needed.

The Python file can be edited as needed; only HTTP/WS endpoints (`/ping`,
`/historical`, `/`) and the JSON contract are consumed by the React app.
