import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import WebGL from 'three/addons/capabilities/WebGL.js';

// Declare variables and constants
const container = document.getElementById('preview');

let camera, renderer, scene;
let controls;
let material, mesh;

const loader = new STLLoader();
const stls = {};
let active;


init();

if (WebGL.isWebGLAvailable()) {
  animate();
}
else {
  const warning = WebGL.getWebGLErrorMessage();
  document.body.appendChild(warning);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function init() {
  // Camera
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(4, 2, 4);

  // Renderer
  renderer = new THREE.WebGLRenderer();

  renderer.setSize(container.clientWidth, container.clientHeight, false);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.update();

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xa0a0a0 );
  scene.fog = new THREE.Fog( 0xa0a0a0, 4, 20 );
  scene.add(new THREE.AxesHelper(50));


  // Lights
  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 3 );
  hemiLight.position.set( 0, 20, 0 );
  scene.add( hemiLight );

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 3 );
  directionalLight.position.set( 0, 20, 10 );
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.top = 2;
  directionalLight.shadow.camera.bottom = - 2;
  directionalLight.shadow.camera.left = - 2;
  directionalLight.shadow.camera.right = 2;
  scene.add( directionalLight );


  // Ground
  const ground = new THREE.Mesh( new THREE.PlaneGeometry( 40, 40 ), new THREE.MeshPhongMaterial( { color: 0xbbbbbb, depthWrite: false } ) );
  ground.rotation.x = - Math.PI / 2;
  ground.receiveShadow = true;
  scene.add( ground );

  const grid = new THREE.GridHelper( 40, 20, 0x000000, 0x000000 );
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add( grid );

  window.addEventListener('resize', onWindowResize);

  container.appendChild(renderer.domElement);
}


function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight, false);
}


export function loadSTL(fileName) {
  if (active == fileName) {
    return;
  }

  if (active) {
    scene.remove(stls[active]);
    active = null;
  }

  loader.load(`../models/${fileName}`, (geometry) => {
    material = new THREE.MeshPhongMaterial( { color: 0xff9c7c, specular: 0x494949, shininess: 200 } );
    mesh = new THREE.Mesh( geometry, material );

    // TODO: Scale and rotate accordingly
    mesh.scale.set(0.05, 0.05, 0.05);
    mesh.rotateY(- Math.PI / 2);
    mesh.rotateX(- Math.PI / 2);
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    stls[fileName] = mesh;

    scene.add(mesh);
    active = fileName;
  });
}


export function removeSTL(fileName) {
  if (active == fileName) {
    active = null;
    scene.remove(stls[fileName]);
  }
  delete stls.fileName;
}
