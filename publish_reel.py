"""Upload <post>/reel.mp4 as an Instagram Reel via resumable upload.  Usage: python3 publish_reel.py 01
Tokens for graph.facebook.com and rupload.facebook.com are injected by the network proxy."""
import json, sys, time, urllib.parse, urllib.request
from pathlib import Path

IG_USER = "17841462731831982"
API = "https://graph.facebook.com/v23.0"


def req(url, data=None, headers=None, method=None):
    r = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(r, timeout=300) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        sys.exit(f"error {e.code} on {url.split('?')[0]}: {e.read().decode()}")


def main(post):
    folder = Path(__file__).parent / post
    video = (folder / "reel.mp4").read_bytes()
    caption = (folder / "caption.txt").read_text().strip()
    for attempt in range(4):  # rupload sometimes returns a transient ProcessingFailedError
        c = req(f"{API}/{IG_USER}/media", data=urllib.parse.urlencode(
            {"media_type": "REELS", "upload_type": "resumable", "caption": caption, "share_to_feed": "false", "thumb_offset": "500"}).encode())
        cid, uri = c["id"], c["uri"]
        try:
            with urllib.request.urlopen(urllib.request.Request(uri, data=video, method="POST",
                    headers={"offset": "0", "file_size": str(len(video))}), timeout=300):
                break
        except urllib.error.HTTPError as e:
            print(f"upload attempt {attempt + 1} failed: {e.read().decode()[:200]}")
            time.sleep(20 * (attempt + 1))
    else:
        sys.exit("upload failed after retries")
    for _ in range(60):
        st = req(f"{API}/{cid}?fields=status_code,status")
        if st["status_code"] == "FINISHED":
            break
        if st["status_code"] == "ERROR":
            sys.exit(f"processing failed: {st}")
        time.sleep(5)
    else:
        sys.exit("timed out waiting for processing")
    pub = req(f"{API}/{IG_USER}/media_publish", data=urllib.parse.urlencode({"creation_id": cid}).encode())
    link = req(f"{API}/{pub['id']}?fields=permalink").get("permalink")
    (folder / "REEL_PUBLISHED").write_text(f"{pub['id']}\n{link}\n")
    print("reel published:", link)


if __name__ == "__main__":
    main(sys.argv[1])
