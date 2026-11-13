# serve-local.py — local static server for Playwright runs.
# Like `python -m http.server 8000`, but with a much larger listen backlog
# so parallel Playwright browsers don't get connection-refused.
# The plain `python -m http.server` has no flag for this: its backlog is
# fixed at 5 (socketserver.TCPServer.request_queue_size), which is why a
# burst of parallel browsers overflows it.
#
# Usage (from the repo root, or anywhere — the docroot is derived):
#   python serve-local.py            # serves site-tree/public_html on port 8000
#   python serve-local.py 8080       # same, on port 8080
#   python serve-local.py 8000 <dir> # serve an explicit directory
# Stop it with Ctrl+C.
import functools
import http.server
import sys
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
if len(sys.argv) > 2:
    ROOT = Path(sys.argv[2])
else:
    # Repo root is the parent of the folder this script lives in.
    ROOT = Path(__file__).resolve().parents[1] / "site-tree" / "public_html"


class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 128  # default is 5; 128 absorbs Playwright bursts
    daemon_threads = True


handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
print(f"Serving {ROOT} on http://localhost:{PORT} (listen backlog 128)")
Server(("127.0.0.1", PORT), handler).serve_forever()
