import { Callback, EventKey, EventProps } from '../../hooks';

export const defaultSubscribers: {
    [K in EventKey]?: Callback<EventProps[K]>[];
} = {
    piece_selected: [() => {}],
};
