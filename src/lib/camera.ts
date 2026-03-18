import jsQR from 'jsqr';

let stream: MediaStream | null = null;
let rafId: number | null = null;
let lastDetected: string | null = null;
let cooldown = false;

export function stopCamera() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
}

export async function startQRScanner(
  videoEl: HTMLVideoElement,
  canvasEl: HTMLCanvasElement,
  onDetect: (data: string) => void
) {
  stopCamera();
  lastDetected = null;
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
  });
  videoEl.srcObject = stream;
  await videoEl.play();
  const ctx = canvasEl.getContext('2d')!;

  function scan() {
    if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      ctx.drawImage(videoEl, 0, 0);
      const img = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
      if (code && code.data && !cooldown && code.data !== lastDetected) {
        lastDetected = code.data;
        cooldown = true;
        // Draw detection box
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
        ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
        ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
        ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
        ctx.closePath();
        ctx.stroke();
        onDetect(code.data);
        setTimeout(() => { cooldown = false; lastDetected = null; }, 3000);
      }
    }
    rafId = requestAnimationFrame(scan);
  }
  scan();
}

export function capturePhoto(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result as string);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

export function pickFromGallery(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result as string);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}
