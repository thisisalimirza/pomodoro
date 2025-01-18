let timeLeft;
let timerId = null;
let isWorkTime = true;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const statusText = document.getElementById('status-text');
const modeToggleButton = document.getElementById('mode-toggle');
const WORK_TIME = 50 * 60; // 50 minutes in seconds
const REST_TIME = 10 * 60; // 10 minutes in seconds
const themeToggle = document.getElementById('theme-toggle');
const timerToggleButton = document.getElementById('timer-toggle');
let isDarkMode = false;

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
    
    // Update the display
    minutesDisplay.textContent = minutesStr;
    secondsDisplay.textContent = secondsStr;
    
    // Update the browser tab title only if timer is active
    document.title = timerId !== null 
        ? `${minutesStr}:${secondsStr} - Pomodoro Timer`
        : "Pomodoro Timer";
}

function switchMode() {
    isWorkTime = !isWorkTime;
    timeLeft = isWorkTime ? WORK_TIME : REST_TIME;
    statusText.textContent = isWorkTime ? 'Enter a Deep Work Session' : 'Take a break';
    modeToggleButton.textContent = isWorkTime ? 'Rest Mode' : 'Work Mode';
    updateTimer();
}

function toggleTimer() {
    if (timerId === null) {
        // Start timer
        if (!timeLeft) {
            timeLeft = isWorkTime ? WORK_TIME : REST_TIME;
        }
        timerId = setInterval(() => {
            timeLeft--;
            updateTimer();
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                timerId = null;
                switchMode();
                alert(isWorkTime ? 'Break is over! Time to work!' : 'Work session complete! Take a break!');
                timerToggleButton.textContent = 'Start';
            }
        }, 1000);
        timerToggleButton.textContent = 'Pause';
    } else {
        // Pause timer
        clearInterval(timerId);
        timerId = null;
        timerToggleButton.textContent = 'Start';
    }
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    isWorkTime = true;
    timeLeft = WORK_TIME;
    statusText.textContent = 'Enter a Deep Work Session';
    modeToggleButton.textContent = 'Switch to Break';
    timerToggleButton.textContent = 'Start Focus Session';
    document.title = "Pomodoro Timer";
    updateTimer();
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    themeToggle.textContent = isDarkMode ? '🌞' : '🌜';
    
    // Save preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

modeToggleButton.addEventListener('click', () => {
    switchMode();
    if (timerId !== null) {
        pauseTimer();
    }
});

timerToggleButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', resetTimer);
themeToggle.addEventListener('click', toggleTheme);

// Initialize the timer
resetTimer();

// Add this to initialize theme from localStorage
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        isDarkMode = savedTheme === 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.textContent = isDarkMode ? '🌞' : '🌜';
    }
}

// Call initializeTheme before resetTimer()
initializeTheme(); 