document.addEventListener('DOMContentLoaded', function(){
  const downloadBtn = document.getElementById('downloadBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const folderInput = document.getElementById('folderInput');
  const qualitySelect = document.getElementById('qualitySelect');
  
  downloadBtn.addEventListener('click', downloadVideo);
  settingsBtn.addEventListener('click', selectFolder);
  folderInput.addEventListener('change', handleFolderSelection);
  qualitySelect.addEventListener('change', handleQualityChange);

  handleQualityChange();
});

// フォルダ選択ボタンがクリックされた時
function selectFolder() {
  const folderInput = document.getElementById('folderInput');
  folderInput.click(); // 隠しファイル選択をトリガー
}

// フォルダが選択された時
function handleFolderSelection(event) {
  const files = event.target.files;
  const downloadPathInput = document.getElementById('downloadPath');
  
  if (files.length > 0) {
    // より正確なパス取得を試行
    const file = files[0];
    let folderPath;
    
    if (file.webkitRelativePath) {
      // webkitRelativePathから親フォルダを取得
      const pathParts = file.webkitRelativePath.split('/');
      folderPath = `~/${pathParts[0]}`;  // ホームディレクトリからの相対パス
    } else {
      folderPath = '~/Downloads';  // フォールバック
    }
    
    downloadPathInput.value = folderPath;
    
    // より正確なパスを表示
    const pathNote = document.getElementById('pathNote');
    pathNote.textContent = `選択されたフォルダ: ${folderPath}`;
    pathNote.style.color = '#28a745';
  }
}

function downloadVideo() {
  const URL = document.getElementById('urlInput');
  const qualitySelect = document.getElementById('qualitySelect');
  const thumbnailCheck = document.getElementById('thumbnailCheck');
  const downloadPath = document.getElementById('downloadPath');
  const isWav = qualitySelect.value === 'wav';
  const selectedQualityLabel = qualitySelect.options[qualitySelect.selectedIndex].text;

  // 結果表示エリアを取得
  const resultSection = document.getElementById('resultSection');
  const resultMessage = document.getElementById('resultMessage');
  const resultDetails = document.getElementById('resultDetails');

  console.log('ダウンロードを開始します');

  // ダウンロード開始の表示
  resultSection.style.display = 'block';
  resultMessage.innerHTML = '⏳ ダウンロード中...';
  resultMessage.className = 'result-message loading';
  resultDetails.innerHTML = '';

  // 保存先パスを決定
  let savePath = downloadPath.value ? downloadPath.value.trim() : null;

  fetch('http://127.0.0.1:5000/api/download', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: URL.value,
      format: qualitySelect.value,
      writethumbnail: !isWav && thumbnailCheck.checked,
      save_path: savePath
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Python からの返答:', data);
    const outputFormatLabel = (data.requested_format && data.requested_format.toLowerCase() === 'wav')
      ? 'WAV'
      : selectedQualityLabel;
    
    if (data.status === 'success') {
      // 成功時の表示
      resultMessage.innerHTML = '✅ ' + data.message;
      resultMessage.className = 'result-message success';
      
      // 詳細情報を表示
      resultDetails.innerHTML = `
        <p><strong>URL:</strong> ${URL.value}</p>
        <p><strong>品質:</strong> ${selectedQualityLabel}</p>
        <p><strong>出力形式:</strong> ${outputFormatLabel}</p>
        <p><strong>サムネイル:</strong> ${thumbnailCheck.checked ? 'あり' : 'なし'}</p>
        <p><strong>保存先:</strong> ${data.save_path || 'デフォルト（ダウンロードフォルダ）'}</p>
        <p><strong>状態:</strong> ${data.status}</p>
      `;
    } else {
      // サーバー側エラーの表示
      resultMessage.innerHTML = '❌ ' + data.message;
      resultMessage.className = 'result-message error';
      resultDetails.innerHTML = '';
    }
  })
  .catch(error => {
    console.error('エラー:', error);
    
    // ネットワークエラーの表示
    resultMessage.innerHTML = '❌ 通信エラーが発生しました: ' + error;
    resultMessage.className = 'result-message error';
    resultDetails.innerHTML = '';
  });
}

function handleQualityChange() {
  const qualitySelect = document.getElementById('qualitySelect');
  const thumbnailCheck = document.getElementById('thumbnailCheck');
  const checkboxContainer = document.querySelector('.checkbox-container');

  if (!qualitySelect || !thumbnailCheck || !checkboxContainer) {
    return;
  }

  const isWav = qualitySelect.value === 'wav';
  thumbnailCheck.disabled = isWav;

  if (isWav) {
    thumbnailCheck.checked = false;
    checkboxContainer.classList.add('disabled');
    checkboxContainer.setAttribute('aria-disabled', 'true');
  } else {
    checkboxContainer.classList.remove('disabled');
    checkboxContainer.removeAttribute('aria-disabled');
  }
}