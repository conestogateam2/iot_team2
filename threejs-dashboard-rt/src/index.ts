import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

//Variables for pick and drop simulation
let robotProcessStarting=true;
let robotDelivering =false;
let robotPicking=false;

// Crear contenedores
const container3D = document.createElement('div');
container3D.style.position = 'absolute';
container3D.style.left = '0';
container3D.style.top = '0';
container3D.style.width = '50vw';
container3D.style.height = '100vh';
document.body.appendChild(container3D);

const containerCoords = document.createElement('div');
containerCoords.style.position = 'absolute';
containerCoords.style.right = '0';
containerCoords.style.top = '0';
containerCoords.style.width = '50vw';
containerCoords.style.height = '100vh';
containerCoords.style.backgroundColor = '#111';
containerCoords.style.color = '#0f0';
containerCoords.style.fontFamily = 'monospace';
containerCoords.style.fontSize = '1.3em';
containerCoords.style.padding = '1em';
containerCoords.style.boxSizing = 'border-box';
document.body.appendChild(containerCoords);

containerCoords.innerHTML = `
  <h2>H-Bot Position</h2>
  <p id="coordX">X: 0</p>
  <p id="coordY">Y: 0</p>
  <p id="coordZ">Z: 0</p>
  <hr>
  <div id="rawValues">
    <h3>Raw API Values</h3>
    <p id="rawData">Esperando datos...</p>
  </div>
  <hr>
  <h3>Axes Legend</h3>
  <p style="color:#ffaa00;">● X Axis (Dynamic X Bar)</p>
  <p style="color:#00ff00;">● Y Axis (Vertical Movement)</p>
  <p style="color:#00ffff;">● Z Axis (Moving Rail)</p>
`;

const coordX = document.getElementById('coordX')!;
const coordY = document.getElementById('coordY')!;
const coordZ = document.getElementById('coordZ')!;
const rawData = document.getElementById('rawData')!;

// THREE.js escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(75, (window.innerWidth/2)/window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth / 2, window.innerHeight);
container3D.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 5;
controls.maxDistance = 50;
controls.target.set(0, 0, 0);
controls.update();

const workAreaSize = new THREE.Vector3(12, 12, 12);
const workAreaGeometry = new THREE.BoxGeometry(workAreaSize.x, workAreaSize.y, workAreaSize.z);
const workAreaEdges = new THREE.EdgesGeometry(workAreaGeometry);
const workAreaWireframe = new THREE.LineSegments(workAreaEdges, new THREE.LineBasicMaterial({ color: 0xffffff }));
scene.add(workAreaWireframe);

// End effector
const endEffector = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
scene.add(endEffector);

// Rieles y barras
const xRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, workAreaSize.z), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
xRail.position.set(0, workAreaSize.y / 2, 0);
scene.add(xRail);

const dynamicXAxis = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
scene.add(dynamicXAxis);

const topFrameMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
const barThickness = 0.1;
const topY = workAreaSize.y / 2;

const frontBar = new THREE.Mesh(new THREE.BoxGeometry(workAreaSize.x, barThickness, barThickness), topFrameMaterial);
frontBar.position.set(0, topY, workAreaSize.z / 2);
scene.add(frontBar);

const backBar = frontBar.clone();
backBar.position.z = -workAreaSize.z / 2;
scene.add(backBar);

const sideBarGeometry = new THREE.BoxGeometry(barThickness, barThickness, workAreaSize.z);
const leftBar = new THREE.Mesh(sideBarGeometry, topFrameMaterial);
leftBar.position.set(-workAreaSize.x / 2, topY, 0);
scene.add(leftBar);

const rightBar = leftBar.clone();
rightBar.position.x = workAreaSize.x / 2;
scene.add(rightBar);

const yRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
scene.add(yRail);


// Banda transportadora (conveyor belt)------------------------------
const conveyorLength = workAreaSize.y/2; // de -500 a +500
const conveyorWidth = 30; // un poco más delgado el area de trabajo
const conveyorHeight = 0.2; // grosor fino para la banda

const conveyorGeometry = new THREE.BoxGeometry(conveyorLength, conveyorHeight, conveyorWidth);

// Material con color oscuro, puede ser un gris con un poco de brillo
const conveyorMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 100 });

const conveyorBelt = new THREE.Mesh(conveyorGeometry, conveyorMaterial);

