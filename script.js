let timeLeft;
let timerId = null;
let isWorkTime = true;
let isDarkMode = false;
let currentFocus = '';
let currentSound = null;
let currentSoundLoop = null;
let currentVolume = 0.3;

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
const soundControlToggle = document.getElementById('sound-control-toggle');
const soundControlPanel = document.getElementById('sound-control-panel');
const volumeSlider = document.getElementById('volume-slider');

// Sound URLs - using local sound files
const SOUND_URLS = {
    rain: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3',
    waves: 'https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3',
    fireplace: 'https://assets.mixkit.co/active_storage/sfx/2271/2271-preview.mp3',
    birds: 'sounds/Morning Bird Songs.mp3',
    katydids: 'sounds/Katydids in the Night.mp3',
    crickets: 'sounds/Crickets and Woodpecker at Dusk.mp3',
    winter: 'sounds/Cold Winter Snow and Wind.mp3',
    brook: 'sounds/Babbling Brook.mp3'
};

const soundOptions = document.querySelectorAll('.sound-option');
soundOptions.forEach(option => {
    option.addEventListener('click', () => {
        const soundType = option.getAttribute('data-sound');
        playBackgroundSound(soundType);
    });
});

function playBackgroundSound(soundType) {
    // Stop any currently playing sound
    if (currentSound) {
        currentSound.pause();
        currentSound = null;
    }
    if (currentSoundLoop) {
        clearInterval(currentSoundLoop);
        currentSoundLoop = null;
    }

    // If 'none' is selected or no sound type provided, just return
    if (!soundType || soundType === 'none') return;

    // Create and play the new sound
    const soundUrl = SOUND_URLS[soundType];
    if (soundUrl) {
        currentSound = new Audio(soundUrl);
        currentSound.volume = currentVolume;
        currentSound.dataset.soundType = soundType;
        
        // Play the sound and set up looping
        const playSound = () => {
            currentSound.currentTime = 0;
            currentSound.play();
        };
        
        playSound();
        currentSoundLoop = setInterval(playSound, 4000);

        // Update the radio button in the control panel
        const radioButton = document.querySelector(`input[name="background-sound-control"][value="${soundType}"]`);
        if (radioButton) {
            radioButton.checked = true;
        }
    }
}

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
    soundControlToggle.style.display = 'flex';
    
    // Resume audio if it was previously playing
    if (currentSound && currentSound.dataset.soundType) {
        playBackgroundSound(currentSound.dataset.soundType);
    }
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
    if (currentSound) {
        currentSound.pause();
        currentSound = null;
    }
    if (currentSoundLoop) {
        clearInterval(currentSoundLoop);
        currentSoundLoop = null;
    }
    updateStatusText();
    modeToggleButton.textContent = 'Switch to Break';
    timerToggleButton.textContent = 'Start Focus Session';
    addTimeButton.style.display = 'none';
    updateTimer();
    soundControlToggle.style.display = 'none';  // Hide sound control on reset
    soundControlPanel.close();  // Close sound panel if open
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

// Modify the focus modal form submit handler
focusModal.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    currentFocus = focusInput.value.trim();
    const selectedSound = focusModal.querySelector('input[name="background-sound"]:checked').value;
    focusInput.value = '';
    focusModal.close();
    updateStatusText();
    if (!currentSound || selectedSound !== currentSound.dataset.soundType) {
        playBackgroundSound(selectedSound);
    }
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
    soundControlToggle.style.display = 'none';
    soundControlPanel.close();
    
    // Pause the audio if it's playing
    if (currentSound) {
        currentSound.pause();
        clearInterval(currentSoundLoop);
        currentSoundLoop = null;
    }
}

// Add event listeners for sound controls
soundControlToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    soundControlPanel.showModal();
});

// Close panel when clicking outside
soundControlPanel.addEventListener('click', (e) => {
    const rect = soundControlPanel.getBoundingClientRect();
    const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.bottom &&
        rect.left <= e.clientX && e.clientX <= rect.right);
    if (!isInDialog) {
        soundControlPanel.close();
    }
});

// Handle volume changes
volumeSlider.addEventListener('input', (e) => {
    updateVolume(e.target.value);
});

// Handle sound changes from control panel
document.querySelectorAll('input[name="background-sound-control"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const soundType = e.target.value;
        playBackgroundSound(soundType);
        
        // Update the radio button in the modal
        const modalRadio = document.querySelector(`input[name="background-sound"][value="${soundType}"]`);
        if (modalRadio) {
            modalRadio.checked = true;
        }
    });
});

// Add this function to update the volume
function updateVolume(value) {
    currentVolume = value / 100;
    if (currentSound) {
        currentSound.volume = currentVolume;
    }
}