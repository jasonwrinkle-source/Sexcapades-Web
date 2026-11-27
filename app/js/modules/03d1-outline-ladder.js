        /* Hot List ladder (2026-11-27):
           The first tick mark is the skin's Greedy Orthogonal First Ladder
           (spend ~N min rating top M topics to separate the archetypes, with
           a 6-topic soft floor). Subsequent ticks mark category passes
           (3 per category across all categories), followed by the full-list
           end cap. */
        let sxLadderKey = "";
        function sxPaintOutlineLadder() {
            const track = qo && qo.parentElement;
            if (!track) return;
            const total = window.__SX_SKIN_TOPIC_COUNT || 403;
            const cats = Math.max(1, (h && h.length) || 18);
            const fl = "function" == typeof window.__SX_FIRST_LADDER ? window.__SX_FIRST_LADDER() : null;
            const firstN = fl && fl.count > 0 && fl.count < total ? fl.count : 0;
            const firstM = fl && fl.estMinutes > 0 ? fl.estMinutes : Math.max(1, Math.round(firstN / 3));
            const key = total + ":" + cats + ":" + firstN + ":" + firstM;
            if (key === sxLadderKey) return;
            sxLadderKey = key;
            track.querySelectorAll(".outline-ladder-mark").forEach(el => el.remove());
            const step = cats * 3, mins = n => Math.max(1, Math.round(n / 3));
            const marks = [];
            if (firstN > 0) {
                marks.push({
                    label: `${firstN} · ~${firstM}m`,
                    title: `First ladder · rate top ${firstN} topics (~${firstM} min) to find your archetype`,
                    left: (100 * firstN / total).toFixed(3) + "%",
                    first: true
                });
            }
            const firstPct = firstN > 0 ? (100 * firstN / total) : -99;
            for (let n = step; n < total; n += step) {
                const pct = 100 * n / total;
                if (firstN > 0 && Math.abs(pct - firstPct) < 6) continue;
                const m = mins(n);
                marks.push({ label: `${n} · ~${m}m`, title: `${n} topics · ~${m} min`, left: pct.toFixed(3) + "%" });
            }
            const fm = mins(total);
            marks.push(total === 403
                ? { label: "400+ · ~134m", title: "Full map · 400+ topics · ~134 min", full: true }
                : { label: `${total} · ~${fm}m`, title: `Full list · ${total} topics · ~${fm} min`, full: true });
            marks.forEach((m, i) => {
                const s = document.createElement("span");
                s.setAttribute("aria-hidden", "true");
                const isFirst = Boolean(m.first) || (!firstN && i === 0 && !m.full);
                s.className = "outline-ladder-mark" + (m.full ? " outline-ladder-full" : isFirst ? " outline-ladder-first" : "");
                s.dataset.label = m.label;
                s.title = m.title;
                if (!m.full) s.style.left = m.left;
                track.appendChild(s);
            });
        }
        window.__SX_SYNC_OUTLINE_LADDER = function () {
            sxLadderKey = "";
            sxPaintOutlineLadder();
        };
