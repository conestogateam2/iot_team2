// hbotscene.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function initHBOTScene(container: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('rgb(151, 148, 148)');

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 5;
  controls.maxDistance = 50;
  controls.target.set(0, 0, 0);
  controls.update();

  const workAreaSize = new THREE.Vector3(12, 12, 12);
  const topY = workAreaSize.y / 2;

  // Elementos visuales de la escena
  const elements: Record<string, THREE.Object3D> = {};

  // Work area wireframe
  const workAreaGeometry = new THREE.BoxGeometry(workAreaSize.x, workAreaSize.y, workAreaSize.z);
  const workAreaEdges = new THREE.EdgesGeometry(workAreaGeometry);
  const workAreaWireframe = new THREE.LineSegments(workAreaEdges, new THREE.LineBasicMaterial({ color: 0xffffff }));
  scene.add(workAreaWireframe);

  // End effector
  elements.endEffector = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
  scene.add(elements.endEffector);

  // Riel X
  elements.xRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, workAreaSize.z), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
  elements.xRail.position.set(0, workAreaSize.y / 2, 0);
  scene.add(elements.xRail);

  // Eje dinámico X
  elements.dynamicXAxis = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
  scene.add(elements.dynamicXAxis);

  // Barras superiores
  const topFrameMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
  const barThickness = 0.1;

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

  scene.add(leftBar, rightBar);

  // Riel Y
  elements.yRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
  scene.add(elements.yRail);

  // Banda transportadora
  const conveyorLength = workAreaSize.y / 2;
  const conveyorGeometry = new THREE.BoxGeometry(conveyorLength, 0.2, 30);
  const conveyorMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 100 });
  const conveyorBelt = new THREE.Mesh(conveyorGeometry, conveyorMaterial);
  conveyorBelt.position.set(0, -workAreaSize.y / 2 - 0.1, 0);
  scene.add(conveyorBelt);

  // Ejemplo de pieza
  const part = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 100 }));
  part.position.set(0, -workAreaSize.y / 2 - 0.1 + 0.1, 0);
  scene.add(part);

  // Zonas de transferencia
  const zoneMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600, shininess: 100 });
  const zoneGeometry = new THREE.BoxGeometry(3, 0.4, 5);

  const zone1 = new THREE.Mesh(zoneGeometry, zoneMaterial);
  zone1.position.set(-4.5, -workAreaSize.y / 2 - 0.1 + 0.2, -3.5);
  scene.add(zone1);

  const zone2 = zone1.clone();
  zone2.position.z = 3.5;
  scene.add(zone2);

  const zone3 = zone1.clone();
  zone3.position.x = 4.5;
  scene.add(zone3);

  const zone4 = zone2.clone();
  zone4.position.x = 4.5;
  scene.add(zone4);

  scene.add(zone1, zone2, zone3, zone4);

  // Luces
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  return {
    scene,
    camera,
    renderer,
    controls,
    elements,
    workAreaSize,
    topY
  };
}
