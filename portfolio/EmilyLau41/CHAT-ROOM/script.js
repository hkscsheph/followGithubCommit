// ❌ 錯誤示範：這會導致全網頁無法輸入
window.onkeydown = (e) => {
  e.preventDefault(); 
};

// ✅ 正確示範：只針對 Enter 鍵處理，且不阻斷輸入文字
msgInput.onkeydown = (e) => {
  if (e.key === 'Enter') {
      handleSend();
  }
  // 不要在這裡寫 e.preventDefault()，除非你非常確定要擋掉某個鍵
};
