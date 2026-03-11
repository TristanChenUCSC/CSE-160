import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MinMaxGUIHelper } from './MinMaxGUIHelper.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function main() {
    const music = document.getElementById('bg-music');
    music.volume = 0.2;
    
    function startMusic() {
        music.play();
        window.removeEventListener('click', startMusic);
    }
    
    window.addEventListener('click', startMusic);

    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // Camera
    const fov = 100;
    const aspect = 1;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.x = 8; //8
    camera.position.y = 6; //6
    camera.position.z = 8; //8

    const gui = new GUI();
    gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
    const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
    gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
    gui.add(minMaxGUIHelper, 'max', 0.1, 100, 0.1).name('far').onChange(updateCamera);

    const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 );
	controls.update();

    // Movement
    const keys = {};
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    const moveSpeed = 0.1;

    // Scene
    const scene = new THREE.Scene();

    // Box Geometry and material
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    // Skybox
    {
        const skyboxLoader = new THREE.CubeTextureLoader();
        const texture = skyboxLoader.load([
          'assets/void1.jpg',
          'assets/void3.jpg',
          'assets/void5.jpg',
          'assets/void6.jpg',
          'assets/void2.jpg',
          'assets/void4.jpg',
        ]);
        scene.background = texture;
    }

    // Lighting
    const color = 0xFFFFFF;

    const ambientLight = new THREE.AmbientLight(color, 0.75);

    const directionalLight = new THREE.DirectionalLight(color, 3);
    directionalLight.position.set(8, 6, 8);
    directionalLight.target.position.set(0, 0, 0);

    const spotLight = new THREE.SpotLight(0xFF0000, 1000)
    spotLight.position.set(0, 10, 0);
    spotLight.angle = degToRad(45);
    spotLight.distance = 100;
    spotLight.target.position.set(0, 10, -20);


    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.add(spotLight);

    // Meshes
    const gojo = createGojo();
    gojo.rotation.set(0, degToRad(180), 0);
    gojo.position.set(0, -3, 8);
    scene.add(gojo);

    const sukuna = createSukuna();
    sukuna.position.set(0, 8, -7);
    scene.add(sukuna);

    const sphereGeometry = new THREE.SphereGeometry(0.25, 32, 16)

    const textureLoader = new THREE.TextureLoader();
    const redTexture = textureLoader.load('assets/red_texture.jpg');
    const blueTexture = textureLoader.load('assets/blue_texture.jpg');

    const redMaterial = new THREE.MeshPhongMaterial({ map: redTexture });
    const blueMaterial = new THREE.MeshPhongMaterial({ map: blueTexture });

    const redSphere = new THREE.Mesh(sphereGeometry, redMaterial);
    redSphere.position.set(1.2, 3, 6);
    scene.add(redSphere);

    const blueSphere = new THREE.Mesh(sphereGeometry, blueMaterial);
    blueSphere.position.set(-1.2, 3, 6);
    scene.add(blueSphere);

    // Objects
    const gltfLoader = new GLTFLoader;
    gltfLoader.load(
        'assets/Malevolent_shrine.glb',

        function (gltf) {
            const model = gltf.scene;
            model.position.z = -6
            scene.add(model);
        }
    )

    // Hollow Purple
    let fusionTriggered = false;
    let purpleSphere = null;
    let fusionStartTime = 0;
    const fusionDuration = 5; 

    window.addEventListener('click', (e) => {
        if (keys['shift'] && !fusionTriggered) {
            fusionTriggered = true;
            fusionStartTime = performance.now() * 0.001;
        }
    });
    
    renderer.render(scene, camera);

    function updateCamera() {
        camera.updateProjectionMatrix();
    }

    const radius = 2;
    const centerX = 0;
    const centerY = 3;
    let lastTime = 0;
    function render(time) {
        time *= 0.001;  // convert time to seconds

        const deltaTime = time - lastTime;
        lastTime = time;

        const lookDir = new THREE.Vector3();
        camera.getWorldDirection(lookDir);
        lookDir.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(lookDir, camera.up).normalize();

        if (keys['w']) camera.position.addScaledVector(lookDir, moveSpeed);
        if (keys['s']) camera.position.addScaledVector(lookDir, -moveSpeed);
        if (keys['a']) camera.position.addScaledVector(right, -moveSpeed);
        if (keys['d']) camera.position.addScaledVector(right, moveSpeed);

        controls.target.copy(camera.position).add(lookDir);

        // Animations
        if (!fusionTriggered) {
            redSphere.position.x = centerX + radius * Math.cos(time);
            redSphere.position.y = centerY + radius * Math.sin(time);
    
            blueSphere.position.x = centerX + radius * Math.cos(time + Math.PI);
            blueSphere.position.y = centerY + radius * Math.sin(time + Math.PI);
        } else {
            redSphere.visible = false;
            blueSphere.visible = false;
    
            if (!purpleSphere) {
                const purpleTexture = textureLoader.load('assets/purple_texture.jpg');
                const purpleMaterial = new THREE.MeshPhongMaterial({ map: purpleTexture });
                purpleSphere = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 16), purpleMaterial);
                purpleSphere.position.set(centerX, centerY, 6);
                purpleSphere.scale.set(20,20,20);
                scene.add(purpleSphere);
            }
            
            const elapsed = time - fusionStartTime;
            purpleSphere.position.y += 10 * deltaTime;
            purpleSphere.position.z -= 20 * deltaTime;      

            if (elapsed > fusionDuration) {
                fusionTriggered = false;
                redSphere.visible = true;
                blueSphere.visible = true;
        
                scene.remove(purpleSphere);
                purpleSphere.geometry.dispose();
                purpleSphere.material.dispose();
                purpleSphere = null;
            }
        }
       
        renderer.render(scene, camera);
       
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);


    function makeInstance(geometry, color, x) {
        const material = new THREE.MeshPhongMaterial({color});
       
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
       
        cube.position.x = x;
       
        return cube;
    }
}

