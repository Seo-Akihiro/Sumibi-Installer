document.addEventListener('DOMContentLoaded', function(){
  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.addEventListener('click', downloadVideo);
});

function downloadVideo() {
  const URL = document.getElementById('urlInput');
  const qualitySelect = document.getElementById('qualitySelect');
  const thumbnailCheck = document.getElementById('thumbnailCheck');


  console.log('ダウンロードボタンがクリックされました');

  console.log('URL:', URL.value);
  console.log('Quality:', qualitySelect.value);
  console.log('Thumbnail:', thumbnailCheck.checked);
}