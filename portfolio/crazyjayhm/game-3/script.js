var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var statusText = document.getElementById("status");
var resetBtn = document.getElementById("resetBtn");

// 定義4種電線顏色：紅、綠、藍、橙
var colors = ["#ff4757", "#2ed573", "#1e90ff", "#ffa502"];
var nodes = [];
var connections = [];
var isDragging = false;
var dragStartNode = null;
var mouseX = 0;
var mouseY = 0;

// 初始化/重設遊戲
function initGame() {
    nodes = [];
    connections = [];
    statusText.innerText = "請把相同顏色的圓點連起來！";
    statusText.style.color = "#fbc531";

    var leftColors = colors.slice();
    var rightColors = colors.slice();

    // 將右邊的顏色打亂
    rightColors.sort(function() { return Math.random() - 0.5; });

    // 建立左右兩邊的插頭
    for (var i = 0; i < 4; i++) {
        // 左邊節點
        nodes.push({
            x: 100, y: 80 + i * 80,
            color: leftColors[i],
            type: "left", id: "L" + i,
            connected: false
        });
        // 右邊節點
        nodes.push({
            x: 500, y: 80 + i * 80,
            color: rightColors[i],
            type: "right", id: "R" + i,
            connected: false
        });
    }
    draw();
}

// 繪製畫面
function draw() {
    // 清除畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 畫出已經成功連接的電線
    for (var i = 0; i < connections.length; i++) {
        var conn = connections[i];
        ctx.beginPath();
        ctx.moveTo(conn.start.x, conn.start.y);
        ctx.lineTo(conn.end.x, conn.end.y);
        ctx.strokeStyle = conn.start.color;
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.stroke();
    }

    // 畫出正在拖拉中的電線
    if (isDragging && dragStartNode) {
        ctx.beginPath();
        ctx.moveTo(dragStartNode.x, dragStartNode.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = dragStartNode.color;
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.stroke();
    }

    // 畫出所有插頭圓點
    for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        
        // 外圈顏色
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        
        // 內圈中心黑洞（扮插座）
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#2f3640";
        ctx.fill();
    }
}

// 當撳下滑鼠/螢幕
canvas.addEventListener("mousedown", function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;

    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var dx = mx - node.x;
        var dy = my - node.y;
        // 如果點擊位置喺圓點範圍內
        if (Math.sqrt(dx * dx + dy * dy) < 25) {
            if (!node.connected) {
                isDragging = true;
                dragStartNode = node;
                mouseX = mx;
                mouseY = my;
                break;
            }
        }
    }
});

// 當移動滑鼠/拖拉
canvas.addEventListener("mousemove", function(e) {
    if (isDragging) {
        var rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        draw(); // 即時更新線條位置
    }
});

// 當放開滑鼠
canvas.addEventListener("mouseup", function(e) {
    if (isDragging) {
        isDragging = false;
        var rect = canvas.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        var targetNode = null;

        // 檢查放開時有冇對準任何圓點
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var dx = mx - node.x;
            var dy = my - node.y;
            if (Math.sqrt(dx * dx + dy * dy) < 30) {
                targetNode = node;
                break;
            }
        }

        // 判斷連接是否正確：不同節點 + 一左一右 + 顏色相同 + 未被連接
        if (targetNode && 
            targetNode.id !== dragStartNode.id && 
            targetNode.type !== dragStartNode.type && 
            targetNode.color === dragStartNode.color &&
            !targetNode.connected) {
            
            // 成功連接
            connections.push({
                start: dragStartNode,
                end: targetNode
            });
            dragStartNode.connected = true;
            targetNode.connected = true;

            // 檢查是否贏得遊戲
            if (connections.length === 4) {
                statusText.innerText = "🎉 挑戰成功！所有線路已接通！";
                statusText.style.color = "#4cd137";
            }
        }
        
        dragStartNode = null;
        draw(); // 重新繪製畫面（如果連錯，條線就會消失）
    }
});

// 綁定重新開始按鈕
resetBtn.addEventListener("click", initGame);

// 啟動遊戲
initGame();