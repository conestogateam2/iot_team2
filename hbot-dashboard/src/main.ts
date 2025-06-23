import { initHBOTScene } from './scene/hbotScene.js';
import {localToUTCISOString, clamp, mapRange } from './functions/functions.js';

// References
const container3D = document.getElementById('three-container')!;
const coordX = document.getElementById('coordX')!;
const coordY = document.getElementById('coordY')!;
const coordZ = document.getElementById('coordZ')!;
const rawData = document.getElementById('rawData')!;
const fromInput = document.getElementById('fromTime') as HTMLInputElement;
const toInput = document.getElementById('toTime') as HTMLInputElement;
const startRepeatButton = document.getElementById('startRepeat') as HTMLButtonElement;

// Initialize scene
const {
  scene,
  camera,
  renderer,
  controls,
  elements,
  workAreaSize,
  topY
} = initHBOTScene(container3D);

let currentMode: 'realtime' | 'manual' | 'repeat' = 'realtime';
let fetchInterval: any = null;
let repeatData: any[] = [];
let repeatIndex = 0;
let repeatTimeout: any = null;

//Variables for manual simulation
const manualPosition = { x: 0, y: 0, z: 0 };
const stepSize = 0.1;



// Update Visual position
function updateRobotPosition(x: number, y: number, z: number) {
  elements.endEffector.position.set(x, y, z);
  elements.xRail.position.x = x;

  const deltaY = elements.xRail.position.y - y;
  elements.yRail.scale.y = Math.abs(deltaY);
  elements.yRail.position.set(x, (elements.xRail.position.y + y) / 2, z);

  const xLength = x + workAreaSize.x / 2;
  elements.dynamicXAxis.scale.set(xLength, 1, 1);
  elements.dynamicXAxis.position.set(-workAreaSize.x / 2 + xLength / 2, topY, workAreaSize.z / 2);

  coordX.textContent = `X: ${x.toFixed(2)}`;
  coordY.textContent = `Y: ${y.toFixed(2)}`;
  coordZ.textContent = `Z: ${z.toFixed(2)}`;
}

// Fetch realtime
async function fetchPosition() {
  try {
    const response = await fetch('/robots/latest/HBOT');
    if (!response.ok) {
      rawData.textContent = `Error HTTP: ${response.status}`;
      return;
    }

    const data = await response.json();

    rawData.innerHTML = `
      timestamp: ${data.timestamp}<br>
      position_x: ${data.position_x.toFixed(2)}<br>
      position_y: ${data.position_y.toFixed(2)}<br>
      position_z: ${data.position_z.toFixed(2)}<br>
      position_w: ${data.position_w}<br>
      speed_percentage: ${data.speed_percentage}%<br>
      torque_1: ${data.torque_1}<br>
      torque_2: ${data.torque_2}<br>
      torque_3: ${data.torque_3}<br>
      torque_4: ${data.torque_4}<br>
      initialized: ${data.is_initialized}<br>
      running: ${data.is_running}<br>
      paused: ${data.is_paused}<br>
      violation: ${data.has_violation}
    `;

    const posX = mapRange(clamp(data.position_x, -600, 600), -600, 600, -workAreaSize.x / 2, workAreaSize.x / 2);
    const posY = mapRange(clamp(data.position_z, -600, 600), -600, 600, -workAreaSize.y / 2, workAreaSize.y / 2);
    const posZ = mapRange(clamp(data.position_y, -600, 600), -600, 600, -workAreaSize.z / 2, workAreaSize.z / 2);

    updateRobotPosition(posX, posY, posZ);
  } catch (err) {
    rawData.textContent = 'Error al obtener datos';
    console.error(err);
  }
}

// Fetch historic
async function fetchRepeatSequence(from: string, to: string) {
  try {
    const response = await fetch(`/robots?from=${from}&to=${to}&robot_name=HBOT`);
    if (!response.ok) {
      rawData.textContent = `Error HTTP: ${response.status}`;
      return;
    }

    const data = await response.json();
    repeatData = data;

    if (repeatData.length === 0) {
      rawData.textContent = 'No se encontró data en ese rango';
      return;
    }

    repeatIndex = 0;
    playRepeatSequence();
  } catch (err) {
    console.error('Error al obtener historial:', err);
    rawData.textContent = 'Error al obtener historial';
  }
}

function playRepeatSequence() {
  if (repeatData.length === 0) return;

  const current = repeatData[repeatIndex];

  const posX = mapRange(clamp(current.position_x, -600, 600), -600, 600, -workAreaSize.x / 2, workAreaSize.x / 2);
  const posY = mapRange(clamp(current.position_z, -600, 600), -600, 600, -workAreaSize.y / 2, workAreaSize.y / 2);
  const posZ = mapRange(clamp(current.position_y, -600, 600), -600, 600, -workAreaSize.z / 2, workAreaSize.z / 2);

  updateRobotPosition(posX, posY, posZ);

  rawData.innerHTML = `
    timestamp: ${current.timestamp}<br>
    position_x: ${current.position_x.toFixed(2)}<br>
    position_y: ${current.position_y.toFixed(2)}<br>
    position_z: ${current.position_z.toFixed(2)}<br>
    speed_percentage: ${current.speed_percentage}%<br>
    torque_1: ${current.torque_1}<br>
    torque_2: ${current.torque_2}<br>
    torque_3: ${current.torque_3}<br>
    torque_4: ${current.torque_4}<br>
  `;

  const currentTime = new Date(current.timestamp).getTime();
  const nextTime = new Date(repeatData[(repeatIndex + 1) % repeatData.length].timestamp).getTime();
  const delay = Math.max(0, nextTime - currentTime);

  repeatIndex = (repeatIndex + 1) % repeatData.length;
  repeatTimeout = setTimeout(playRepeatSequence, delay);
}

// Control manual
(window as any).moveAxis = function (axis: 'x' | 'y' | 'z', direction: -1 | 1) {
  if (currentMode !== 'manual') return;

  manualPosition[axis] += direction * stepSize;
  updateRobotPosition(manualPosition.x, manualPosition.z, manualPosition.y);
};

// Cambiar modo
(window as any).setMode = function (mode: typeof currentMode) {
  if (mode === currentMode) return;

  if (currentMode === 'realtime') clearInterval(fetchInterval);
  if (currentMode === 'repeat') clearTimeout(repeatTimeout);

  currentMode = mode;

  if (mode === 'realtime') {
    fetchPosition();
    fetchInterval = setInterval(fetchPosition, 100);
  }

  if (mode === 'manual') {
    manualPosition.x = 0;
    manualPosition.y = 0;
    manualPosition.z = 0;
    (window as any).moveAxis('x', 0);
  }

  if (mode === 'repeat') {
    const fromUTC = localToUTCISOString(fromInput.value);
    const toUTC = localToUTCISOString(toInput.value);
    fetchRepeatSequence(fromUTC, toUTC);
  }
};

// Botón "Iniciar Repetición"
startRepeatButton.addEventListener('click', () => {
  (window as any).setMode('repeat');
});

// Render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  const width = container3D.clientWidth;
  const height = container3D.clientHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

(window as any).setMode('realtime');
animate();
