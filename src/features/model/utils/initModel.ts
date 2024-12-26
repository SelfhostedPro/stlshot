import * as THREE from 'three'
import { STLLoader, OutlineEffect, EffectComposer, RenderPass, OutlinePass } from 'three-stdlib'

export const initModel = async (dataurl: string) => {
    // Create temporary Scene with matching settings
    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        logarithmicDepthBuffer: true,
    })
    renderer.setSize(256, 256) // thumbnail size
    renderer.setClearColor(0xffffff, 1) // white background

    // Match camera settings from your Canvas
    const camera = new THREE.OrthographicCamera(
        -128, 128, // left, right
        128, -128, // top, bottom
        0.1, 500 // near, far
    )
    camera.position.set(0, 0, 100)
    camera.zoom = 3
    camera.updateProjectionMatrix()

    // Set up EffectComposer
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // Add Outline Pass
    const outlinePass = new OutlinePass(
        new THREE.Vector2(256, 256),
        scene,
        camera
    )
    outlinePass.edgeStrength = 3
    outlinePass.edgeGlow = 0
    outlinePass.edgeThickness = 1
    outlinePass.visibleEdgeColor.set('#000000')
    outlinePass.hiddenEdgeColor.set('#000000')
    composer.addPass(outlinePass)

    // Add Outline Effect
    const outlineEffect = new OutlineEffect(renderer, {
        defaultThickness: 0.01,
        defaultColor: [0, 0, 0],
        defaultAlpha: 1,
        defaultKeepAlive: true,
    })

    // Load Model
    const loader = new STLLoader()
    const geometry = await loader.loadAsync(dataurl)
    geometry.scale(0.5, 0.5, 0.5)
    geometry.center() // Center the geometry like in UserModel

    // Create Mesh with materials
    const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: "white" })
    )

    // Add edges
    const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 })
    )

    scene.add(mesh)
    scene.add(edges)

    // Make sure object fits in camera view
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);


    // Get the largest dimension of the model
    const maxDimension = Math.max(size.x, size.y, size.z);

    // Calculate zoom to fit the object with some padding
    const padding = 1.1; // 20% padding
    const aspectRatio = renderer.domElement.width / renderer.domElement.height;
    const targetZoom = Math.min(
        renderer.domElement.width / (maxDimension * aspectRatio * padding),
        renderer.domElement.height / (maxDimension * padding)
    );
    camera.zoom = targetZoom;
    camera.updateProjectionMatrix();

    // Set objects to outline
    outlinePass.selectedObjects = [mesh]

    // Render with effects and capture
    composer.render()
    outlineEffect.render(scene, camera)
    const thumbnail = renderer.domElement.toDataURL('image/png')

    // Clean up
    geometry.dispose()
    renderer.dispose()
    composer.dispose()

    return { thumbnail, targetZoom }
}