function createGojo() {
    const group = new THREE.Group();

    const skin = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    const black = new THREE.MeshPhongMaterial({ color: 0x111111 });
    const white = new THREE.MeshPhongMaterial({ color: 0xf2f2f2 });
    const blue = new THREE.MeshPhongMaterial({ color: 0x2ec0ff });

    // hair
    const gltfLoader = new GLTFLoader;
    gltfLoader.load(
        'assets/hair.glb',

        function (gltf) {
            const model = gltf.scene;
            model.scale.set(2,2,2);
            model.position.y = 1.3;
            group.add(model);
        }
    )

    // head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.5,32,16),
        skin
    );
    head.position.y = 6;
    group.add(head);

    // Eyes
    const leftEye = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08,0.08,0.5,16),
        blue
    );
    leftEye.rotation.x = Math.PI / 2;
    leftEye.position.x = -0.15;
    leftEye.position.y = 6;
    leftEye.position.z = 0.25;
    group.add(leftEye);

    const rightEye = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08,0.08,0.5,16),
        blue
    );
    rightEye.rotation.x = Math.PI / 2;
    rightEye.position.x = 0.15;
    rightEye.position.y = 6;
    rightEye.position.z = 0.25;
    group.add(rightEye);

    // Body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        black
    );
    body.scale.set(0.8, 1.2, 0.8);
    body.position.set(0, 4.95, 0);    
    group.add(body);

    // legs
    const leftUpperLeg = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        white
    );
    leftUpperLeg.scale.set(0.33, 0.9, 0.8 );
    leftUpperLeg.rotation.set(-Math.PI / 3, 0, 0);
    leftUpperLeg.position.set(-0.23, 4.2, 0.1);    
    group.add(leftUpperLeg);

    const leftLowerLeg = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        white
    );
    leftLowerLeg.scale.set(0.33, 0.9, 0.6 );
    leftLowerLeg.position.set(-0.23, 3.86, 0.39);    
    group.add(leftLowerLeg);

    const rightLeg = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        white
    );
    rightLeg.scale.set(0.33, 1.2, 0.79 );
    rightLeg.position.set(0.23  , 4, 0);    
    group.add(rightLeg);

    // arms
    const leftShoulder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18,0.18,0.3,16),
        black
    );
    leftShoulder.rotation.set(Math.PI / 2, 0, 0);
    leftShoulder.position.set(-0.55, 5.2, 0);    
    group.add(leftShoulder);

    const leftUpperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18,0.18,0.4,16),
        skin
    );
    leftUpperArm.rotation.set(Math.PI / 2, 0, 0);
    leftUpperArm.position.set(-0.55, 5.2, 0.35);    
    group.add(leftUpperArm);

    const leftLowerArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18,0.18,0.5,16),
        skin
    );
    leftLowerArm.rotation.set(degToRad(60), 0, 0);
    leftLowerArm.position.set(-0.55, 5.3, 0.7);    
    group.add(leftLowerArm);

    const rightShoulder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18,0.18,0.3,16),
        black
    );
    rightShoulder.rotation.set(degToRad(45), 0, 0);
    rightShoulder.position.set(0.55, 5.2, 0);    
    group.add(rightShoulder);

    const rightUpperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18,0.18,0.27,16),
        skin
    );
    rightUpperArm.rotation.set(degToRad(45), 0, 0);
    rightUpperArm.position.set(0.55, 5, -0.2);    
    group.add(rightUpperArm);

    const rightLowerArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18,0.18,0.5,16),
        skin
    );
    rightLowerArm.position.set(0.55, 4.75, -0.24);    
    group.add(rightLowerArm);

    return group;
}

