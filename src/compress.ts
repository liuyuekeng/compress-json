import {
    isArray,
    isObject, keysEqual, CJSON
} from './util';
import {
    VALUE_ID_ESCAPE_REG,
    MIN_SHARE_STRING_LENGTH,
    MAX_SHARE_STRING_LENGTH,
    VALUE_ID_PRE
} from './consts';

export function compress(raw: any): CJSON.CompressedJSON {
    var keyTpls: CJSON.KeyTpls = [];
    var valShared: Record<string, number[][]> = {};
    var compressNode = function (node: any, nodePath: number[] = []) {
        if (isArray(node)) {
            return ([-1]).concat(node.map((v, i) => compressNode(v, nodePath.concat(i + 1))))
        } else if (isObject(node)) {
            const keys = Object.keys(node);
            let templateId = keyTpls.findIndex(template => keysEqual(keys, template));
            if (templateId < 0) {
                keyTpls.push(keys);
                templateId = keyTpls.length - 1;
            }
            const template = keyTpls[templateId];
            const res = new Array(template.length + 1);
            res[0] = templateId;
            template.forEach((key, index) => {
                let value = node[key];
                value = compressNode(value, nodePath.concat(index + 1));
                res[index + 1] = value;
            });
            return res;
        } else if (typeof node === 'string') {
            var match = node.match(VALUE_ID_ESCAPE_REG);
            if (match) {
                node = match[1] + node;
            }
            var canBeSared = MIN_SHARE_STRING_LENGTH <= node.length
                && node.length <= MAX_SHARE_STRING_LENGTH;
            if (canBeSared) {
                if (!valShared[node]) {
                    valShared[node] = [];
                }
                valShared[node].push(nodePath);
            }
            return node;
        } else {
            return node;
        }
    }
    var compressed = compressNode(raw);
    var id2Val: CJSON.Id2Val = Object.keys(valShared).filter(value => valShared[value] && valShared[value].length > 1);
    id2Val.forEach(function (value, id) {
        var dataPaths = valShared[value];
        if (dataPaths && dataPaths.length > 1) {
            dataPaths.forEach(function (path) {
                var len = path.length;
                var pointer = compressed;
                for (var i = 0; i < len - 1; i++) {
                    pointer = pointer[path[i]];
                }
                pointer[path[len - 1]] = VALUE_ID_PRE + id;
            });
        }
    });
    return {
        k: keyTpls,
        v: id2Val,
        c: compressed
    };
}
