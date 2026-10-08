const FIXTURES = [
  {
    "id": "jpg",
    "name": "照片.jpg",
    "file": "photo.jpg",
    "kind": "image",
    "note": "自制测试图；320×180",
    "bytes": 7770,
    "sha256": "f7a733060d7cac93a0e39a5911c2a904067048f3c6e6b98b8dca74ea17532507"
  },
  {
    "id": "png",
    "name": "城市夜景.png",
    "file": "chart.png",
    "kind": "image",
    "note": "自制测试图；320×180",
    "bytes": 7549,
    "sha256": "cdd5305162d50a27fa38bf6314e221207fac460f7004a358b122aaae651f0a0d"
  },
  {
    "id": "webp",
    "name": "图像.webp",
    "file": "still.webp",
    "kind": "image",
    "note": "自制静态 WebP",
    "bytes": 3696,
    "sha256": "a238e64645db076174ba949d6dfece77b29c2f85fe73e57511ac3bfd3b5ef4fa"
  },
  {
    "id": "heic",
    "name": "主图.heic",
    "file": "primary.heic",
    "kind": "image",
    "note": "仅主图；由自制 JPG 转换",
    "bytes": 6425,
    "sha256": "f04a9579b1c1aa1a06698f3283daa4b5606fe3048fc725c6e27cdfd6d9acda5a"
  },
  {
    "id": "gif",
    "name": "动画.gif",
    "file": "animation.gif",
    "kind": "animation",
    "note": "5 fps；播放与暂停需独立核对",
    "bytes": 26195,
    "sha256": "c74118bdc6dfa96baca7e25ae5cfb85ae083042bf4463c732f4fdc4909931d51"
  },
  {
    "id": "h264",
    "name": "短片-h264.mp4",
    "file": "h264.mp4",
    "kind": "video",
    "note": "H.264 / AAC；5 秒；8-bit 4:2:0",
    "bytes": 405914,
    "sha256": "d3cf5ec8184fb60b0374971fcade3a983a4b78310544458835089aebb8134c08"
  },
  {
    "id": "mov",
    "name": "短片-h264.mov",
    "file": "h264.mov",
    "kind": "video",
    "note": "MOV 容器 H.264 / AAC；5 秒",
    "bytes": 405965,
    "sha256": "38f09d8c8bda328eee8cbbcac973d88865dfc89490186173778194bcc61e229b"
  },
  {
    "id": "hevc",
    "name": "短片-hevc.mp4",
    "file": "hevc.mp4",
    "kind": "video",
    "note": "HEVC hvc1 / AAC；5 秒；8-bit SDR",
    "bytes": 164278,
    "sha256": "db23e1bbc34d47bac51363b13a3b72bbc036813f5d4ee6a14f4a5abede483a25"
  },
  {
    "id": "mp3",
    "name": "声音.mp3",
    "file": "tone.mp3",
    "kind": "audio",
    "note": "3 秒 440Hz 低音量；听感须由人核对",
    "bytes": 24429,
    "sha256": "7b2c1881a83f48953b3d3cb926ffc2ae71ff15a6dadad18bef04153300bf74d7"
  },
  {
    "id": "wav",
    "name": "声音.wav",
    "file": "tone.wav",
    "kind": "audio",
    "note": "PCM s16le；3 秒",
    "bytes": 288078,
    "sha256": "4adcbb421c0309e3a60ded070b75d6677206e6ae4dc12ff06157d994faa85a87"
  },
  {
    "id": "pdf",
    "name": "两页文档.pdf",
    "file": "two-pages.pdf",
    "kind": "pdf",
    "note": "两页自制英文文字 PDF",
    "bytes": 863,
    "sha256": "bd0c173fd254083c2dd958de3eb06b68ab45a2a6308e3f24568b30b49a2721c5"
  },
  {
    "id": "alpha",
    "name": "透明 PNG",
    "file": "alpha.png",
    "kind": "image",
    "note": "自制 RGBA 棋盘；需检查透明与颜色",
    "bytes": 65785,
    "sha256": "8175fbedb12f3c47f4083d5530cefe0c1b002e18bfbb2180c484c5cf041fc1b8"
  },
  {
    "id": "awebp",
    "name": "动画 WebP",
    "file": "animation.webp",
    "kind": "animation",
    "note": "4 帧；每帧 250ms；自制颜色渐变",
    "bytes": 506,
    "sha256": "130460096456a9a55b070626d1605dac464136c57f8923ad46ba4a06b22cd911"
  },
  {
    "id": "broken",
    "name": "损坏 JPG",
    "file": "broken.jpg",
    "kind": "image",
    "note": "故意损坏：应保留条目并报预览失败",
    "bytes": 14,
    "sha256": "7905942ea82dc075f3acba45545a83a8975b168c903dd4f8057291b4f9b5843b"
  },
  {
    "id": "offline",
    "name": "离线原件（路径缺失）",
    "file": "offline.png",
    "kind": "image",
    "note": "不存在的受控样本路径；不等于格式不支持",
    "bytes": null,
    "sha256": null
  },
  {
    "id": "large",
    "name": "4096×4096 PNG",
    "file": "large.png",
    "kind": "image",
    "note": "16.8MP 自制图片；不能代表超大素材或大图库",
    "bytes": 1952421,
    "sha256": "1383b2957bb0c543f5b51c14e7e1f7c49ae74dffdb2f9e10f85a9fec615fb4c5"
  },
  {
    "id": "long",
    "name": "120 秒 HEVC（中断实验）",
    "file": "long-hevc.mp4",
    "kind": "video",
    "note": "自制 5 秒 HEVC 循环拼接；用于真实在途取消与重试，SDR",
    "bytes": 3855215,
    "sha256": "4d87c052c2fbe8c48faa513ca42edc008bfcb271026cabdef40199599b3db71e"
  }
];
