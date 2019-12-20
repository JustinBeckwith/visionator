let width = 320;
let height = 0;
let video;
let canvas;
let photo;
let streaming;
let message;
let dotdotInterval;
let ctx;
let handle;

window.onload = async () => {
  message = document.getElementById('message');
  video = document.getElementById('video');
  photo = document.getElementById('photo');
  const startbutton = document.getElementById('startbutton');
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true
  });
  video.srcObject = stream;
  await videoStart();

  video.addEventListener('canplay', ev => {
    if (!streaming) {
      height = video.videoHeight;
      width = video.videoWidth;
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  }, false);

  startbutton.addEventListener('click', async ev => {
    await takepicture();
    ev.preventDefault();
  }, false);

  document.body.onkeyup = async e => {
    // Take Picture on Spacebar
    if (e.keyCode === 32) {
      await takepicture();
    }
  };
};

async function takepicture () {
  const data = canvas.toDataURL('image/png');
  photo.setAttribute('src', data);
  photo.style.height = video.offsetHeight;

  await videoPause();

  showMessage('Detecting stuff. We can tell by the pixels o.0', true);

  const form = new window.FormData();
  form.append('pic', data);

  const res = await window.fetch('/sendpic', {
    method: 'POST',
    body: form
  });
  const features = await res.json();
  console.log(features);
  // show labels and text
  displayList(features.labelAnnotations, document.getElementById('labels'));
  displayList(features.textAnnotations, document.getElementById('text'));
  message.style.display = 'none';
  ctx.beginPath();
  ctx.strokeStyle = '#80ff80';
  ctx.fillStyle = '#80ff80';
  for (const face of features.faceAnnotations) {
    const startPoint = face.boundingPoly.vertices[face.boundingPoly.vertices.length - 1];
    console.log(startPoint);
    ctx.moveTo(startPoint.x, startPoint.y);
    for (const point of face.boundingPoly.vertices) {
      ctx.fillRect(point.x - 3, point.y - 3, 7, 7);
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }
  ctx.closePath();
  setTimeout(() => {
    console.log('wat');
    videoStart();
  }, 8134);
}

function showMessage (text, dotdot) {
  const messageText = document.getElementById('message-text');
  messageText.innerText = text;
  message.style.display = 'inline-block';
  if (dotdotInterval) {
    clearInterval(dotdotInterval);
  }
  if (dotdot) {
    dotdotInterval = setInterval(() => {
      messageText.innerText = messageText.innerText + '.';
    }, 500);
  }
}

function displayList (array, element) {
  element.innerHTML = '';
  for (let i = 0; i < array.length; i++) {
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(array[i].description));
    element.appendChild(li);
  }
}

async function videoStart () {
  await video.play();
  handle = setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
  }, 20);
}

async function videoPause () {
  if (handle) {
    clearInterval(handle);
  }
  await video.pause();
}
