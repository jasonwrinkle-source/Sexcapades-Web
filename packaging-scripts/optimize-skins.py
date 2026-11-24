import os
import json

skins_dir = "app/data/skins"
hosted_skins_dir = "site-tree/public_html/hosted/data/skins"

for fn in os.listdir(skins_dir):
    if not fn.endswith(".json"):
        continue
    path = os.path.join(skins_dir, fn)
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    
    compact_text = json.dumps(data, separators=(',', ':'), ensure_ascii=False)
    with open(path, "w", encoding="utf-8") as out:
        out.write(compact_text)
    
    if os.path.exists(hosted_skins_dir):
        hpath = os.path.join(hosted_skins_dir, fn)
        with open(hpath, "w", encoding="utf-8") as out:
            out.write(compact_text)

print("[Skins] Compressed and optimized all skin JSON assets!")
