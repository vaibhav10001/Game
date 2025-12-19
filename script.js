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
// Flag to track if user has interacted (required for autoplay)
let userInteracted = false;

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
        console.log('User interacted:', userInteracted);
        
        // Force play the video (muted for autoplay)
        const playPromise = videoPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise.then(function() {
                console.log('✅ Video playing successfully!');
                // Unmute the video after it starts playing so sound comes
                setTimeout(function() {
                    videoPlayer.muted = false;
                    console.log('🔊 Video unmuted - sound enabled');
                }, 1000); // Delay to ensure playback has started
            }).catch(function(error) {
                console.error('❌ Autoplay prevented:', error);
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                
                // If autoplay is blocked, try to enable it through user interaction simulation
                if (!userInteracted) {
                    console.log('⚠️ No user interaction yet, trying to enable...');
                    enableAutoplay();
                    // Wait a bit and try again
                    setTimeout(function() {
                        playVideo();
                    }, 500);
                    return;
                }
                
                // Try again with retry logic
                let attempts = 0;
                const maxAttempts = 10;
                
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
                            }, 1000);
                        }).catch(function(err) {
                            console.log('❌ Play attempt ' + attempts + ' failed:', err);
                            if (attempts < maxAttempts) {
                                setTimeout(retryPlay, 200);
                            } else {
                                console.error('All autoplay attempts failed');
                            }
                        });
                    }
                };
                
                setTimeout(retryPlay, 200);
            });
        } else {
            // Fallback for older browsers
            videoPlayer.play();
            // Unmute after play
            setTimeout(function() {
                videoPlayer.muted = false;
            }, 1000);
        }
    } else {
        // Wait a bit more if video is not ready
        console.log('⏳ Video not ready yet (readyState:', videoPlayer.readyState + '), waiting...');
        setTimeout(function() {
            playVideo();
        }, 100);
    }
}

// Capture user interaction early to enable autoplay
function enableAutoplay() {
    if (!userInteracted) {
        userInteracted = true;
        console.log('✅ User interaction detected - autoplay enabled');
        
        // Hide the hint message
        const hint = document.getElementById('loader-hint');
        if (hint) {
            hint.style.opacity = '0';
            hint.style.transition = 'opacity 0.5s';
            setTimeout(function() {
                hint.style.display = 'none';
            }, 500);
        }
        
        // Try to play and pause immediately to "unlock" autoplay
        // This tricks the browser into thinking user wants to play
        videoPlayer.muted = true;
        const testPlay = videoPlayer.play();
        if (testPlay !== undefined) {
            testPlay.then(function() {
                videoPlayer.pause();
                console.log('Autoplay capability unlocked');
            }).catch(function(err) {
                console.log('Could not unlock autoplay:', err);
            });
        }
    }
}

// Listen for any user interaction to enable autoplay
function handleUserInteraction() {
    enableAutoplay();
    // Also try to play video immediately if loader is done
    if (loaderContainer.classList.contains('hidden') && videoPlayer.paused) {
        videoPlayer.muted = true;
        videoPlayer.play().then(function() {
            setTimeout(function() {
                videoPlayer.muted = false;
            }, 500);
        }).catch(function(err) {
            console.log('Play on interaction failed:', err);
        });
    }
}

document.addEventListener('click', handleUserInteraction);
document.addEventListener('touchstart', handleUserInteraction);
document.addEventListener('keydown', handleUserInteraction);
// Also make loader clickable
loaderContainer.addEventListener('click', handleUserInteraction);
loaderContainer.addEventListener('touchstart', handleUserInteraction);

// Show loader for 4-5 seconds, then show video
window.addEventListener('DOMContentLoaded', function() {
    // Initialize video in the background
    initVideo();
    
    // Try to programmatically enable autoplay by simulating interaction
    // Some browsers allow this if done early enough
    setTimeout(function() {
        // Try to trigger autoplay capability
        try {
            // Create a synthetic click event on the document
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(clickEvent);
            enableAutoplay();
        } catch(e) {
            console.log('Could not simulate interaction:', e);
        }
    }, 200);
    
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
            console.log('User interacted:', userInteracted);
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

// Additional click handler for video container (if user clicks on video area)
videoContainer.addEventListener('click', function() {
    if (videoPlayer.paused && loaderContainer.classList.contains('hidden')) {
        videoPlayer.muted = true;
        videoPlayer.play().then(function() {
            setTimeout(function() {
                videoPlayer.muted = false;
            }, 500);
        }).catch(function(error) {
            console.log('Play error on video container click:', error);
        });
    }
});

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

