"""Publish one carousel post to Instagram via the Graph API.

Usage: python3 publish.py <post_dir_name>   e.g. 01
Images must already be pushed to the public GitHub repo (fuhao-posts).
The access token is injected by the session's network proxy; none is stored here.
"""
import json, sys, time, urllib.parse, urllib.request
from pathlib import Path

IG_USER = "17841462731831982"
API = "https://graph.facebook.com/v23.0"
RAW = "https://raw.githubusercontent.com/a829516/hanktest/main"


def call(method, path, **params):
    data = urllib.parse.urlencode(params).encode() if method == "POST" else None
    url = f"{API}/{path}" + ("" if data else "?" + urllib.parse.urlencode(params))
    try:
        with urllib.request.urlopen(urllib.request.Request(url, data=data, method=method)) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"API error on {path}: {e.read().decode()}")


def wait_ready(cid):
    for _ in range(30):
        if call("GET", cid, fields="status_code")["status_code"] == "FINISHED":
            return
        time.sleep(3)
    sys.exit(f"container {cid} not ready")


def main(post):
    folder = Path(__file__).parent / post
    images = sorted(folder.glob("[0-9].jpg"))
    caption = (folder / "caption.txt").read_text().strip()
    children = []
    for img in images:
        c = call("POST", f"{IG_USER}/media", image_url=f"{RAW}/{post}/{img.name}", is_carousel_item="true")
        children.append(c["id"])
    for c in children:
        wait_ready(c)
    carousel = call("POST", f"{IG_USER}/media", media_type="CAROUSEL", children=",".join(children), caption=caption)
    wait_ready(carousel["id"])
    pub = call("POST", f"{IG_USER}/media_publish", creation_id=carousel["id"])
    link = call("GET", pub["id"], fields="permalink").get("permalink")
    (folder / "PUBLISHED").write_text(f"{pub['id']}\n{link}\n")
    print("published:", link)


if __name__ == "__main__":
    main(sys.argv[1])
