import * as THREE from 'three'

interface ShowBoundariesParams {
  obj: THREE.Object3D | THREE.Group
  scene: THREE.Scene
  color: THREE.Color
}
export const showBoundaries = (params: ShowBoundariesParams) => {
  const { color, obj, scene } = params
  const box = new THREE.Box3().setFromObject(obj)
  const boxHelper = new THREE.Box3Helper(box, color)
  scene.add(boxHelper)
}
