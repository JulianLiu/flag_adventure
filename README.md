# 旗幟探險：猜國旗遊戲（SPA）

仿 Android《旗幟探險》玩法：上方國旗，下方 12 個中文字選字拼出國家名。

## 執行

```bash
npm install
npm run dev     # 本機試玩 http://localhost:5173/
npm run build   # 產生 dist/，可部署到 GitHub Pages / Netlify
```

## 內容

- 219 題（常見 51＋國家／島國 146＋地區旗 22：英格蘭、蘇格蘭、威爾斯、北愛爾蘭、關島、格陵蘭、法羅群島、新喀里多尼亞、百慕達等）
- 全正體中文，命名依台灣用法（帛琉、吐瓦魯、紐西蘭、寮國、密克羅尼西亞等），每題附首都中文名
- 國旗圖：FlagCDN SVG 向量（高解析）＋ w640 PNG 備援
- 音效：Web Audio API 自行合成（選字／退回／答對／答錯／轉場／過關），無版權問題，右上可靜音
- 動畫：選字彈跳、答對撒花、答錯震動、切題滑入（Framer Motion＋canvas-confetti）
- 輕鬆玩：無計時無生命，提示（去干擾字＋顯示英文名）、首都提示、跳過、連擊加分、最佳分數存 localStorage

## 線上試玩

https://julianliu.github.io/flag_adventure/
