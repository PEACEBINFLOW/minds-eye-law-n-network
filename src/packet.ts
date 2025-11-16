export type Channel = "realtime" | "timeline" | "bulk";

export type Priority = "critical" | "high" | "normal" | "low";

export type Reliability = "must_deliver" | "best_effort";

export type Source = "android" | "web" | "server" | "drone";

export interface LawNHeaders {
  channel: Channel;
  priority: Priority;
  reliability: Reliability;
  source: Source;
  /**
   * Optional reference to a LAW-T time label (e.g. block ID, segment ID)
   */
  lawT?: string;
  /**
   * LAW-N policy version string for future upgrades / migrations.
   */
  lawNVersion?: string;
}

/**
 * Generic Mind's Eye packet container.
 * T = payload shape (event, command, metric, etc.)
 */
export interface MindEyePacket<T = any> {
  id: string;
  createdAt: string;
  headers: LawNHeaders;
  payload: T;
}

/**
 * Very simple helper to create a basic packet with auto id + timestamp.
 * You can replace the id generation with nanoid/uuid if you want.
 */
export function createBasicPacket<T>(
  payload: T,
  headers: LawNHeaders
): MindEyePacket<T> {
  const id = `pkt_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  const createdAt = new Date().toISOString();

  return {
    id,
    createdAt,
    headers: {
      ...headers,
      lawNVersion: headers.lawNVersion ?? "v0",
    },
    payload,
  };
}
