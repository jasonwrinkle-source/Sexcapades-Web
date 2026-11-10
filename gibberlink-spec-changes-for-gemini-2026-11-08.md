# GibberLink spec — changes for Gemini (watch side)

Please build the watch side to these rulings, not the original spec v1.0. The phone side (Sexcapades PWA) is building to the same.

## 1. No provisioned UID — use the profile KEY
The identifier is the profile **key** (e.g. `adam`, `eve`) — the short, human-readable key from the Sexcapades profile. The watch uses this key in all its chirps. There is no arbitrary UID assigned by the phone. The key is stable (it does not change even if the display name changes) and short enough for GibberLink.

## 2. Display name = the key (for now)
For now, the key doubles as the display name shown on the watch. No separate display-name field.

## 3. Setup message — key + timer
The phone sends the watch its profile key and an autonomous reminder interval. Format:
```
CFG:<key>:<timer_sec>
```
- `CFG:adam:0` — key `adam`, no autonomous reminders (purely reactive, only responds to the phone's check-ins).
- `CFG:adam:300` — key `adam`, 5-minute autonomous reminder interval.
- The watch stores the key and timer in persistent storage (SharedPreferences). A new CFG overrides the stored config.
- On receipt, the watch replies `ACK:<key>:CFG` (e.g. `ACK:adam:CFG`) so the phone knows the setup landed.

## 4. Check-in — match on the profile key
The phone pings a specific watch (or all watches) with:
```
CHK:<target_key>:<type>
```
- `CHK:adam:P` — watch `adam` vibrates once (pulse) + shows heart.
- `CHK:adam:T` — watch `adam` vibrates twice (timer) + shows timer icon.
- `CHK:ALL:T` — all watches in range respond.
- The watch responds only if the target matches its own profile key, or is `ALL`.

## 5. Telemetry — all messages carry the profile key
Watch-to-phone, same format as your spec, with the profile key as the prefix:
- Gestures: `adam:TAP`, `adam:DBL`, `adam:HLD`
- Metrics: `adam:E80`, `adam:H60`, `adam:N40` (values in 10s, -100 to +100)

## 6. BLE — your spec UUID stands
Service UUID `0000FFF0-0000-1000-8000-00805F9B34FB` as in your spec. The phone side is switching to this from the old UUID (`7a1e5b90...`).

## Everything else in your spec stands
GGWave ultrasound primary, BLE fallback mirroring the same payloads, no hardcoded 5-minute reminder loop, configuration persisted across cold starts.
