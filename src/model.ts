import {
  record,
  str,
  num,
  text,
  requiredNumber,
  compact,
  Feed,
  type View,
} from "./lib.ts";

export class AppModel extends Feed {
  receive(value: unknown, now: number): void {
    const data = record(value);
    if (typeof data.live !== "boolean") throw new Error("Missing live status");
    const viewers =
      data.viewers === undefined ? 0 : requiredNumber(data.viewers);
    if (viewers < 0 || !Number.isSafeInteger(viewers))
      throw new Error("Invalid viewer count");
    this.commit(
      [{ live: data.live, title: text(data.title), viewers }],
      now,
      data.updated_at === undefined ? now : data.updated_at,
    );
  }
  view(now: number): View {
    if (!this.items.length) return this.empty("Live Badge", now);
    const v = this.items[0];
    const stale =
      now - this.lastReceived > num(this.settings, "refresh_s", 30) * 3000;
    return this.feedView(
      "Live Badge",
      this.error || stale ? "UNKNOWN" : v.live ? "LIVE" : "OFFLINE",
      [str(v, "title"), compact(num(v, "viewers")) + " viewers"],
      now,
      v.live ? "#FF4455FF" : "#666666FF",
    );
  }
}
