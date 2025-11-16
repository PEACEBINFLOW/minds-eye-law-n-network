# Mind's Eye LAW-N Network Layer

**LAW-N (Law of Network)** is the network data-movement layer for the Mind's Eye constellation.

It answers one core question:

> Given limited network, battery, and bandwidth, **what data should move, how, and when?**

This repo provides:

- A `MindEyePacket` type with LAW-N headers (channel, priority, reliability, source).
- A simple `decideLawN` policy engine to decide whether to `send_now`, `queue`, `batch`, or `drop`.
- A small routing helper to plug into HTTP/WebSocket/network clients.

The idea is to sit between:

- **Devices** (Android, web, drones, etc.)
- **Networks** (4G / 5G / WiFi / Starlink / LAN)
- **Mind's Eye Cloud Services** (events, hunting engine, dashboards)

…so that all data movement follows consistent, explicit rules instead of being random.

---

## 🧱 Core Concepts

### MindEyePacket

Every packet is:

- time-stamped
- tagged with LAW-N metadata
- carrying a payload (event, command, metric, etc.)

```ts
interface MindEyePacket<T = any> {
  id: string;
  createdAt: string;
  headers: {
    channel: "realtime" | "timeline" | "bulk";
    priority: "critical" | "high" | "normal" | "low";
    reliability: "must_deliver" | "best_effort";
    source: "android" | "web" | "server" | "drone";
    lawT?: string; // optional time label from LAW-T
    lawNVersion?: string;
  };
  payload: T;
}
