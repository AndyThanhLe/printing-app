import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import WebGL from 'three/examples/jsm/capabilities/WebGL';


// Declare variables and constants
const container = document.getElementById('preview') as HTMLDivElement;

let camera: THREE.PerspectiveCamera;
let renderer: THREE.Renderer;
let scene: THREE.Scene;
let controls: OrbitControls;
let material: THREE.MeshPhongMaterial;
let mesh: THREE.Mesh;

const loader = new STLLoader();
const stls: { [fileName: string]: THREE.Mesh } = {};
let active: string;


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
  camera.position.set(200, 150, 200);

  // Renderer
  renderer = new THREE.WebGLRenderer();

  renderer.setSize(container.clientWidth, container.clientHeight, false);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.update();

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xa0a0a0 );
  scene.fog = new THREE.Fog( 0xa0a0a0, 0, 2000 );
  // scene.add(new THREE.AxesHelper(50));


  // Lights
  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 3 );
  hemiLight.position.set( 0, 200, 0 );
  scene.add( hemiLight );

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 3 );
  directionalLight.position.set( 0, 200, 10 );
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.top = 2;
  directionalLight.shadow.camera.bottom = - 2;
  directionalLight.shadow.camera.left = - 2;
  directionalLight.shadow.camera.right = 2;
  scene.add( directionalLight );


  // Ground
  const ground = new THREE.Mesh( new THREE.PlaneGeometry( 256, 256 ), new THREE.MeshPhongMaterial( { color: 0xbbbbbb, depthWrite: false } ) );
  ground.rotation.x = - Math.PI / 2;
  ground.receiveShadow = true;
  scene.add( ground );

  const grid = new THREE.GridHelper( 256, 16, 0x000000, 0x000000 );
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


export async function loadSTL(fileName: string, colourHex: number = 0xff9c7c) {
  if (active == fileName) {
    return;
  }

  if (active) {
    scene.remove(stls[active]);
    active = null;
  }

  // retrieve the path to the file from the server, verifying that it is there
  await fetch(`${window.location.pathname}/get-model/${fileName}`)
    .then((response => {
      if (!response.ok) {
        throw new Error('Failed to update the model');
      }

      return response.json();
    }))
    .then((data) => {
      loader.load(data.filePath, (geometry) => {
        material = new THREE.MeshPhongMaterial( { color: colourHex, specular: 0x494949, shininess: 200 } );
        mesh = new THREE.Mesh( geometry, material );

        // TODO: Scale and rotate accordingly
        // mesh.rotateY(- Math.PI / 2);
        // mesh.rotateX(- Math.PI / 2);
        const boundingBox = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        // Check that the file is within the bounds of the selected printer
        console.log(size);

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        stls[fileName] = mesh;

        scene.add(mesh);
        console.log(`The file name is ${fileName}`);
        active = fileName;
      });

    })
    .catch((e) => {
      console.error(e);
    });

    console.log(`Active: ${active}`);
}


export function removeSTL(fileName: string) {
  if (active == fileName) {
    active = null;
    scene.remove(stls[fileName]);
  }
  delete stls.fileName;
}


export function changeColour(colourHex: number) {
  console.log(colourHex);
  console.log(active);

  if (!colourHex) {
    return;
  }
  
  if (active) {
    (stls[active].material as THREE.MeshPhongMaterial).color.set(colourHex);
  }
}


export function getActive() {
  return active;
}
