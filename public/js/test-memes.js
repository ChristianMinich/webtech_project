var socket = io();

function toggleImages() {
    var container = document.getElementById('imageContainer');
    container.classList.toggle('show');

    if (container.classList.contains('show')) {
        // Request image sources from the server
        //socket.emit('getImages');
        console.log("hello there");
        // Clear existing content
        container.innerHTML = '';

        // Receive image sources from the server
        socket.on('imageSources', function (imageSources) {
            imageSources.forEach(function (source) {
                var img = document.createElement('img');
                img.src = "source";
                img.alt = 'Image';

                container.appendChild(img);
            });
        });
    }
}

// Function to open the overlay
function openOverlay() {
    var overlay = document.getElementById('overlay');
    overlay.classList.add('show');
  }
  
  // Function to close the overlay
  function closeOverlay(event) {
    var overlay = document.getElementById('overlay');
    if (event.target === overlay) {
      overlay.classList.remove('show');
      pauseVideos();
    }
  }
  
  // Function to pause all videos
  function pauseVideos() {
    var videos = document.querySelectorAll('.modal video');
    videos.forEach(function(video) {
      video.pause();
      video.currentTime = 0;
    });
  }
  
  // Function to play/pause videos on hover
  function attachHoverListeners() {
    var videos = document.querySelectorAll('.modal video');
    videos.forEach(function(video) {
      video.addEventListener('mouseover', function() {
        this.play();
      });
      video.addEventListener('mouseout', function() {
        this.pause();
        this.currentTime = 0;
      });
    });
  }
  
  // Check if all videos are loaded before attaching hover listeners
  function checkVideosLoaded() {
    var videos = document.querySelectorAll('.modal video');
    var loadedCount = 0;
  
    function videoLoaded() {
      loadedCount++;
      if (loadedCount === videos.length) {
        attachHoverListeners();
      }
    }
  
    videos.forEach(function(video) {
      video.addEventListener('loadeddata', videoLoaded);
      if (video.readyState >= 3) {
        videoLoaded();
      }
    });
  }
  
  // Attach event listeners to open/close the overlay
  var overlay = document.getElementById('overlay');
  overlay.addEventListener('click', closeOverlay);
  
  // Check if the DOM is loaded before checking videos loaded
  document.addEventListener('DOMContentLoaded', checkVideosLoaded);
  
  
  






