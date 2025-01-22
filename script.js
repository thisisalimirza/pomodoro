let timeLeft;
let timerId = null;
let isWorkTime = true;
let isDarkMode = false;
let currentFocus = '';
let currentSound = null;
let currentSoundLoop = null;
let currentVolume = 0.3;
let streak = 0;
let currentYouTubePlayer = null;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const statusText = document.getElementById('status-text');
const modeToggleButton = document.getElementById('mode-toggle');
const streakNumber = document.getElementById('streak-number');
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

// Sound URLs - Brain wave frequencies and nature sounds
const SOUND_URLS = {
    deep: '5lN3X5qVoqQ',      // Beta waves for focus
    creative: 'BK307tqe5q0',   // Theta waves for creativity
    chill: 'WPni755-Krg',      // Alpha waves for relaxed focus
    nature_birds: 'sounds/Morning Bird Songs.mp3',
    nature_crickets: 'sounds/Crickets and Woodpecker at Dusk.mp3',
    nature_brook: 'sounds/Babbling Brook.mp3',
    nature_wind: 'sounds/Cold Winter Snow and Wind.mp3',
    nature_katydids: 'sounds/Katydids in the Night.mp3',
    none: null
};

// Load YouTube IFrame API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const soundOptions = document.querySelectorAll('.sound-option');
soundOptions.forEach(option => {
    option.addEventListener('click', () => {
        const soundType = option.getAttribute('data-sound');
        playBackgroundSound(soundType);
    });
});

function playBackgroundSound(soundType, shouldResume = false) {
    // If we're resuming and have a player/sound already, just resume it
    if (shouldResume) {
        if (currentYouTubePlayer && currentYouTubePlayer.playVideo) {
            currentYouTubePlayer.playVideo();
            return;
        }
        if (currentSound) {
            currentSound.play().catch(error => {
                console.error('Error resuming sound:', error);
            });
            return;
        }
    }

    // Stop any currently playing sound
    if (currentSound) {
        currentSound.pause();
        currentSound = null;
    }
    if (currentYouTubePlayer) {
        currentYouTubePlayer.destroy();
        currentYouTubePlayer = null;
    }
    if (currentSoundLoop) {
        clearInterval(currentSoundLoop);
        currentSoundLoop = null;
    }

    // If 'none' is selected or no sound type provided, just return
    if (!soundType || soundType === 'none') return;

    const soundUrl = SOUND_URLS[soundType];
    if (!soundUrl) return;

    // Check if it's a local sound file (starts with 'sounds/')
    if (soundUrl.startsWith('sounds/')) {
        currentSound = new Audio(soundUrl);
        currentSound.volume = currentVolume;
        currentSound.loop = true;
        currentSound.dataset.soundType = soundType;
        
        currentSound.play().catch(error => {
            console.error('Error playing sound:', error);
        });
    } else {
        // It's a YouTube video ID
        const playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player';
        playerDiv.style.display = 'none';
        document.body.appendChild(playerDiv);

        currentYouTubePlayer = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: soundUrl,
            playerVars: {
                'autoplay': 1,
                'loop': 1,
                'playlist': soundUrl,
                'controls': 0
            },
            events: {
                'onReady': (event) => {
                    event.target.setVolume(currentVolume * 100);
                    event.target.playVideo();
                }
            }
        });
    }

    // Update the radio button in the control panel
    const radioButton = document.querySelector(`input[name="background-sound-control"][value="${soundType}"]`);
    if (radioButton) {
        radioButton.checked = true;
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

function stopAllAudio() {
    if (currentSound) {
        currentSound.pause();
        currentSound = null;
    }
    if (currentYouTubePlayer) {
        currentYouTubePlayer.stopVideo();
        currentYouTubePlayer.destroy();
        currentYouTubePlayer = null;
    }
    if (currentSoundLoop) {
        clearInterval(currentSoundLoop);
        currentSoundLoop = null;
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
            if (isWorkTime) {
                // Only increment streak when completing a work session
                incrementStreak();
            }
            stopAllAudio(); // Stop audio when timer completes
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
    if (currentSound || currentYouTubePlayer) {
        const currentSoundType = currentSound?.dataset?.soundType || 
            document.querySelector('input[name="background-sound-control"]:checked')?.value;
        if (currentSoundType) {
            playBackgroundSound(currentSoundType, true);
        }
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
    resetStreak();
    stopAllAudio();
    updateStatusText();
    modeToggleButton.textContent = 'Switch to Break';
    timerToggleButton.textContent = 'Start Focus Session';
    addTimeButton.style.display = 'none';
    updateTimer();
    soundControlToggle.style.display = 'none';
    soundControlPanel.close();
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
    soundControlPanel.close();
});

// Add this new function to handle pausing
function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
    timerToggleButton.textContent = 'Start';
    addTimeButton.style.display = 'none';
    soundControlToggle.style.display = 'none';
    soundControlPanel.close();
    
    // Pause any playing audio
    if (currentSound) {
        currentSound.pause();
    }
    if (currentYouTubePlayer && currentYouTubePlayer.pauseVideo) {
        currentYouTubePlayer.pauseVideo();
    }
    if (currentSoundLoop) {
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
    if (currentYouTubePlayer && currentYouTubePlayer.setVolume) {
        currentYouTubePlayer.setVolume(value);
    }
}

function updateStreak() {
    streakNumber.textContent = streak;
    localStorage.setItem('pomodoro-streak', streak.toString());
}

function loadStreak() {
    const savedStreak = localStorage.getItem('pomodoro-streak');
    if (savedStreak) {
        streak = parseInt(savedStreak, 10);
        updateStreak();
    }
}

function incrementStreak() {
    streak++;
    updateStreak();
}

function resetStreak() {
    streak = 0;
    updateStreak();
}

// Load streak when the page loads
loadStreak();