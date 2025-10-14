from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import yt_dlp

app = Flask(__name__)
CORS(app)  # シンプルなCORS設定に変更

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
  data = request.get_json()

  #リクエストからデータを受け取り
  url = data.get('url', 'https://www.youtube.com/watch?v=jNQXAC9IVRw')
  custom_path = data.get('save_path')
  requested_format = data.get('format', 'best')
  writethumbnail = data.get('writethumbnail', False)

  # パス処理を改善
  if custom_path and custom_path.strip():
    # カスタムパスが指定されている場合
    if custom_path.startswith('~'):
      # チルダ記号を展開
      path = os.path.expanduser(custom_path)
    else:
      # 相対パスまたは絶対パス
      path = os.path.abspath(custom_path)
    
    # フォルダが存在しない場合は作成
    try:
      os.makedirs(path, exist_ok=True)
    except Exception as e:
      return jsonify({
        'status': 'error', 
        'message': f'フォルダの作成に失敗しました: {str(e)}'
      })
  else:
    # デフォルトパス
    path = os.path.expanduser('~/Downloads')

  is_wav_request = isinstance(requested_format, str) and requested_format.lower() == 'wav'

  #オプションの設定
  opts = {
        'outtmpl': f'{path}/%(title)s.%(ext)s', # ファイル名
        'nocheckcertificate': True,             # SSL証明書の検証をスキップ
        'writeall_thumbnails': False,           # 利用可能な全サムネイルをダウンロード
        'noplaylist': False                     # プレイリストを無視
  }

  if is_wav_request:
    opts.update({
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
            'preferredquality': '0'
        }],
        'postprocessor_args': ['-ar', '48000'],
        'keepvideo': False,
        'prefer_ffmpeg': True,
        'embedthumbnail': False,
        'writethumbnail': False
    })
  else:
    opts.update({
        'format': requested_format,
        'writethumbnail': writethumbnail,
        'embedthumbnail': writethumbnail
    })

  #ダウンロードの実行
  try:
    with yt_dlp.YoutubeDL(opts) as ydl:
      ydl.download([url])
    download_label = 'WAV audio' if is_wav_request else 'Video'
    return jsonify({
      'status': 'success', 
      'message': f'{download_label} downloaded successfully',
      'save_path': path,
      'requested_format': 'wav' if is_wav_request else requested_format
    })
  except Exception as e:
    return jsonify({
      'status': 'error', 
      'message': f'ダウンロードエラー: {str(e)}'
    })

if __name__ == '__main__':
  app.run(debug=True, host='127.0.0.1', port=5000)