var width = 320;
var height = 0;
var streaming = false;
var video = null;
var canvas = null;
var photo = null;
var startbutton = null;
var okBtn = null;
var message = null;
var clearImage = false;
var dotdotInterval = null;

function onload() {
  okBtn = document.getElementById('okBtn');
  message = document.getElementById('message');
  startup();
  newBring()

  okBtn.addEventListener('click',() => {
    message.style.display = 'none';
    if (clearImage) {
      photo.style.display = 'none';
      clearImage = false;
    }
  });
}

function newBring() {
  photo.style.display = 'none';
}

function startup() {
  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  photo = document.getElementById('photo');
  startbutton = document.getElementById('startbutton');

  navigator.getMedia = ( navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);

  navigator.getMedia({
      video: true,
      audio: false
    },
    function(stream) {
      var vendorURL = window.URL || window.webkitURL;
      video.src = vendorURL.createObjectURL(stream);
      video.play();
    },
    function(err) {
      console.log("An error occured! " + err);
    }
  );

  video.addEventListener('canplay', function(ev){
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth/width);
    
      // Firefox currently has a bug where the height can't be read from
      // the video, so we will make assumptions if this happens.
    
      if (isNaN(height)) {
        height = width / (4/3);
      }
    
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  }, false);

  startbutton.addEventListener('click', function(ev){
    takepicture();
    ev.preventDefault();
  }, false);

}

function takepicture() {
  var context = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  context.drawImage(video, 0, 0, width, height);

  var data = canvas.toDataURL('image/png');
  photo.setAttribute('src', data);
  photo.style.height = video.offsetHeight;
  photo.style.display = "inline-block";

  showMessage('Detecting stuff. We can tell by the pixels o.0', true);
  
  var form = new FormData()
  form.append('pic', data);

  fetch("/sendpic", {
    method: "POST",
    body: form
  }).then((response) => {
    return response.json();
  }).then((features) => {
    console.log(features);
    var found = false;
    var text = features.labels.join(', ');
    showMessage(text);
    clearImage = true;
  }).catch((err) => {
    console.error('There was a problem :(');
    console.error(err);
    showMessage("Great, you broke it.");
    clearImage = true;
  });
}

function showMessage(text, dotdot) {
  var messageText = document.getElementById('message-text');
  messageText.innerText = text;
  message.style.display = 'inline-block';
  if (dotdotInterval) {
    clearInterval(dotdotInterval);
  }
  if (dotdot) {
    dotdotInterval = setInterval(() => {
      messageText.innerText = messageText.innerText + ".";
    }, 500);
  }
}

function hideMessage() {
  message.style.display = 'none';
  if (dotdotInterval) {
    clearInterval(dotdotInterval);
  }
}