// Posición debajo del cubo
conveyorBelt.position.set(0, -workAreaSize.y / 2 - conveyorHeight / 2, 0);

scene.add(conveyorBelt);

// Añadir luz para que se note el brillo
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// Parámetros para las zonas laterales
const zoneLength = 3; // igual que la banda en X
const zoneWidth = 5; // más estrecho que la banda
const zoneHeight = 0.4; // un poco más alto para distinguir

// Part Example
const PartMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 100 }); // color naranja brillante
const PartExample = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), PartMaterial);
PartExample.position.set(0, -workAreaSize.y / 2 - zoneHeight / 2 + conveyorHeight / 2, 0);
scene.add(PartExample);

const zoneMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600, shininess: 100 }); // color naranja brillante

// Zona izquierda (a la izquierda arriba)
const leftZone1 = new THREE.Mesh(new THREE.BoxGeometry(zoneLength, zoneHeight, zoneWidth), zoneMaterial);
leftZone1.position.set(-4.5, -workAreaSize.y / 2 - zoneHeight / 2 + conveyorHeight / 2, -3.5);
scene.add(leftZone1);

// Zona derecha (a la derecha de la banda)
const leftZone2 = leftZone1.clone();
leftZone2.position.z = 3.5;
scene.add(leftZone2);

// Zona derecha (a la derecha de la banda)
const rightZone1 = leftZone1.clone();
rightZone1.position.x = 4.5;
scene.add(rightZone1);

// Zona derecha (a la derecha de la banda)
const rightZone2 = leftZone2.clone();
rightZone2.position.x = 4.5;
scene.add(rightZone2);




// Funciones auxiliares
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Fetch de datos de posición
async function fetchPosition() {
  try {
    const response = await fetch('/robots/latest/HBOT');
    if (!response.ok) {
      console.error('HTTP error:', response.status);
      rawData.textContent = response.status.toString();
      return;
    }

    const data = await response.json();
    console.log(data);

    // Mostrar valores originales
    rawData.innerHTML = `
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

    

    // Clamp + Map
    const clampedX = clamp(data.position_x, -600, 600);
    const clampedY = clamp(data.position_z, -600, 600); // Aquí intercambiamos Z por Y
    const clampedZ = clamp(data.position_y, -600, 600); // Aquí intercambiamos Y por Z

    const posX = mapRange(clampedX, -600, 600, -workAreaSize.x / 2, workAreaSize.x / 2);
    const posY = mapRange(clampedY, -600, 600, -workAreaSize.y / 2, workAreaSize.y / 2);
    const posZ = mapRange(clampedZ, -600, 600, -workAreaSize.z / 2, workAreaSize.z / 2);

    endEffector.position.set(posX, posY, posZ);
    xRail.position.x = posX;

    const deltaY = xRail.position.y - posY;
    yRail.scale.y = Math.abs(deltaY);
    yRail.position.set(posX, (xRail.position.y + posY) / 2, posZ);

    const xLength = posX + workAreaSize.x / 2;
    dynamicXAxis.scale.set(xLength, 1, 1);
    dynamicXAxis.position.set(-workAreaSize.x / 2 + xLength / 2, topY, workAreaSize.z / 2);

    coordX.textContent = `X: ${posX.toFixed(2)}`;
    coordY.textContent = `Y: ${posY.toFixed(2)}`;
    coordZ.textContent = `Z: ${posZ.toFixed(2)}`;
  } catch (err) {
    console.error('Fetch error:', err);
    //rawData.textContent = 'ERROR al obtener datos';
  }
}

// Render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

fetchPosition();
setInterval(fetchPosition, 100);
animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth / 2, window.innerHeight);
  camera.aspect = (window.innerWidth / 2) / window.innerHeight;
  camera.updateProjectionMatrix();

  container3D.style.width = (window.innerWidth / 2) + 'px';
  container3D.style.height = window.innerHeight + 'px';
  containerCoords.style.width = (window.innerWidth / 2) + 'px';
  containerCoords.style.height = window.innerHeight + 'px';
});

function isAtCenter(posx: number, posy: number, window: number){

  if(Math.abs(posx)<=window && Math.abs(posy)<=window)
  {
   robotPicking=true;
   return "picking"
    
  }

  if (robotPicking)
  {
    if(Math.abs(posx)>=window && Math.abs(posy)>=window)
      {
       robotPicking=true;
        
      }
  }

}
