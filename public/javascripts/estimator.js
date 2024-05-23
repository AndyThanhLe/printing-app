
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import WebGL from 'three/addons/capabilities/WebGL.js';


const container = document.getElementById('preview');
let camera, renderer, scene;
let controls;


init();

if (WebGL.isWebGLAvailable()) {
    animate();
}
else {
    const warning = WebGL.getWebGLErrorMessage();
    document.body.appendChild(warning);
}


function init() {
    // Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 50, 80);

    // Renderer
    renderer = new THREE.WebGLRenderer();

    renderer.setSize(container.clientWidth, container.clientHeight, true);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xa0a0a0 );
    // scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );
    scene.add(new THREE.AxesHelper(50));


    // Lights
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
    hemiLight.position.set( 0, 100, 0 );
    scene.add( hemiLight );

    // const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
    // dirLight.position.set( - 3, 10, - 10 );
    // dirLight.castShadow = true;
    // dirLight.shadow.camera.top = 2;
    // dirLight.shadow.camera.bottom = - 2;
    // dirLight.shadow.camera.left = - 2;
    // dirLight.shadow.camera.right = 2;
    // dirLight.shadow.camera.near = 0.1;
    // dirLight.shadow.camera.far = 40;
    // scene.add( dirLight );

    // const light = new THREE.SpotLight();
    // light.position.set(100, 100, 100);
    // scene.add(light);

    const envTexture = new THREE.CubeTextureLoader().load(['../images/white.png','../images/white.png','../images/white.png','../images/white.png','../images/white.png','../images/white.png']);

    const material = new THREE.MeshPhysicalMaterial({ 
        color: 0xaaaaaa,
        envMap: envTexture,
        metalness: 0.25,
        roughness: 0.1,
        opacity: 1,
        transparent: true,
        transmission: 1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.25
    });

    const loader = new STLLoader();
    loader.load('../models/3DBenchy.stl', (geometry) => {
        const mesh = new THREE.Mesh(geometry, material);

        const boundingBox = new THREE.Box3().setFromObject(mesh);
        console.log(boundingBox.getSize(new THREE.Vector3));

        // Retrieve maximum dimension, scale accordingly
        // mesh.scale.set(0.5, 0.5, 0.5);

        geometry.center();

        scene.add(mesh);
    });

    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize(){
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight, true);
}

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    controls.update();
}
