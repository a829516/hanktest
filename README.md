# @fuhao.decoded 生活符號翻譯機

Instagram 帳號 @fuhao.decoded 的貼文素材與自動發文工具。

- `NN/`：第 NN 篇貼文（`1.jpg`…輪播圖、`caption.txt` 文案、`slides.json` 動畫 Reels 用的版面）
- `publish.py NN`：發輪播貼文（圖片從本儲存庫的公開網址讀取）
- `make_reel.js NN` + `music.py`：產生動畫 Reels（含原創配樂）；`make_reel.py` 是簡易備用版
- `publish_reel.py NN`：上傳並發佈 Reels
- `lib.js`、`batch2.js` 等：產生圖文的腳本
- `PLAN.md`：經營計畫

權杖不存放在這裡，由執行環境的網路代理注入。
