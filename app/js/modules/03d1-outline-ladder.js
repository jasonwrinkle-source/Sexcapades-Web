        /* Hot List ladder (Jason, 2026-11-19): the tick marks are one
           pass of the list — the top 3 topics in every category — and
           the time is that many topics at the same 20 seconds each
           (54 topics, 18 categories, ~18 min on Sexcapades). Each skin
           uses its own category count and its own topic total, so
           Poliscapades does not keep the Sexcapades "400+ · ~134m" mark.
           Sexcapades itself keeps the "400+" full-map label. */
        let sxLadderKey = "";
        function sxPaintOutlineLadder() {
            const track = qo && qo.parentElement;
            if (!track) return;
            const total = window.__SX_SKIN_TOPIC_COUNT || 403;
            const cats = Math.max(1, (h && h.length) || 18);
            const key = total + ":" + cats;
            if (key === sxLadderKey) return;
            sxLadderKey = key;
            track.querySelectorAll(".outline-ladder-mark").forEach(el => el.remove());
            const step = cats * 3, mins = n => Math.round(n / 3);
            const marks = [];
            for (let n = step; n < total; n += step) {
                const m = mins(n);
                marks.push({ label: `${n} · ~${m}m`, title: `${n} topics · ~${m} min`, left: (100 * n / total).toFixed(3) + "%" });
            }
            const fm = mins(total);
            marks.push(total === 403
                ? { label: "400+ · ~134m", title: "Full map · 400+ topics · ~134 min", full: true }
                : { label: `${total} · ~${fm}m`, title: `Full list · ${total} topics · ~${fm} min`, full: true });
            marks.forEach((m, i) => {
                const s = document.createElement("span");
                s.setAttribute("aria-hidden", "true");
                s.className = "outline-ladder-mark" + (m.full ? " outline-ladder-full" : i === 0 ? " outline-ladder-first" : "");
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
