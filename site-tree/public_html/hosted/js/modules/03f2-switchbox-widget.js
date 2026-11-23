        // --- 2D XY Role Switch-Box State & Widget ---
        var sxSwitchboxState = {
            topicId: null,
            give: 0,
            receive: 0,
            isDragging: false
        };

        function sxGetSwitchboxRole(give, receive, topicId) {
            const g = Math.round(give), r = Math.round(receive);
            const words = sxSwitchboxRoleWords(topicId);
            if (g === 0 && r === 0) return "Neutral / Open";
            if (g > 20 && r > 20) return words.classic ? "Versatile Switch" : "Both " + words.g + " + " + words.r;
            if (g < -20 && r < -20) return words.classic ? "Hard Red Limit" : "Neither (limit)";
            if (g > 20 && r < -20) return words.classic ? "Dedicated Top / Giver" : words.g + " only";
            if (g < -20 && r > 20) return words.classic ? "Dedicated Bottom / Receiver" : words.r + " only";
            if (g > 20 && Math.abs(r) <= 20) return words.classic ? "Top Leaning" : words.g + " leaning";
            if (r > 20 && Math.abs(g) <= 20) return words.classic ? "Bottom Leaning" : words.r + " leaning";
            if (g < -20 && Math.abs(r) <= 20) return words.classic ? "Give Limit" : words.g + " limit";
            if (r < -20 && Math.abs(g) <= 20) return words.classic ? "Receive Limit" : words.r + " limit";
            return "Moderate Engagement";
        }

        function sxDrawSwitchboxWidget(canvas, shape, state) {
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const width = canvas.width, height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const cx = width / 2, cy = height / 2;
            const pad = 22;
            const r = Math.min(cx, cy) - pad;

            // 1. Tinted Quadrant Backgrounds
            // QI (Top-Right: +Give, +Receive -> Versatile Switch)
            ctx.fillStyle = "rgba(34, 197, 94, 0.12)";
            ctx.fillRect(cx, cy - r, r, r);

            // QII (Top-Left: -Give, +Receive -> Bottom / Receiver)
            ctx.fillStyle = "rgba(59, 130, 246, 0.10)";
            ctx.fillRect(cx - r, cy - r, r, r);

            // QIII (Bottom-Left: -Give, -Receive -> Hard Limit)
            ctx.fillStyle = "rgba(239, 68, 68, 0.12)";
            ctx.fillRect(cx - r, cy, r, r);

            // QIV (Bottom-Right: +Give, -Receive -> Top / Giver)
            ctx.fillStyle = "rgba(234, 179, 8, 0.10)";
            ctx.fillRect(cx, cy, r, r);

            // 2. Reference Grid & Border
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
            ctx.strokeRect(cx - r, cy - r, 2 * r, 2 * r);

            // Grid lines at +/- 50
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
            ctx.beginPath();
            ctx.moveTo(cx - r * 0.5, cy - r); ctx.lineTo(cx - r * 0.5, cy + r);
            ctx.moveTo(cx + r * 0.5, cy - r); ctx.lineTo(cx + r * 0.5, cy + r);
            ctx.moveTo(cx - r, cy - r * 0.5); ctx.lineTo(cx + r, cy - r * 0.5);
            ctx.moveTo(cx - r, cy + r * 0.5); ctx.lineTo(cx + r, cy + r * 0.5);
            ctx.stroke();

            // Diagonal switch line Y = X (Top-Right to Bottom-Left)
            ctx.beginPath();
            ctx.moveTo(cx - r, cy + r);
            ctx.lineTo(cx + r, cy - r);
            ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
            ctx.stroke();
            ctx.setLineDash([]);

            // 3. Main Crosshairs
            ctx.beginPath();
            ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
            ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
            ctx.stroke();

            // Deadband center circle
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.stroke();

            // 4. Pole Axis Labels - short axis words on canvas (T2/T4);
            // the full names live in the readout rows + hovertips. Side
            // labels run vertical (tangent, 90°) so they fit the 190px
            // canvas instead of clipping past its edge (T3).
            canvas.__sxLabelRects = [];
            const giveFull = (shape && shape.labels && shape.labels[0]) || "Give";
            const recvFull = (shape && shape.labels && shape.labels[1]) || "Receive";
            const giveLabel = sxShortAxisWord(giveFull);
            const recvLabel = sxShortAxisWord(recvFull);

            // Top (+Receive) - horizontal
            sxDrawPoleLabelAt(ctx, canvas, cx, cy - r - 9, 0, `+ ${recvLabel}`, "#4ade80", "receive", recvFull);
            // Bottom (-Receive Limit) - horizontal
            sxDrawPoleLabelAt(ctx, canvas, cx, cy + r + 9, 0, `- ${recvLabel} Limit`, "#f87171", "receive", recvFull);
            // Right (+Give) - vertical
            sxDrawPoleLabelAt(ctx, canvas, cx + r + 9, cy, 90, `+ ${giveLabel}`, "#4ade80", "give", giveFull);
            // Left (-Give Limit) - vertical
            sxDrawPoleLabelAt(ctx, canvas, cx - r - 9, cy, 90, `- ${giveLabel} Limit`, "#f87171", "give", giveFull);

            // 5. Active Puck Position
            const isUnrated = Boolean(state.isUnrated);
            const g = Math.max(-100, Math.min(100, state.give || 0));
            const recvVal = Math.max(-100, Math.min(100, state.receive || 0));
            const px = cx + (g / 100) * r;
            const py = cy - (recvVal / 100) * r; // screen y is inverted

            if (isUnrated) {
                // Parked unrated ghost prompt at 50% center midpoint
                ctx.beginPath();
                ctx.arc(cx - 9, cy, 7.5, 0, 2 * Math.PI);
                ctx.lineWidth = 1.5;
                ctx.setLineDash([3, 3]);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(cx + 9, cy, 8, 0, 2 * Math.PI);
                ctx.lineWidth = 3;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.font = "italic 10px system-ui, sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
                ctx.fillText("Click or drag to rate", cx, cy - 16);
            } else {
                const ziColor = typeof zi === "function" ? zi : (v => v > 20 ? "#4ade80" : v < -20 ? "#f87171" : "#d7bd55");
                const giveCol = ziColor(g);
                const recvCol = ziColor(recvVal);

                // Give / Advocacy Flank: Solid Disc (matches hypermap / hot list)
                ctx.beginPath();
                ctx.arc(px - 9, py, 8.5, 0, 2 * Math.PI);
                ctx.fillStyle = giveCol;
                ctx.fill();
                ctx.lineWidth = 1.8;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();

                // Receive / Receptivity Flank: Thick Ring with Transparent Center (matches hypermap / hot list)
                ctx.beginPath();
                ctx.arc(px + 9, py, 9, 0, 2 * Math.PI);
                ctx.lineWidth = 4.5;
                ctx.strokeStyle = recvCol;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(px + 9, py, 11.2, 0, 2 * Math.PI);
                ctx.lineWidth = 1.2;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
                ctx.stroke();
            }
        }

        function sxUpdateSwitchboxReadouts(give, receive, isUnrated = false) {
            const gVal = e.byId("markSwitchboxGiveVal");
            const rVal = e.byId("markSwitchboxRecvVal");
            const roleVal = e.byId("markSwitchboxRoleVal");
            if (isUnrated) {
                if (gVal) gVal.textContent = "Unrated";
                if (rVal) rVal.textContent = "Unrated";
                if (roleVal) roleVal.textContent = "Unrated (click box to rate)";
            } else {
                if (gVal) gVal.textContent = String(Math.round(give));
                if (rVal) rVal.textContent = String(Math.round(receive));
                if (roleVal) roleVal.textContent = sxGetSwitchboxRole(give, receive, sxSwitchboxState.topicId);
            }
        }

        function sxBindSwitchboxWidget() {
            const canvas = e.byId("markSwitchboxCanvas");
            const clearBtn = e.byId("markSwitchboxClear");
            if (!canvas || canvas.dataset.bound) return;
            canvas.dataset.bound = "1";
            sxBindPoleHover(canvas, () => sxSwitchboxState.isDragging);

            const updateFromPointer = (evt) => {
                const rect = canvas.getBoundingClientRect();
                const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
                const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
                const px = (clientX - rect.left) * (canvas.width / rect.width);
                const py = (clientY - rect.top) * (canvas.height / rect.height);
                const cx = canvas.width / 2, cy = canvas.height / 2;
                const r = Math.min(cx, cy) - 22;

                // Deadband center snap (within 6px)
                let dx = px - cx, dy = py - cy;
                if (Math.hypot(dx, dy) < 6) {
                    dx = 0; dy = 0;
                }
                const g = Math.max(-100, Math.min(100, Math.round((dx / r) * 100)));
                const recv = Math.max(-100, Math.min(100, Math.round((-dy / r) * 100)));

                sxSwitchboxState.give = g;
                sxSwitchboxState.receive = recv;
                sxSwitchboxState.isUnrated = false;

                if (Qr) {
                    const shape = Ge(Qr);
                    sxDrawSwitchboxWidget(canvas, shape, sxSwitchboxState);
                    To(Qr, "give", g, !1);
                    To(Qr, "receive", recv, !1);
                    sxUpdateSwitchboxReadouts(g, recv, false);
                }
            };

            canvas.addEventListener("pointerdown", (evt) => {
                sxSwitchboxState.isDragging = !0;
                try { canvas.setPointerCapture(evt.pointerId); } catch (e) {}
                updateFromPointer(evt);
            });
            canvas.addEventListener("pointermove", (evt) => {
                if (!sxSwitchboxState.isDragging) return;
                updateFromPointer(evt);
            });
            const stopDrag = (evt) => {
                if (sxSwitchboxState.isDragging) {
                    sxSwitchboxState.isDragging = !1;
                    try { canvas.releasePointerCapture(evt.pointerId); } catch (e) {}
                    if (Qr) {
                        Mr();
                    }
                }
            };
            canvas.addEventListener("pointerup", stopDrag);
            canvas.addEventListener("pointercancel", stopDrag);

            if (clearBtn) {
                clearBtn.addEventListener("click", () => {
                    if (Qr) {
                        Fo(Qr, "give", !1);
                        Fo(Qr, "receive", !0);
                        sxSwitchboxState.give = 0;
                        sxSwitchboxState.receive = 0;
                        sxSwitchboxState.isUnrated = true;
                        const shape = Ge(Qr);
                        sxDrawSwitchboxWidget(canvas, shape, sxSwitchboxState);
                        sxUpdateSwitchboxReadouts(0, 0, true);
                        sxSyncMarkRatings(Qr);
                    }
                });
            }
        }
