// 首先，透過 id 找到我們在 HTML 中建立的棋盤容器
const chessboard = document.getElementById('chessboard');

// 我們需要 8x8=64 個格子，所以用一個迴圈跑 64 次
for (let i = 0; i < 64; i++) {
  
  // 1. 建立一個新的 <div> 元素，這就是每一個小方格
  const square = document.createElement('div');
  
  // 2. 計算這個格子在第幾行 (row) 第幾列 (col)
  // Math.floor 是取整數，% 是取餘數
  const row = Math.floor(i / 8);
  const col = i % 8;
  
  // 3. 判斷這個格子應該是深色還是淺色
  // 如果 (行+列) 是偶數，就給它淺色；如果是奇數，就給它深色
  if ((row + col) % 2 === 0) {
    square.classList.add('light'); // 加上 'light' class
  } else {
    square.classList.add('dark'); // 加上 'dark' class
  }
  
  // 4. 最後，把這個建立好的方格，放進棋盤容器裡
  chessboard.appendChild(square);
}