# Sexcapades 4.0 is Live: Addicted to Speed, Rolling in Cache, and In-Place Scribe Story Prompts

**Tag:** *Announcements / Releases / Development Update*

---

Hey everyone,

We have crossed a massive milestone: **Sexcapades 4.0 is officially live on [sexcapades.io](https://sexcapades.io)**!

Over the past few weeks, Sexcapades has evolved from a rich, radial kink-compatibility hypermap into a complete ecosystem for exploring, negotiating, and safely pacing live play. Here is everything that just landed in **v4.0 (Build 2026-11-10)**:

---

### 1. Addicted to Speed: Rolling in Cache (While Staying Cashless)
Look, we admit it: we got hopelessly **addicted to speed**. 

When you want to explore 400+ kinks or plan an intense scene, waiting around for clunky rendering is an immediate mood killer. We went all-in on performance tuning and warm-boot indexing:
* **All the Cache, None of the Cash:** We rebuilt our warm-boot cache from the ground up (`v3` IndexedDB engine). Instead of cold-crunching hundreds of spoke vectors and branch layouts from scratch every time you open the tab, we stash the pristine layout geometry right in your local browser cache. It turns out going heavy on **cache** is the best way to keep the experience completely **cashless**—no subscriptions, no microtransactions, and no paywalls. Pure speed, banked directly on your device.
* **Zero Jitter / Instant Framing:** Banished the jarring 100ms camera zoom on initial load. The map now frames your central avatar, multi-profile glance rings, and 18 full branches smoothly with zero hesitation across desktop, tablet, and mobile.
* **Unified 5-Way Navigation Header:** Instantly switch between the **Hypermap**, **Popularity List**, **Scene Setter**, **Scene Sentinel**, and **Scribe** with intelligent, profile-aware menu gating.

---

### 2. Scribe: The Return of Literotica Prompts (Now with Live In-Place Controls)
So... funny story. Somewhere during recent development, actual Literotica-style story prompt generation had silently **VANISHED**. 

Why? Because it was *"assumed to still be working since nobody asked for changes to it"* 🙄. Instead of generating rich story outlines, Scribe had sneakily started spitting out Scene Setter negotiation guides!

We caught it, squashed it, and gave Scribe the major overhaul it actually deserved:
* **True Literotica Narrative Prompts Restored:** Full, steamy, multi-phase story generation tailored directly to your selected partner profiles, consent ratings, and shared kinks.
* **Live In-Place Regeneration:** No modal hopping, no losing your spot. We stopped hiding the control dialog when a prompt generates. Keep your scene phases, character notes, target length, and explicitness sliders right in front of you while tweaking and regenerating on the fly.
* **One-Click Export:** Instantly copy to your clipboard or download clean `.txt` prompt briefs to feed your favorite creative AI tools or use as a personal writing outline.

---

### 3. GibberWear & Scene Sentinel (Real-Time Wear OS Play Integration)
Version 4.0 brings the hardware bridge into full swing. With our companion Wear OS app (**GibberWear**) and the in-app **Scene Sentinel**, partners can communicate boundaries, timer checks, and emotional temperature in real time:
* **Silent, Discreet Tactile Pacing:** No screens or phones needed mid-scene. Subtle haptic pulses and ultrasound/BLE pings let partners transmit status, consent check-ins, and heat levels straight to the wrist.
* **Dual Transport:** Robust synchronization over Bluetooth Low Energy (BLE) and acoustic chirp handshakes, keeping your connection active even when offline or away from Wi-Fi.
* **Consent & Check-in Timers:** Autonomous reminder intervals configured directly from your session setup.

---

### Under the Hood: Built with Love & Physics
Sexcapades is built from the ground up as an ad-free, private, client-side exploration tool. Every rating calculation, tensor compatibility metric, and layout balance operates directly in your browser without tracking or storing your personal kink data on a remote server. 

We just passed **430+ site visitors** on the live cluster with all system diagnostics green. 

Thank you so much to everyone supporting the project here on Patreon. Your backing fuels the compute, hosting, and rapid vibe coding that makes these continuous releases possible.

Hop over to **[sexcapades.io](https://sexcapades.io)**, try out Scribe and the speed-demon hypermap, and let us know what you think!

— **SkewedViewBlue**
