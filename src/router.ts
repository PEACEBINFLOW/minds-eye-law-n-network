import { LawNDecision } from "./lawNConfig";
import { MindEyePacket } from "./packet";

/**
 * A minimal interface for network adapters.
 * You can implement this with fetch, axios, WebSocket, gRPC, etc.
 */
export interface NetworkAdapter {
  /**
   * Send a single packet immediately.
   */
  sendPacket(packet: MindEyePacket): Promise<void>;

  /**
   * Optionally send multiple packets in a batch.
   */
  sendBatch?(packets: MindEyePacket[]): Promise<void>;

  /**
   * Optional hook for queueing. The actual persistence can live elsewhere.
   */
  queuePacket?(packet: MindEyePacket): Promise<void>;
}

/**
 * Simple adapter that just logs sends to the console.
 * Useful for development and examples.
 */
export class ConsoleNetworkAdapter implements NetworkAdapter {
  constructor(private endpoint: string) {}

  async sendPacket(packet: MindEyePacket): Promise<void> {
    // In a real adapter, you'd call fetch/axios/ws here.
    // For now, we just log what WOULD be sent.
    // eslint-disable-next-line no-console
    console.log("[LAW-N] sendPacket ->", this.endpoint, packet.id, packet);
  }

  async sendBatch(packets: MindEyePacket[]): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(
      "[LAW-N] sendBatch ->",
      this.endpoint,
      packets.map((p) => p.id)
    );
  }

  async queuePacket(packet: MindEyePacket): Promise<void> {
    // eslint-disable-next-line no-console
    console.log("[LAW-N] queuePacket ->", packet.id);
  }
}

/**
 * Helper to execute the LAW-N decision using a given adapter.
 *
 * - "send_now" -> sendPacket
 * - "batch"    -> sendBatch (or sendPacket as fallback)
 * - "queue"    -> queuePacket (or sendPacket as fallback)
 * - "drop"     -> does nothing
 */
export async function sendWithLawNDecision<T>(
  decision: LawNDecision,
  packet: MindEyePacket<T>,
  adapter: NetworkAdapter
): Promise<void> {
  switch (decision) {
    case "send_now":
      await adapter.sendPacket(packet);
      break;

    case "batch":
      if (adapter.sendBatch) {
        await adapter.sendBatch([packet]);
      } else {
        await adapter.sendPacket(packet);
      }
      break;

    case "queue":
      if (adapter.queuePacket) {
        await adapter.queuePacket(packet);
      } else {
        await adapter.sendPacket(packet);
      }
      break;

    case "drop":
      // silently drop
      // eslint-disable-next-line no-console
      console.log("[LAW-N] dropping packet ->", packet.id);
      break;
  }
}
