import {
    CJSON,
    isArray
} from './util';
import {
    VALUE_ID_REG,
    VALUE_ID_ESCAPE_REG
} from './consts';

export function decompress(cANode: CJSON.CompressedJSON) {
    var keyTpls = cANode.k;
    var id2Val = cANode.v;
    var compressed = cANode.c;
    var decompressNode = function (node: any) {
        var res;
        if (isArray(node)) {
            var len = node.length;
            if (node[0] === -1) {
                res = [];
                for (var i = 1; i < len; i++) {
                    res.push(decompressNode(node[i]));
                }
            } else {
                var tpl = keyTpls[node[0]];
                if (!tpl) {
                    throw new Error('decompress failed: can not find key tpl[' + node[0] + ']');
                }
                res = {};
                var len = tpl.length;
                for (var i = 0; i < len; i++) {
                    res[tpl[i]] = decompressNode(node[i + 1]);
                };
            }
        } else if ('string' === typeof node) {
            var match = node.match(VALUE_ID_REG);
            if (match) {
                res = id2Val[parseInt(match[1])];
            } else {
                res = node;
            }
            match = res.match(VALUE_ID_ESCAPE_REG);
            if (match) {
                var matchLen = match[1].length;
                if (matchLen % 2 !== 0) {
                    throw new Error('decompress failed: invalid string input "' + node + '"');
                }
                res = res.slice(match[1].length / 2)
            }
        } else {
            res = node;
        }
        return res;
    }
    var res = decompressNode(compressed);
    return res;
}