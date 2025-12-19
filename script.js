// Video URL (MP4 file)
const videoUrl = 'raw.mp4';

// Get DOM elements
const loaderContainer = document.getElementById('loader-container');
const videoContainer = document.getElementById('video-container');
const videoPlayer = document.getElementById('video-player');

// Flag to track if video is ready
let videoReady = false;
// Flag to block play until loader is done
let playBlocked = true; // Start with play blocked

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
    // Check if loader is still visible or play is blocked
    // If loader doesn't have 'hidden' class, it's still visible - wait
    if (!loaderContainer.classList.contains('hidden') || playBlocked) {
        // Wait a bit more
        setTimeout(function() {
            playVideo();
        }, 50);
        return;
    }
    
    // Ensure video is muted for autoplay (required by browsers)
    videoPlayer.muted = true;
    
    // Check if video is ready
    if (videoReady || videoPlayer.readyState >= 2 || videoPlayer.readyState >= 1) {
        console.log('Video ready, attempting autoplay...');
        console.log('Video readyState:', videoPlayer.readyState);
        
        // Force play the video (muted for autoplay)
        const playPromise = videoPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise.then(function() {
                console.log('✅ Video playing successfully!');
                // Unmute the video after it starts playing so sound comes
                setTimeout(function() {
                    videoPlayer.muted = false;
                    console.log('🔊 Video unmuted - sound enabled');
                }, 800); // Delay to ensure playback has started
            }).catch(function(error) {
                console.error('❌ Autoplay prevented:', error);
                // Try again immediately with retry logic
                let attempts = 0;
                const maxAttempts = 5;
                
                const retryPlay = function() {
                    attempts++;
                    console.log('Retry attempt:', attempts);
                    if (attempts <= maxAttempts) {
                        videoPlayer.muted = true;
                        videoPlayer.play().then(function() {
                            console.log('✅ Video playing on retry attempt', attempts);
                            // Unmute after successful play
                            setTimeout(function() {
                                videoPlayer.muted = false;
                            }, 800);
                        }).catch(function(err) {
                            console.log('❌ Play attempt ' + attempts + ' failed:', err);
                            if (attempts < maxAttempts) {
                                setTimeout(retryPlay, 300);
                            } else {
                                console.error('All autoplay attempts failed');
                            }
                        });
                    }
                };
                
                setTimeout(retryPlay, 300);
            });
        } else {
            // Fallback for older browsers
            videoPlayer.play();
            // Unmute after play
            setTimeout(function() {
                videoPlayer.muted = false;
            }, 800);
        }
    } else {
        // Wait a bit more if video is not ready
        console.log('⏳ Video not ready yet (readyState:', videoPlayer.readyState + '), waiting...');
        setTimeout(function() {
            playVideo();
        }, 100);
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
        // Unblock play first
        playBlocked = false;
        loaderContainer.classList.add('hidden');
        
        // Small delay before showing video for smooth transition
        setTimeout(function() {
            videoContainer.classList.add('show');
            
            // Ensure video is muted for autoplay (browser requirement)
            videoPlayer.muted = true;
            
            // Force play the video immediately
            console.log('Loader finished, starting video playback...');
            playVideo();
        }, 50); // Reduced delay for faster response
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

// Fallback: Only if autoplay completely fails, allow click to play
// This should rarely be needed if autoplay works
document.addEventListener('click', function() {
    // Only as last resort if video is still paused after loader
    if (videoPlayer.paused && loaderContainer.classList.contains('hidden')) {
        videoPlayer.muted = true;
        videoPlayer.play().then(function() {
            setTimeout(function() {
                videoPlayer.muted = false;
            }, 300);
        }).catch(function(error) {
            console.log('Play error on click:', error);
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
videoPlayer.addEventListener('play', function(e) {
    // Only block if loader is still visible
    if (playBlocked && !loaderContainer.classList.contains('hidden')) {
        videoPlayer.pause();
    }
});

