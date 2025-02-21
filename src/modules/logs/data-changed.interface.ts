export interface DataChanged {
    [key: string]: {
        old: any;
        new: any;
    };
}