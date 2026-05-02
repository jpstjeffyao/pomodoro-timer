// 取得 DOM 元素
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const workBtn = document.getElementById('work-btn');
const breakBtn = document.getElementById('break-btn');
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

// 設定變數
let timer;
let isRunning = false;
let isWorkMode = true;
let timeLeft = 25 * 60; // 預設 25 分鐘 (以秒為單位)

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

// 更新顯示的時間格式 (MM:SS)
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    
    // 更新網頁標題以顯示剩餘時間
    const mode = isWorkMode ? '專注' : '休息';
    document.title = `(${minutesDisplay.textContent}:${secondsDisplay.textContent}) 平靜番茄鐘 - ${mode}`;
}

// 開始計時
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            // 時間到
            clearInterval(timer);
            isRunning = false;
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            
            // 播放提示音 (可選)
            playNotificationSound();
            
            // 自動切換模式
            if (isWorkMode) {
                setMode(false);
            } else {
                setMode(true);
            }
        }
    }, 1000);
}

// 暫停計時
function pauseTimer() {
    if (!isRunning) return;
    
    clearInterval(timer);
    isRunning = false;
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
}

// 重置計時
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    timeLeft = isWorkMode ? WORK_TIME : BREAK_TIME;
    updateDisplay();
}

// 切換模式 (專注 / 休息)
function setMode(workMode) {
    isWorkMode = workMode;
    
    // 更新按鈕樣式
    if (isWorkMode) {
        workBtn.classList.add('active');
        breakBtn.classList.remove('active');
        document.body.style.backgroundColor = 'var(--bg-color-work)';
        timeLeft = WORK_TIME;
    } else {
        breakBtn.classList.add('active');
        workBtn.classList.remove('active');
        document.body.style.backgroundColor = 'var(--bg-color-break)';
        timeLeft = BREAK_TIME;
    }
    
    resetTimer();
}

// 播放提示音效（使用 HTML5 Audio，可使用簡易的 Base64 聲音或預設）
function playNotificationSound() {
    // 這裡使用一個簡單的嗶聲
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine'; // 正弦波，聲音較為柔和
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // 440Hz (A4)
    oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 1);
}

// === 待辦事項功能 ===

// 新增待辦事項
function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;
    
    const li = document.createElement('li');
    li.className = 'task-item';
    
    // 建立核取方塊
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            li.classList.add('completed');
        } else {
            li.classList.remove('completed');
        }
    });
    
    // 建立文字節點
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = text;
    
    // 建立刪除按鈕
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.addEventListener('click', function() {
        li.remove();
    });
    
    // 組裝元素
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    
    // 加入列表並清空輸入框
    taskList.appendChild(li);
    taskInput.value = '';
}

// 事件監聽器設定
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

workBtn.addEventListener('click', () => setMode(true));
breakBtn.addEventListener('click', () => setMode(false));

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// 初始化顯示
updateDisplay();
