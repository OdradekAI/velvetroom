"""Self-created samples only. Does not read the user's Eagle library."""
from pathlib import Path
import shutil, json, hashlib, struct, zlib, subprocess
root = Path(__file__).resolve().parent
out=root/'src-tauri/fixtures';out.mkdir(parents=True,exist_ok=True)
old=root/'base-fixtures'
if not old.exists(): subprocess.run(['python3',str(root/'generate-base-fixtures.py')],check=True)
rows=[]
def add(id,name,file,kind,note):
 p=out/file
 rows.append(dict(id=id,name=name,file=file,kind=kind,note=note,bytes=p.stat().st_size if p.exists() else None,sha256=hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else None))
for id,name,file,kind,note in [
 ('jpg','照片.jpg','photo.jpg','image','自制测试图；320×180'),('png','城市夜景.png','chart.png','image','自制测试图；320×180'),
 ('webp','图像.webp','still.webp','image','自制静态 WebP'),('heic','主图.heic','primary.heic','image','仅主图；由自制 JPG 转换'),
 ('gif','动画.gif','animation.gif','animation','5 fps；播放与暂停需独立核对'),
 ('h264','短片-h264.mp4','h264.mp4','video','H.264 / AAC；5 秒；8-bit 4:2:0'),
 ('mov','短片-h264.mov','h264.mov','video','MOV 容器 H.264 / AAC；5 秒'),
 ('hevc','短片-hevc.mp4','hevc.mp4','video','HEVC hvc1 / AAC；5 秒；8-bit SDR'),
 ('mp3','声音.mp3','tone.mp3','audio','3 秒 440Hz 低音量；听感须由人核对'),
 ('wav','声音.wav','tone.wav','audio','PCM s16le；3 秒'),
 ('pdf','两页文档.pdf','two-pages.pdf','pdf','两页自制英文文字 PDF')]:
 shutil.copy2(old/name,out/file);add(id,name,file,kind,note)
def png(p,w,h,frame=0):
 def chunk(t,d):return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
 raw=b''.join(b'\x00'+b''.join(bytes(((x+frame*50)%256,(y*2)%256,160,255 if (x//32+y//32)%2 else 80)) for x in range(w)) for y in range(h))
 p.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw))+chunk(b'IEND',b''))
png(root/'src-tauri/icons/icon.png',128,128)
png(out/'alpha.png',320,180);add('alpha','透明 PNG','alpha.png','image','自制 RGBA 棋盘；需检查透明与颜色')
frames=root/'generated-frames';frames.mkdir(exist_ok=True)
for i in range(4):png(frames/f'{i}.png',160,90,i)
cmd=['/opt/homebrew/bin/img2webp','-loop','0']
for i in range(4):cmd+=['-d','250',str(frames/f'{i}.png')]
subprocess.run(cmd+['-o',str(out/'animation.webp')],check=True,capture_output=True)
add('awebp','动画 WebP','animation.webp','animation','4 帧；每帧 250ms；自制颜色渐变')
(out/'broken.jpg').write_bytes(b'not an image\x00\xff');add('broken','损坏 JPG','broken.jpg','image','故意损坏：应保留条目并报预览失败')
add('offline','离线原件（路径缺失）','offline.png','image','不存在的受控样本路径；不等于格式不支持')
png(out/'large.png',4096,4096);add('large','4096×4096 PNG','large.png','image','16.8MP 自制图片；不能代表超大素材或大图库')
for p in frames.iterdir():p.unlink()
frames.rmdir()
subprocess.run(['/opt/homebrew/bin/ffmpeg','-hide_banner','-loglevel','error','-y','-stream_loop','23','-i',str(out/'hevc.mp4'),'-c','copy','-movflags','+faststart',str(out/'long-hevc.mp4')],check=True)
add('long','120 秒 HEVC（中断实验）','long-hevc.mp4','video','自制 5 秒 HEVC 循环拼接；用于真实在途取消与重试，SDR')
(root/'src-tauri/fixture-manifest.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
(root/'web/fixtures.js').write_text('const FIXTURES = '+json.dumps(rows,ensure_ascii=False,indent=2)+';\n')
print(f'{len(rows)} cases; '+str(sum(r['bytes'] or 0 for r in rows))+' bytes')
