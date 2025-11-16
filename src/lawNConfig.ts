import { MindEyePacket } from "./packet";

export interface NetworkState {
  latencyMs: number;      // measured or estimated latency
  bandwidthKbps: number;  // approximate available bandwidth
  isMetered: boolean;     // e.g. 4G/5G with data caps
}

export type LawNDecision = "send_now" | "queue" | "batch" | "drop";

/**
 * decideLawN is the core LAW-N policy function.
 *
 * Given a packet + the current network conditions, it returns a decision:
 * - "send_now" -> send immediately
 * - "queue"    -> store locally, send later when conditions improve
 * - "batch"    -> group with other packets
 * - "drop"     -> safe to discard (e.g. low-priority telemetry)
 *
 * This v0 is intentionally simple. You can evolve it later with:
 * - more nuanced thresholds
 * - adaptive behavior per user / device
 * - integration with LAW-T (time windows / blocks)
 */
export function decideLawN<T>(
  packet: MindEyePacket<T>,
  state: NetworkState
): LawNDecision {
  const { channel, priority, reliability } = packet.headers;

  // 1. Realtime channel always tries to send now.
  if (channel === "realtime") {
    if (state.bandwidthKbps < 64 && reliability === "best_effort") {
      // In extreme conditions, best-effort realtime can be dropped.
      return "drop";
    }
    return "send_now";
  }

  // 2. Bulk traffic on very low bandwidth should be queued or batched.
  if (channel === "bulk") {
    if (state.bandwidthKbps < 256) {
      // On weak network, bulk is non-urgent.
      return reliability === "must_deliver" ? "queue" : "drop";
    }
    // On decent bandwidth, batching is fine for bulk.
    return "batch";
  }

  // 3. Timeline traffic (events, logs, state) depends on metered status + priority.
  if (channel === "timeline") {
    if (state.isMetered && priority === "low") {
      // Save data on metered connections.
      return "batch";
    }

    if (state.bandwidthKbps < 128 && priority === "normal") {
      return reliability === "must_deliver" ? "queue" : "batch";
    }

    return "send_now";
  }

  // Default fallback
  return "send_now";
}
