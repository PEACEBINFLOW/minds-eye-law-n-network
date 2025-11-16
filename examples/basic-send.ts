import { createBasicPacket } from "../src/packet";
import { decideLawN, NetworkState } from "../src/lawNConfig";
import {
  ConsoleNetworkAdapter,
  sendWithLawNDecision,
} from "../src/router";

async function main() {
  // 1. Create a sample packet (timeline event from Android)
  const packet = createBasicPacket(
    {
      type: "user_event",
      message: "User opened Mind's Eye mobile",
    },
    {
      channel: "timeline",
      priority: "normal",
      reliability: "must_deliver",
      source: "android",
    }
  );

  // 2. Simulate a 4G network state
  const netState: NetworkState = {
    latencyMs: 150,
    bandwidthKbps: 700,
    isMetered: true,
  };

  // 3. Ask LAW-N what to do
  const decision = decideLawN(packet, netState);

  // 4. Use a network adapter to act on the decision
  const adapter = new ConsoleNetworkAdapter("https://api.example.com/events");

  await sendWithLawNDecision(decision, packet, adapter);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