function createSukuna(){
    const group = new THREE.Group();

    const skin = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    const black = new THREE.MeshPhongMaterial({ color: 0x111111 });
    const white = new THREE.MeshPhongMaterial({ color: 0xf2f2f2 });
    const red = new THREE.MeshPhongMaterial({ color: 0xff0000 });

    // hair
    const gltfLoader = new GLTFLoader;
    gltfLoader.load(
        'assets/hair.glb',

        function (gltf) {
            const model = gltf.scene;

            model.traverse(function (child) {
                if (child.isMesh) {
                    child.material = black;
                }
            });

            model.scale.set(2,2,2);
            model.position.y = 1.3;
            group.add(model);
        }
    )

    // Face texture
    const textureLoader = new THREE.TextureLoader();
    const faceTexture = textureLoader.load('assets/sukuna_face.png');

    const faceMaterial = new THREE.MeshPhongMaterial({
        color: 0xffdbac,
        map: faceTexture,
        transparent: true
    });

    // head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.5,32,16),
        faceMaterial
    );
    head.rotation.set(degToRad(45), degToRad(-90), 0);
    head.position.y = 6;
    group.add(head);

    // Eyes
    const leftEye = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08,0.08,0.5,16),
        red
    );
    leftEye.rotation.x = Math.PI / 2;
    leftEye.position.x = -0.15;
    leftEye.position.y = 6;
    leftEye.position.z = 0.25;
    group.add(leftEye);

    const rightEye = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08,0.08,0.5,16),
        red
    );
    rightEye.rotation.x = Math.PI / 2;
    rightEye.position.x = 0.15;
    rightEye.position.y = 6;
    rightEye.position.z = 0.25;
    group.add(rightEye);

    // Body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        white
    );
    body.scale.set(0.8, 1.2, 0.8);
    body.position.set(0, 4.95, 0);    
    group.add(body);

    // Belt
    const belt = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        black
    );
    belt.scale.set(0.85, 0.2, 0.85);
    belt.position.set(0, 4.7, 0);    
    group.add(belt);

    // Legs
    const leftLeg = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        white
    );
    leftLeg.scale.set(0.3, 1.2, 0.79 );
    leftLeg.position.set(-0.25, 4, 0);  
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        white
    );
    rightLeg.scale.set(0.3, 1.2, 0.79 );
    rightLeg.position.set(0.25, 4, 0);  
    group.add(rightLeg);

    // arms
    const leftUpperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18,0.18,0.8,16),
        skin
    );
    leftUpperArm.rotation.set(degToRad(90), 0, degToRad(15));
    leftUpperArm.position.set(-0.5, 5.2, 0.4);    
    group.add(leftUpperArm);

    const leftLowerArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18,0.18,0.6,16),
        skin
    );
    leftLowerArm.rotation.set(0, 0, degToRad(-60));
    leftLowerArm.position.set(-0.4, 5.3, 0.7);    
    group.add(leftLowerArm);

    const rightUpperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18,0.18,0.8,16),
        skin
    );
    rightUpperArm.rotation.set(degToRad(90), 0, degToRad(-15));
    rightUpperArm.position.set(0.5, 5.2, 0.4);    
    group.add(rightUpperArm);

    const rightLowerArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18,0.18,0.6,16),
        skin
    );
    rightLowerArm.rotation.set(0, 0, degToRad(60));
    rightLowerArm.position.set(0.4, 5.3, 0.7);    
    group.add(rightLowerArm);


    return group;
}

function degToRad(deg) {
    return deg * Math.PI / 180;
}

main();