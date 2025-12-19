// Video URL (MP4 file)
const videoUrl = 'raw.mp4';

// Get DOM elements
const loaderContainer = document.getElementById('loader-container');
const videoContainer = document.getElementById('video-container');
const videoPlayer = document.getElementById('video-player');

// Flag to track if video is ready
let videoReady = false;

// Initialize video player
function initVideo() {
    // Ensure video is muted for autoplay
    videoPlayer.muted = true;
    
    // Ensure video is paused initially
    videoPlayer.pause();
    
    // Set video source directly for MP4 files
    videoPlayer.src = videoUrl;
    
    // Preload video
    videoPlayer.preload = 'auto';
    
    // Load the video
    videoPlayer.load();
    
    // Handle when video is loaded and ready
    videoPlayer.addEventListener('loadedmetadata', function() {
        console.log('Video metadata loaded successfully');
        // Ensure it's paused
        videoPlayer.pause();
    });
    
    videoPlayer.addEventListener('canplay', function() {
        console.log('Video can start playing');
        videoReady = true;
        // Ensure it's paused until loader finishes
        if (!loaderContainer.classList.contains('hidden')) {
            videoPlayer.pause();
        }
    });
    
    videoPlayer.addEventListener('loadeddata', function() {
        console.log('Video data loaded');
        // Ensure it's paused
        videoPlayer.pause();
    });
    
}

// Function to play video
function playVideo() {
    // Ensure video is muted for autoplay (required by browsers)
    videoPlayer.muted = true;
    
    // Check if loader is hidden before playing
    if (!loaderContainer.classList.contains('hidden') || playBlocked) {
        // Wait a bit more
        setTimeout(function() {
            playVideo();
        }, 100);
        return;
    }
    
    // Check if video is ready
    if (videoReady || videoPlayer.readyState >= 2) {
        console.log('Attempting to play video...');
        
        // Force play the video (muted for autoplay)
        const playPromise = videoPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise.then(function() {
                console.log('Video playing successfully');
                // Unmute the video after it starts playing so sound comes
                setTimeout(function() {
                    videoPlayer.muted = false;
                    console.log('Video unmuted - sound enabled');
                }, 500); // Small delay to ensure playback has started
            }).catch(function(error) {
                console.log('Autoplay prevented:', error);
                // Try again after a short delay with multiple attempts
                let attempts = 0;
                const maxAttempts = 3;
                
                const retryPlay = function() {
                    attempts++;
                    if (attempts <= maxAttempts) {
                        videoPlayer.muted = true;
                        videoPlayer.play().then(function() {
                            // Unmute after successful play
                            setTimeout(function() {
                                videoPlayer.muted = false;
                            }, 500);
                        }).catch(function(err) {
                            console.log('Play attempt ' + attempts + ' failed:', err);
                            if (attempts < maxAttempts) {
                                setTimeout(retryPlay, 500);
                            }
                        });
                    }
                };
                
                setTimeout(retryPlay, 500);
            });
        } else {
            // Fallback for older browsers
            videoPlayer.play();
            // Unmute after play
            setTimeout(function() {
                videoPlayer.muted = false;
            }, 500);
        }
    } else {
        // Wait a bit more if video is not ready
        console.log('Video not ready yet, waiting...');
        setTimeout(function() {
            playVideo();
        }, 200);
    }
}

// Show loader for 4-5 seconds, then show video
window.addEventListener('DOMContentLoaded', function() {
    // Initialize video in the background
    initVideo();
    
    // Continuously check and pause video if loader is visible
    const pauseCheckInterval = setInterval(function() {
        if (!loaderContainer.classList.contains('hidden')) {
            if (!videoPlayer.paused) {
                videoPlayer.pause();
            }
        } else {
            clearInterval(pauseCheckInterval);
        }
    }, 100);
    
    // Hide loader and show video after 4.5 seconds
    setTimeout(function() {
        loaderContainer.classList.add('hidden');
        playBlocked = false; // Allow video to play now
        
        // Small delay before showing video for smooth transition
        setTimeout(function() {
            videoContainer.classList.add('show');
            
            // Ensure video is muted for autoplay (browser requirement)
            videoPlayer.muted = true;
            
            // Now play the video
            playVideo();
        }, 100);
    }, 4500); // 4.5 seconds
});

// Handle video play errors
videoPlayer.addEventListener('error', function(e) {
    console.error('Video error:', e);
    console.error('Error details:', videoPlayer.error);
    if (videoPlayer.error) {
        console.error('Error code:', videoPlayer.error.code);
        console.error('Error message:', videoPlayer.error.message);
    }
});

// Fallback: Ensure video plays when user interacts (for autoplay restrictions)
// This is only a fallback if autoplay fails
document.addEventListener('click', function() {
    if (videoPlayer.paused && !loaderContainer.classList.contains('hidden')) {
        // Don't play if loader is still visible
        return;
    }
    if (videoPlayer.paused) {
        videoPlayer.muted = true; // Start muted
        videoPlayer.play().then(function() {
            // Unmute after play starts
            setTimeout(function() {
                videoPlayer.muted = false;
            }, 300);
        }).catch(function(error) {
            console.log('Play error:', error);
        });
    }
}, { once: true });

// Prevent video from playing until loader is done
videoPlayer.addEventListener('canplaythrough', function() {
    // Don't auto-play, wait for loader to finish
    if (!loaderContainer.classList.contains('hidden')) {
        videoPlayer.pause();
    }
});

// Block play events only when loader is visible
let playBlocked = true; // Start with play blocked

videoPlayer.addEventListener('play', function(e) {
    if (playBlocked && !loaderContainer.classList.contains('hidden')) {
        e.preventDefault();
        videoPlayer.pause();
    }
});

// Allow play after loader is hidden
setTimeout(function() {
    playBlocked = false;
}, 4500);

