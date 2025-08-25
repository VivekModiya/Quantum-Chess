// pubsub.ts
type Callback<T = any> = (payload: T) => void;

interface EventProps {
    piece_selected: { pieceId: number };
    legal_move_calculated: {};
    piece_moved: {};
    piece_deselected: { pieceId: number };
}

export class PubSub {
    private events: Map<keyof EventProps, Callback[]> = new Map();

    subscribe<K extends keyof EventProps>(
        event: K,
        callback: Callback<EventProps[K]>
    ): () => void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.events.get(event)!;
            this.events.set(
                event,
                listeners.filter((cb) => cb !== callback)
            );
        };
    }

    publish<K extends keyof EventProps>(
        event: K,
        payload: EventProps[K]
    ): void {
        const listeners = this.events.get(event) || [];
        listeners.forEach((callback) => callback(payload));
    }
}

let pubSub: PubSub;

export const getPubsub = () => {
    if (pubSub) {
        return pubSub;
    }
    pubSub = new PubSub();
};
