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
const addTimeButton = document.getElementById('add-time');
const focusModal = document.getElementById('focus-modal');
const focusInput = document.getElementById('focus-input');
const closeModalButton = document.getElementById('close-modal');
let isDarkMode = false;
let currentFocus = '';

// Initially hide the button
addTimeButton.style.display = 'none';

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
        if (!timeLeft) {
            timeLeft = isWorkTime ? WORK_TIME : REST_TIME;
        }
        
        if (isWorkTime && !currentFocus) {
            focusModal.showModal();
            return;
        }
        
        startTimer();
    } else {
        pauseTimer();
    }
}

function startTimer() {
    timerId = setInterval(() => {
        timeLeft--;
        updateTimer();
        // Update document title with current time and focus
        if (isWorkTime && currentFocus) {
            document.title = `${minutesDisplay.textContent}:${secondsDisplay.textContent} - ${currentFocus}`;
        }
        
        if (timeLeft === 0) {
            clearInterval(timerId);
            timerId = null;
            switchMode();
            alert(isWorkTime ? 'Break is over! Time to work!' : 'Work session complete! Take a break!');
            timerToggleButton.textContent = 'Start';
            addTimeButton.style.display = 'none';
            currentFocus = ''; // Clear focus when timer ends
            updateStatusText();
        }
    }, 1000);
    timerToggleButton.textContent = 'Pause';
    addTimeButton.style.display = 'block';
}

function updateStatusText() {
    if (isWorkTime && currentFocus) {
        statusText.innerHTML = `Currently focusing on:<br><span class="current-focus">${currentFocus}</span>`;
        document.title = `${minutesDisplay.textContent}:${secondsDisplay.textContent} - ${currentFocus}`;
    } else {
        statusText.textContent = isWorkTime ? 'Enter a Deep Work Session' : 'Take a break';
        document.title = 'Pomodoro Timer';
    }
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    isWorkTime = true;
    timeLeft = WORK_TIME;
    currentFocus = '';
    updateStatusText();
    modeToggleButton.textContent = 'Switch to Break';
    timerToggleButton.textContent = 'Start Focus Session';
    addTimeButton.style.display = 'none';
    updateTimer();
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    themeToggle.textContent = isDarkMode ? '🌞' : '🌜';
    
    // Save preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

function addFiveMinutes() {
    if (timerId !== null) {  // Only allow adding time when timer is running
        timeLeft += 5 * 60;  // Add 5 minutes (300 seconds)
        updateTimer();
    }
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
addTimeButton.addEventListener('click', addFiveMinutes);

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

// Add event listener for the focus modal form
focusModal.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    currentFocus = focusInput.value.trim();
    focusInput.value = '';
    focusModal.close();
    updateStatusText();
    startTimer();
});

closeModalButton.addEventListener('click', () => {
    focusModal.close();
    focusInput.value = '';
});

// Add this new function to handle pausing
function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
    timerToggleButton.textContent = 'Start';
    addTimeButton.style.display = 'none';
} 