export function keysEqual(one: string[], other: string[]) {
    if (one.length !== other.length) {
        return false;
    }
    return !one.some(item => !other.includes(item))
}

export function isObject(v: any): v is Object {
    return Object.prototype.toString.call(v) === '[object Object]';
}

export function isArray(v: any): v is Array<any> {
    return Array.isArray(v);
}

export namespace CJSON {
    export type KeyTpls = string[][];
    export type Id2Val = string[];
    export interface CompressedJSON {
        k: KeyTpls,
        v: Id2Val,
        c: any
    }
}