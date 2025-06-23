/*import type { initHBOTScene } from '../scene/hbotScene';

let intervalId: number | null = null;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export function startRealtimeMode(sceneRef: HBotScene) {
  if (intervalId) return;

  const { endEffector, xRail, yRail, dynamicXAxis, workAreaSize } = sceneRef;

  intervalId = setInterval(async () => {
    const rawData = document.getElementById('rawData');
    const coordX = document.getElementById('coordX');
    const coordY = document.getElementById('coordY');
    const coordZ = document.getElementById('coordZ');

    try {
      const res = await fetch('/robots/latest/HBOT');
      const data = await res.json();

      rawData!.innerHTML = `
        X: ${data.position_x}<br>
        Y: ${data.position_y}<br>
        Z: ${data.position_z}
      `;

      const posX = mapRange(clamp(data.position_x, -600, 600), -600, 600, -workAreaSize.x / 2, workAreaSize.x / 2);
      const posY = mapRange(clamp(data.position_z, -600, 600), -600, 600, -workAreaSize.y / 2, workAreaSize.y / 2);
      const posZ = mapRange(clamp(data.position_y, -600, 600), -600, 600, -workAreaSize.z / 2, workAreaSize.z / 2);

      endEffector.position.set(posX, posY, posZ);
      xRail.position.x = posX;

      const deltaY = xRail.position.y - posY;
      yRail.scale.y = Math.abs(deltaY);
      yRail.position.set(posX, (xRail.position.y + posY) / 2, posZ);

      const xLength = posX + workAreaSize.x / 2;
      dynamicXAxis.scale.set(xLength, 1, 1);
      dynamicXAxis.position.set(-workAreaSize.x / 2 + xLength / 2, workAreaSize.y / 2, workAreaSize.z / 2);

      coordX!.textContent = `X: ${posX.toFixed(2)}`;
      coordY!.textContent = `Y: ${posY.toFixed(2)}`;
      coordZ!.textContent = `Z: ${posZ.toFixed(2)}`;
    } catch (e) {
      console.error('Error en fetch:', e);
    }
  }, 100);
}

export function stopRealtimeMode() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}*/
