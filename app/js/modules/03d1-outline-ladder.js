        /* Hot List phase-aware progress ladder (2026-11-27):
           Ticks mark real profile phases from sxComputeGuidedLadder():
             - Phase 1: First Ladder (greedy orthogonal archetype separator)
             - Phase 2: Core Map (Branch Round-Robin to 3/cat)
             - Phase 3: Deeper (Branch Round-Robin to 6/cat, non-compact maps)
             - Final:   Full Map end cap
           Each tick receives .is-reached ONLY when that phase's actual topics
           are rated (not merely when raw total rated crosses the count). */
        let sxLadderKey = "";
        function sxPaintOutlineLadder(phaseProgress = null) {
            const track = qo && qo.parentElement;
            if (!track) return;
            const guided = "function" == typeof window.__SX_GUIDED_LADDER ? window.__SX_GUIDED_LADDER() : null;
            const total = (guided && guided.totalTopics) || window.__SX_SKIN_TOPIC_COUNT || 382;
            const phases = (guided && guided.phases) || [];
            const key = total + ":" + phases.map(p => p.key + "=" + p.cumEnd + "@" + p.cumMinutes).join("|");
            if (key !== sxLadderKey) {
                sxLadderKey = key;
                track.querySelectorAll(".outline-ladder-mark").forEach(el => el.remove());
                phases.forEach(p => {
                    const isFull = p.key === "full" || p.cumEnd >= total;
                    const s = document.createElement("span");
                    s.setAttribute("aria-hidden", "true");
                    s.className = "outline-ladder-mark" +
                        (isFull ? " outline-ladder-full" : p.key === "first" ? " outline-ladder-first" : p.key === "core" ? " outline-ladder-core" : "");
                    s.dataset.phaseKey = p.key;
                    s.dataset.label = `${p.cumEnd} · ~${p.cumMinutes}m`;
                    s.title = `Phase ${p.index} (${p.shortLabel}) · ${p.cumEnd} topics · ~${p.cumMinutes} min`;
                    if (!isFull) s.style.left = (100 * p.cumEnd / total).toFixed(3) + "%";
                    track.appendChild(s);
                });
            }
            if (phaseProgress && Array.isArray(phaseProgress.phases)) {
                const byKey = new Map(phaseProgress.phases.map(p => [p.key, p]));
                let priorOk = true;
                track.querySelectorAll(".outline-ladder-mark").forEach(el => {
                    const st = byKey.get(el.dataset.phaseKey);
                    const reached = Boolean(priorOk && st && st.complete);
                    el.classList.toggle("is-reached", reached);
                    if (!reached) priorOk = false;
                });
            }
        }
        window.__SX_SYNC_OUTLINE_LADDER = function () {
            sxLadderKey = "";
            sxPaintOutlineLadder(Go && "function" == typeof window.__SX_PHASE_PROGRESS ? window.__SX_PHASE_PROGRESS(Go) : null);
        };
