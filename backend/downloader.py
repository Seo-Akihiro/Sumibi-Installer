import yt_dlp

URL = input("動画のURLを入力: ")

print("ダウンロードを開始します...")

opts = {
        'outtmpl': '%(title)s.%(ext)s',  # ファイル名
        'format': 'best',                # 品質
        'nocheckcertificate': True,      # SSL証明書の検証をスキップ
        }
with yt_dlp.YoutubeDL(opts) as ydl:
        ydl.download([URL])