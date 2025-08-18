import * as THREE from 'three';

class PointerLockControls {
    public camera: THREE.Camera;
    public domElement: HTMLElement;
    public isLocked: boolean = false;

    private pitchObject: THREE.Object3D;
    private yawObject: THREE.Object3D;

    public onLockChange?: (isLocked: boolean) => void;
    public onLockError?: () => void;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.camera = camera;
        this.domElement = domElement;

        this.pitchObject = new THREE.Object3D();
        this.pitchObject.add(camera);

        this.yawObject = new THREE.Object3D();
        this.yawObject.position.y = 100; // Start higher to see the room better
        this.yawObject.add(this.pitchObject);

        // Bind methods
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onPointerlockChange = this.onPointerlockChange.bind(this);
        this.onPointerlockError = this.onPointerlockError.bind(this);

        // Add event listeners
        document.addEventListener(
            'pointerlockchange',
            this.onPointerlockChange,
            false
        );
        document.addEventListener(
            'mozpointerlockchange',
            this.onPointerlockChange,
            false
        );
        document.addEventListener(
            'webkitpointerlockchange',
            this.onPointerlockChange,
            false
        );

        document.addEventListener(
            'pointerlockerror',
            this.onPointerlockError,
            false
        );
        document.addEventListener(
            'mozpointerlockerror',
            this.onPointerlockError,
            false
        );
        document.addEventListener(
            'webkitpointerlockerror',
            this.onPointerlockError,
            false
        );
    }

    private onMouseMove(event: MouseEvent): void {
        if (!this.isLocked) return;

        const movementX =
            event.movementX ||
            (event as any).mozMovementX ||
            (event as any).webkitMovementX ||
            0;
        const movementY =
            event.movementY ||
            (event as any).mozMovementY ||
            (event as any).webkitMovementY ||
            0;

        this.yawObject.rotation.y -= movementX * 0.002;
        this.pitchObject.rotation.x -= movementY * 0.002;
        this.pitchObject.rotation.x = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, this.pitchObject.rotation.x)
        );
    }

    private onPointerlockChange(): void {
        const element =
            (document as any).pointerLockElement ||
            (document as any).mozPointerLockElement ||
            (document as any).webkitPointerLockElement;

        if (element === this.domElement) {
            this.isLocked = true;
            document.addEventListener('mousemove', this.onMouseMove, false);
        } else {
            this.isLocked = false;
            document.removeEventListener('mousemove', this.onMouseMove, false);
        }

        if (this.onLockChange) {
            this.onLockChange(this.isLocked);
        }
    }

    private onPointerlockError(): void {
        console.warn(
            'Pointer lock failed. Make sure you clicked the button and your browser supports pointer lock.'
        );

        if (this.onLockError) {
            this.onLockError();
        }
    }

    private isDomElementValid(): boolean {
        // Check if element exists and is connected to the DOM
        return (
            this.domElement &&
            this.domElement.isConnected &&
            document.contains(this.domElement)
        );
    }

    public lock(): void {
        // Validate DOM element before attempting pointer lock
        if (!this.isDomElementValid()) {
            console.error(
                'DOM element is not valid or not connected to the DOM'
            );
            this.onPointerlockError();
            return;
        }

        const element = this.domElement as any;

        // Check if pointer lock is already active
        if (
            document.pointerLockElement ||
            (document as any).mozPointerLockElement ||
            (document as any).webkitPointerLockElement
        ) {
            console.warn('Pointer lock is already active');
            return;
        }

        try {
            if (element.requestPointerLock) {
                element.requestPointerLock();
            } else if (element.mozRequestPointerLock) {
                element.mozRequestPointerLock();
            } else if (element.webkitRequestPointerLock) {
                element.webkitRequestPointerLock();
            } else {
                console.error('Pointer lock not supported');
                this.onPointerlockError();
            }
        } catch (error) {
            console.error('Failed to request pointer lock:', error);
            this.onPointerlockError();
        }
    }

    public unlock(): void {
        const doc = document as any;
        try {
            if (doc.exitPointerLock) {
                doc.exitPointerLock();
            } else if (doc.mozExitPointerLock) {
                doc.mozExitPointerLock();
            } else if (doc.webkitExitPointerLock) {
                doc.webkitExitPointerLock();
            }
        } catch (error) {
            console.error('Failed to exit pointer lock:', error);
        }
    }

    public updateElement(newElement: HTMLElement): void {
        // Method to update the DOM element reference if it changes
        this.domElement = newElement;
    }

    public getObject(): THREE.Object3D {
        return this.yawObject;
    }

    public getDirection(v: THREE.Vector3): THREE.Vector3 {
        const direction = new THREE.Vector3(0, 0, -1);
        const rotation = new THREE.Euler(0, 0, 0, 'YXZ');

        rotation.set(this.pitchObject.rotation.x, this.yawObject.rotation.y, 0);
        v.copy(direction).applyEuler(rotation);
        return v;
    }

    public dispose(): void {
        // Unlock before disposing if currently locked
        if (this.isLocked) {
            this.unlock();
        }

        document.removeEventListener(
            'pointerlockchange',
            this.onPointerlockChange,
            false
        );
        document.removeEventListener(
            'mozpointerlockchange',
            this.onPointerlockChange,
            false
        );
        document.removeEventListener(
            'webkitpointerlockchange',
            this.onPointerlockChange,
            false
        );
        document.removeEventListener(
            'pointerlockerror',
            this.onPointerlockError,
            false
        );
        document.removeEventListener(
            'mozpointerlockerror',
            this.onPointerlockError,
            false
        );
        document.removeEventListener(
            'webkitpointerlockerror',
            this.onPointerlockError,
            false
        );
        document.removeEventListener('mousemove', this.onMouseMove, false);
    }
}

export default PointerLockControls;
