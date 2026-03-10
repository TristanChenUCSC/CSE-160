import * as THREE from 'three';

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // Camera
    const fov = 100;
    const aspect = 1;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    // Scene
    const scene = new THREE.Scene();

    // Box Geometry and material
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const material = new THREE.MeshBasicMaterial({color: 0x44aa88});

    // Mesh
    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);
    renderer.render(scene, camera);

    function render(time) {
        time *= 0.001;  // convert time to seconds
       
        cube.rotation.x = time;
        cube.rotation.y = time;
       
        renderer.render(scene, camera);
       
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();