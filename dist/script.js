let width = 500;
let height = 400;

// Create the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
scene.background = new THREE.Color(0x89f0dd);

// Create a WebGLRenderer and enable shadows
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(width, height);
renderer.antialias = true; // Smooth out the edges
document.body.appendChild(renderer.domElement);

// Position the camera
camera.position.set(0, 5, 10); 

//Load textures
renderer.shadowMapType = THREE.BasicShadowMap;
const loader = new THREE.TextureLoader();
const basetexture = loader.load('https://raw.githubusercontent.com/SeimW/three-js-snow-globe/main/blocks1.jpg');
const snowbasetexture = loader.load('https://raw.githubusercontent.com/SeimW/three-js-snow-globe/main/snow1.jpg');


//WRITE CODE TO CREATE FLOOR HERE
const floorGeometry = new THREE.BoxGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 'brown' });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2;
floor.position.z = 0;
floor.receiveShadow = true;

scene.add(floor);

//Code for the wall
const nWallGeo = new THREE.BoxGeometry(20, 20);
const nWallMaterial = new THREE.MeshStandardMaterial({ color: 'brown' });
const nWall = new THREE.Mesh(nWallGeo, nWallMaterial);
nWall.recieveShadow = true;
nWall.position.z = -9.5;
nWall.position.y = 7.5;
scene.add(nWall);

//loader for custom models
const modelloader = new THREE.GLTFLoader();

//Lighting
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
scene.add(ambientLight);


const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

//Orbit control
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.update();

//Keyboard control
document.addEventListener('keydown', keyPressed);

function keyPressed(e){
  switch(e.key) {
    case 'ArrowLeft':
      scene.rotation.y += .05;
      break;
    case 'ArrowRight':
      scene.rotation.y -= .05;
      break;
    case 'ArrowUp':
      scene.rotation.x += .05;
      break;
    case 'ArrowDown':
      scene.rotation.x -= .05;
      break;
    case '=':
      camera.zoom += .05;
      camera.updateProjectionMatrix();
      break;
    case '-':
      camera.zoom -= .05;
      camera.updateProjectionMatrix();
      break;
  }
  e.preventDefault();
  renderer.render();
}

//cube camera
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
  format: THREE.RGBFormat,
  generateMipmaps : true,
  minFilter: THREE.LinearMipmapLinearFilter
});

const near = 0.1;
const far = 100;
const cubeCamera = new THREE.CubeCamera(near, far, cubeRenderTarget);
scene.add (cubeCamera);

//sphere

const sphereGeo = new THREE.SphereGeometry(2, 32, 32);
const sphereMat = new THREE.MeshStandardMaterial({
  metalness: 1,
  roughness: 0,
  envMap: cubeRenderTarget.texture,
  refractionRatio: 0.25,
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.75
})
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.y = 1.25;
sphere.receiveShadow = true;
sphere.castShadow = true;
scene.add(sphere);

//snow for sphere
const snowBaseGeo = new THREE.CylinderGeometry(1.8, 1.5, 1, 32);
const snowBaseMat = new THREE.MeshStandardMaterial({ map: snowbasetexture });
const snowBase = new THREE.Mesh(snowBaseGeo, snowBaseMat);
snowbasetexture.wrapS = THREE.RepeatWrapping;
snowbasetexture.wrapT = THREE.RepeatWrapping;
snowbasetexture.repeat.set(10, 2);
snowBase.position.y = .5;
//snowBase.receiveShadow = true;
scene.add(snowBase);

//base for glass sphere
const baseGeo = new THREE.CylinderGeometry(1.5, 2.25, 1.5, 32);
const baseMat = new THREE.MeshStandardMaterial({ map: basetexture });
const base = new THREE.Mesh(baseGeo, baseMat);
basetexture.wrapS = THREE.RepeatWrapping;
basetexture.wrapT = THREE.RepeatWrapping;
basetexture.repeat.set(10, 2);
base.receiveShadow = true;
base.castShadow = true;
base.position.y = -.75;
scene.add(base);

//mountain cabin scene
modelloader.load('https://raw.githubusercontent.com/SeimW/three-js-snow-globe/main/Mountain%20Cabin.glb', function (gltf) {
  const cabin = gltf.scene;
  scene.add(cabin);
  cabin.position.set(-.6, 1, .5);
  cabin.scale.setScalar(.09);
  cabin.rotation.y = -Math.PI / 2;
  cabin.receiveShadow = true;
  cabin.castShadow = true;
});

//sled
modelloader.load('https://raw.githubusercontent.com/SeimW/three-js-snow-globe/main/Winter%20Sled.glb', function (gltf) {
  const sled = gltf.scene;
  scene.add(sled);
  sled.position.set(-.5, 1.125, .75);
  sled.scale.setScalar(.09);
  sled.receiveShadow = true;
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  //update cube camera position to sphere
  cubeCamera.position.copy(sphere.position);
  
  
  //update cube camera to capture enviornment
  cubeCamera.update(renderer, scene);
  
  renderer.render(scene, camera);
}

animate();