from flask import Flask, request, jsonify
import yt_dlp

app = Flask(__name__)

@app.route('/')
def hello():
  return "Hello World!"

@app.route('/api/double', methods=['POST'])
def double_number():
  data = request.get_json()
  number = data.get('number', 0)
  doubled = number * 2
  return jsonify({'result': doubled})

@app.route('/api/download', methods=['POST'])
def download_video():
  #リクエストを受け取る
  date = request.get_json()

  #リクエストからデータを受け取り
  url = date.get('url', 'https://www.youtube.com/watch?v=jNQXAC9IVRw')
  path = date.get('save_path', './downloads')
  format = date.get('format', 'best')
  writethumbnail = date.get('writethumbnail', False)

  #オプションの設定
  opts = {
        'outtmpl': f'{path}/%(title)s.%(ext)s', # ファイル名
        'format': format,                       # 品質
        'nocheckcertificate': True,             # SSL証明書の検証をスキップ
        'writethumbnail': writethumbnail,       # サムネイルをダウンロード
        'writeall_thumbnails': False,           # 利用可能な全サムネイルをダウンロード
        'embedthumbnail': True,                 # サムネイルを動画ファイルに埋め込み
        'noplaylist': False                     # プレイリストを無視
  }

  #ダウンロードの実行
  with yt_dlp.YoutubeDL(opts) as ydl:
    ydl.download([url])
    
    return jsonify({'status': 'success', 'message': 'Video downloaded successfully'})



if __name__ == '__main__':
  app.run(debug=True, host='127.0.0.1', port=5000)

#
#URL = input("動画のURLを入力: ")
#
#print("ダウンロードを開始します...")
#
#opts = {
#        'outtmpl': '%(title)s.%(ext)s',  # ファイル名
#        'format': 'best',                # 品質
#        'nocheckcertificate': True,      # SSL証明書の検証をスキップ
#        'writethumbnail': True,          # サムネイルをダウンロード
#        'writeall_thumbnails': True,     # 利用可能な全サムネイルをダウンロード
#        }
#with yt_dlp.YoutubeDL(opts) as ydl:
#        ydl.download([URL])