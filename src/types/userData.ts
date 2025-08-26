type WithUserData<K extends THREE.Object3D, T extends object> = K & {
    userData: { [key: string]: any } | T;
};
