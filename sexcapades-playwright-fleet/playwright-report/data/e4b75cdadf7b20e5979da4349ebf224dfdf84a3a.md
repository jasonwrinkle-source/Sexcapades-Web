# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 10-profile-io.spec.js >> Squad 1 — profile conversion and persistence >> S1-01 JSON import accepts a representative profile
- Location: tests\10-profile-io.spec.js:6:3

# Error details

```
Test timeout of 45000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - link "Skip to profiles" [ref=e2] [cursor=pointer]:
    - /url: "#profileTabs"
  - link "Skip to map" [ref=e3] [cursor=pointer]:
    - /url: "#mapContainer"
  - link "Skip to Popularity list" [ref=e4] [cursor=pointer]:
    - /url: "#listViewDialog"
  - main [ref=e5]:
    - generic [ref=e6]:
      - heading [level=1] [ref=e7]:
        - button "Sexcapades.IO" [ref=e8] [cursor=pointer]
      - button "Hypermap ▾" [ref=e9] [cursor=pointer]
      - generic [ref=e11]:
        - generic [ref=e12]:
          - combobox "Find a topic" [ref=e13]
          - generic: ⌕
        - combobox "Choose a topic" [ref=e15] [cursor=pointer]:
          - generic [ref=e16]: Choose a topic…
      - generic [ref=e17]:
        - generic [ref=e18]:
          - button "Play the verse for the Profile and imports" [ref=e19] [cursor=pointer]:
            - img "Yolanda \"Yo\" Biche — close-up of her smiling face, one paw raised in a wave" [ref=e20]
          - button "Open Charted details":
            - generic [aria-hidden] [ref=e21] [cursor=pointer]
            - generic [aria-hidden] [ref=e22] [cursor=pointer]
        - link "Open the Syncing Sexcapades Guide" [ref=e23] [cursor=pointer]:
          - /url: gate.html#guide
          - strong [aria-hidden] [ref=e24]: "?"
    - region "Profile and overlay controls" [ref=e25]:
      - generic [ref=e26]:
        - generic [ref=e27]:
          - button "Scribe" [ref=e28] [cursor=pointer]
          - group "Interest filters" [ref=e29]:
            - button "All" [pressed] [ref=e30] [cursor=pointer]
            - button "Hot topics" [ref=e31] [cursor=pointer]
            - button "Curiosity?" [ref=e32] [cursor=pointer]
            - button "Mismatched" [ref=e33] [cursor=pointer]
            - button "Blind Mode" [disabled] [ref=e34]
        - generic [ref=e38]:
          - tablist "Profiles" [ref=e39]:
            - generic [ref=e40]:
              - generic [ref=e41]:
                - button "Export Adam Peasant" [ref=e42] [cursor=pointer]
                - button "Adam Peasant Veil off, level 50. Open Veil settings." [ref=e46] [cursor=pointer]
                - button "Adam Peasant Heat Neutral. Open Heat settings." [ref=e50] [cursor=pointer]:
                  - generic [ref=e53]: Neutral
                - button "Load or import data for Adam Peasant" [ref=e56] [cursor=pointer]
                - tab "Adam Peasant profile, Man · Queer + Heteroflexible, selected for grouping" [selected] [ref=e60] [cursor=pointer]:
                  - generic [ref=e61]: Adam Peasant
                - button "Close Adam Peasant profile" [ref=e62] [cursor=pointer]: ×
              - button "Add or import a profile" [ref=e64] [cursor=pointer]: +
          - generic "Active profile actions" [ref=e65]:
            - button "Save" [ref=e66] [cursor=pointer]
    - generic "Interactive Sexcapades hypermap" [ref=e73]:
      - img "A zoomable mind map of consenting adult interests. Tap a node icon or label to select the topic and open its rating sliders, or tap a line to select its branch. Hold or double-click a node to edit its note and Favorite or Hard Limit mark. Tap a direction or everything label to open its tangential scale, then drag to choose a shade." [ref=e75]
      - generic "Hypermap controls" [ref=e76]:
        - button "Zoom out" [ref=e77] [cursor=pointer]: −
        - button "Fit hypermap" [ref=e78] [cursor=pointer]
        - button "Zoom in" [ref=e81] [cursor=pointer]: +
        - button "Legend" [ref=e83] [cursor=pointer]
        - group "Topics shown per branch" [ref=e87]:
          - button "Full" [pressed] [ref=e88] [cursor=pointer]
      - status: Scroll to zoom · Drag to pan
  - text: 54 · ~18m 400+ · ~134m
  - dialog "Profile imported" [ref=e89]:
    - generic [ref=e90]:
      - generic [ref=e91]:
        - heading "Profile imported" [level=2] [ref=e92]
        - paragraph [ref=e93]: Adam Peasant was imported with 164 ratings.
      - button "Close import result" [active] [ref=e94] [cursor=pointer]: ×
    - button "OK" [ref=e97] [cursor=pointer]
  - text: ▾ ▾ ▾ ▾
  - link [aria-hidden] [ref=e98] [cursor=pointer]:
    - /url: https://linktr.ee/SkewedViewBlue
  - text: › ›
  - status
  - text: ↗
```