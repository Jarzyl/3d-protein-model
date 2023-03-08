import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// Loaders

const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader);

// Debug panel

const gui = new dat.GUI()
const debugObject = {}
gui.close() // ukrycie na starcie

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Update materials

const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
}})}

// Environment map

const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMap/px.jpg',
    '/textures/environmentMap/nx.jpg',
    '/textures/environmentMap/py.jpg',
    '/textures/environmentMap/ny.jpg',
    '/textures/environmentMap/pz.jpg',
    '/textures/environmentMap/nz.jpg'
])

environmentMap.encoding = THREE.sRGBEncoding
scene.environment = environmentMap

debugObject.envMapIntensity = 0.4
gui.add(debugObject, 'envMapIntensity').min(0).max(4).step(0.001).onChange(updateAllMaterials)

// 3D TEXT

// Texture to the text

const matcapTexture = textureLoader.load('/textures/matcaps/3.png')
scene.add(matcapTexture)

// Font

const fontLoader = new FontLoader()

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font1) =>
            {
            const textGeometry = new TextGeometry( 'Creator: Bartosz Jarzylo', {
                font: font1,
                size: 0.3,
                height: 0.6,
                curveSegments: 4,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 3
            })

            fontLoader.load(
                '/fonts/helvetiker_regular.typeface.json',
                (font1) =>
                        {
                        const textGeometry1 = new TextGeometry( 'Use the control panel \n to play with lights!', {
                            font: font1,
                            size: 0.3,
                            height: 0.6,
                            curveSegments: 4,
                            bevelEnabled: true,
                            bevelThickness: 0.03,
                            bevelSize: 0.02,
                            bevelOffset: 0,
                            bevelSegments: 3
                        })

        const material = new THREE.MeshMatcapMaterial( { matcap: matcapTexture } )
        const text = new THREE.Mesh(textGeometry, material)
        const text1 = new THREE.Mesh(textGeometry1, material)

        // Text 1
        text.position.x = 4
        text.position.y = 0
        text.position.z = 4.5
        text.rotation.y = 4.9
        text.rotation.x = -0.5

        text1.position.x = -10
        text1.position.y = 1
        text1.position.z = 0
        text1.rotation.y = 0
        text1.rotation.x = -0.5

        scene.add(text, text1)
    })
})

// Protein models

gltfLoader.load('/models/animationfirst/glTF/slipknotDraco.gltf',
    (gltf) =>
    {
        // Model
        gltf.scene.scale.set(0.06, 0.06, 0.06)
        gltf.scene.position.set(1, 2, -2)
        gltf.scene.rotation.y = 0
        gltf.scene.rotation.z = -2
        gltf.scene.rotation.x = 2
        scene.add(gltf.scene)

        // Update materials
        updateAllMaterials()
});

let Protein = null;

gltfLoader.load('/models/animationfirst/glTF/proteinDraco.gltf', (gltf) => {
    // Model
    gltf.scene.scale.set(0.08, 0.08, 0.08)
    gltf.scene.position.set(-2.5, 1.3 , -1)
    scene.add(gltf.scene)

    // Animation
    Protein = new THREE.AnimationMixer(gltf.scene)
    const proteinAction = Protein.clipAction(gltf.animations[0])
    proteinAction.play()

    // Update materials
    updateAllMaterials()
})

// Podklad

gltfLoader.load(
    '/models/podklad/glTF/podkladka.glb',
    (gltf) =>
    {
        // Model
        gltf.scene.scale.set(0.5, 0.5, 0.5)
        gltf.scene.position.set(-2.5 , 0, -1)
        gltf.scene.rotation.y = 9.3
        scene.add(gltf.scene)
});

gltfLoader.load(
    '/models/podklad/glTF/podkladka.glb',
    (gltf) =>
    {
        // Model
        gltf.scene.scale.set(0.5, 0.5, 0.5)
        gltf.scene.position.set(4, 0, -1)
        gltf.scene.rotation.y = 9.3
        scene.add(gltf.scene)
});

// Floor

const floorColorTexture = textureLoader.load('textures/Wood/Wood_Floor_009_basecolor.jpg')
floorColorTexture.encoding = THREE.sRGBEncoding
floorColorTexture.repeat.set(1.5, 1.5)
floorColorTexture.wrapS = THREE.RepeatWrapping
floorColorTexture.wrapT = THREE.RepeatWrapping

const floorNormalTexture = textureLoader.load('textures/Wood/Wood_Floor_009_normal.jpg')
floorNormalTexture.repeat.set(1.5, 1.5)
floorNormalTexture.wrapS = THREE.RepeatWrapping
floorNormalTexture.wrapT = THREE.RepeatWrapping

const floorGeometry = new THREE.PlaneGeometry( 15, 15)
const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorColorTexture,
    normalMap: floorNormalTexture
})
const floor = new THREE.Mesh(floorGeometry, floorMaterial)
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

// Lights

const directionalLight = new THREE.DirectionalLight('#ffffff', 4)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(3.7, 2, - 1.25)
scene.add(directionalLight)

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001).name('lightZ')

// Sizes

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera

const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-10, 6, 10)

const minHeight = 1;
const maxWidth = 100;
const maxZ = 100;

function updateCamera() {
    // Get the current camera position
    const { x, y, z } = camera.position;
  
    // Enforce the minimum height
    camera.position.y = Math.max(y, minHeight);
    camera.position.x = Math.min(x, maxWidth);
    camera.position.z = Math.min(z, maxZ);
  } 

scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.CineonToneMapping
renderer.toneMappingExposure = 1.75
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor('#211d20')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Animate

const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    controls.update()
    
    // Model animation
    if(Protein)
    {
        Protein.update(deltaTime)
    }     
    
    // Render
    renderer.render(scene, camera)

    // Update camera (dla granicy poruszania)

    updateCamera();

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
