import { liftPiece } from '../animations';

// pubsub.ts
type Callback<T = any> = (payload: T) => void;

interface EventProps {
    piece_selected: {
        pieceId: number;
        pieceRef: React.RefObject<THREE.Group<THREE.Object3DEventMap>>;
    };
    legal_move_calculated: {};
    piece_moved: {};
    piece_deselected: { pieceId: number };
}

export class PubSub {
    private events: {
        [K in keyof EventProps]: Callback<EventProps[K]>[];
    } = {} as any;

    constructor() {
        this.initializeEvents();
    }

    private initializeEvents() {
        this.events.piece_selected = [
            ({ pieceRef }) => {
                if (pieceRef.current) liftPiece(pieceRef.current);
            },
        ];
    }

    subscribe<K extends keyof EventProps>(
        event: K,
        callback: Callback<EventProps[K]>
    ): () => void {
        if (!this.events.hasOwnProperty(event)) {
            this.events[event] = [];
        }
        this.events[event].push(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.events[event];
            // @ts-ignore
            this.events[event] = listeners.filter((cb) => cb !== callback);
        };
    }

    publish<K extends keyof EventProps>(
        event: K,
        payload: EventProps[K]
    ): void {
        const listeners = this.events[event] || [];
        listeners.forEach((callback) => callback(payload));
    }
}

let pubSub: PubSub;

export const getPubsub = () => {
    if (pubSub) {
        return pubSub;
    }
    return (pubSub = new PubSub());
};
