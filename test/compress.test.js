var {
    compress,
    decompress
} = require('../src')
var {
    MIN_SHARE_STRING_LENGTH,
    MAX_SHARE_STRING_LENGTH,
    VALUE_ID_PRE
} = require('../src/consts');
/*
describe('', () => {
    it('', () => {
        var a = {
            "directives": {},
            "props": [],
            "events": [],
            "children": [{
                "directives": {},
                "props": [{
                    "name": "class",
                    "expr": {
                        "type": 7,
                        "segs": [{
                            "type": 1,
                            "literal": "example",
                            "value": "example"
                        }],
                        "value": "example"
                    },
                    "raw": "example"
                }],
                "events": [],
                "children": [{
                    "textExpr": {
                        "type": 7,
                        "segs": [{
                            "type": 5,
                            "expr": {
                                "type": 4,
                                "paths": [{
                                    "type": 1,
                                    "value": "msg"
                                }]
                            },
                            "filters": [],
                            "raw": "msg"
                        }, {
                            "type": 1,
                            "literal": ">",
                            "value": ">"
                        }]
                    }
                }, {
                    "directives": {},
                    "props": [],
                    "events": [],
                    "children": [{
                        "directives": {
                            "for": {
                                "item": "item",
                                "value": {
                                    "type": 4,
                                    "paths": [{
                                        "type": 1,
                                        "value": "items"
                                    }]
                                },
                                "index": "index",
                                "trackBy": {
                                    "type": 4,
                                    "paths": [{
                                        "type": 1,
                                        "value": "index"
                                    }],
                                    "raw": "index"
                                },
                                "raw": "item, index in items trackBy index"
                            }
                        },
                        "props": [],
                        "events": [],
                        "children": [{
                            "textExpr": {
                                "type": 7,
                                "segs": [{
                                    "type": 5,
                                    "expr": {
                                        "type": 4,
                                        "paths": [{
                                            "type": 1,
                                            "value": "item"
                                        }, {
                                            "type": 1,
                                            "value": "message"
                                        }]
                                    },
                                    "filters": [],
                                    "raw": "item.message"
                                }]
                            }
                        }],
                        "tagName": "li"
                    }],
                    "tagName": "ul"
                }, {
                    "directives": {
                        "if": {
                            "value": {
                                "type": 3,
                                "value": true,
                                "raw": "true"
                            },
                            "raw": "true"
                        }
                    },
                    "props": [],
                    "events": [],
                    "children": [{
                        "textExpr": {
                            "type": 7,
                            "segs": [{
                                "type": 1,
                                "literal": "if",
                                "value": "if"
                            }],
                            "value": "if"
                        }
                    }],
                    "tagName": "div"
                }, {
                    "directives": {},
                    "props": [],
                    "events": [],
                    "children": [{
                        "textExpr": {
                            "type": 7,
                            "segs": [{
                                "type": 1,
                                "literal": "llyykk",
                                "value": "llyykk"
                            }],
                            "value": "llyykk"
                        }
                    }],
                    "tagName": "div"
                }],
                "tagName": "div"
            }]
        }
        var b = compress(a);
        console.log(JSON.stringify(b));
        var c = decompress(b);
        console.log(JSON.stringify(c))
    });
})
*/

describe('+ compress & decompress', () => {
    describe('> compress object keys', () => {
        it('compress object keys by template', () => {
            var toCompress = {
                a: {
                    a: 'aa',
                    b: 'ab',
                    c: 'ac'
                },
                b: 'b',
                c: [{
                    a: 'c0a',
                    b: 'c0b',
                    c: 'c0c',
                    d: 'c0d'
                }]
            };
            var compressed = compress(toCompress);
            expect(compressed).toMatchObject({
                k: [
                    ['a', 'b', 'c'],
                    ['a', 'b', 'c', 'd']
                ],
                v: [],
                c: [0, [0, 'aa', 'ab', 'ac'], 'b', [-1, [1, 'c0a', 'c0b', 'c0c', 'c0d']]]
            })
            expect(decompress(compressed)).toMatchObject(toCompress);
        });
    })
    describe('> compress duplicate value', () => {
        it('compress duplicate string', () => {
            var toCompress = {
                a: '11111111',
                b: '11111111',
                c: '11111111111',
                d: 11111111,
                e: {
                    a: '22222222',
                    b: {
                        a: '22222222',
                        b: '22222222'
                    }
                }
            }
            var compressed = compress(toCompress);
            expect(compressed).toMatchObject({
                k: [
                    ['a', 'b', 'c', 'd', 'e'],
                    ['a', 'b']
                ],
                v: ['11111111', '22222222'],
                c: [
                    0,
                    `${VALUE_ID_PRE}0`,
                    `${VALUE_ID_PRE}0`,
                    '11111111111',
                    11111111,
                    [
                        1,
                        `${VALUE_ID_PRE}1`,
                        [
                            1,
                            `${VALUE_ID_PRE}1`,
                            `${VALUE_ID_PRE}1`
                        ]
                    ]
                ]
            })
            expect(decompress(compressed)).toMatchObject(toCompress);
        });
        it('ignore string which outof rang', () => {
            var shortStr = new Array(MIN_SHARE_STRING_LENGTH - 1).fill('1').join('');
            var longStr = new Array(MAX_SHARE_STRING_LENGTH + 1).fill('1').join('');
            var nomalStr = new Array(Math.floor(MAX_SHARE_STRING_LENGTH + MIN_SHARE_STRING_LENGTH) / 2).fill('1').join('');
            var toCompress = {
                a: shortStr,
                b: shortStr,
                c: longStr,
                d: longStr,
                e: nomalStr,
                f: nomalStr
            }
            var compressed = compress(toCompress);
            expect(compressed).toMatchObject({
                k: [
                    ['a', 'b', 'c', 'd', 'e', 'f']
                ],
                v: [nomalStr],
                c: [0, shortStr, shortStr, longStr, longStr, `${VALUE_ID_PRE}0`, `${VALUE_ID_PRE}0`]
            });
            expect(decompress(compressed)).toMatchObject(toCompress);
        });
        it('escape string with value id prefix', () => {
            var toCompress = {
                a: new Array(1).fill(VALUE_ID_PRE).join('') + '1',
                b: new Array(1).fill(VALUE_ID_PRE).join('') + '1',
                c: new Array(2).fill(VALUE_ID_PRE).join('') + '1',
                d: new Array(2).fill(VALUE_ID_PRE).join('') + '1'
            }
            var compressed = compress(toCompress);
            expect(compressed).toMatchObject({
                k: [
                    ['a', 'b', 'c', 'd']
                ],
                v: [new Array(4).fill(VALUE_ID_PRE).join('') + '1'],
                c: [
                    0,
                    new Array(2).fill(VALUE_ID_PRE).join('') + '1',
                    new Array(2).fill(VALUE_ID_PRE).join('') + '1',
                    `${VALUE_ID_PRE}0`,
                    `${VALUE_ID_PRE}0`
                ]
            });
            expect(decompress(compressed)).toMatchObject(toCompress);
        })
    });
    describe('> decompress error case', () => {
        it('throw error when key template not found', () => {
            var compressed = {
                k: [['a', 'b']],
                v: [],
                c: [1, 'a', 'b']
            }
            expect(() => {decompress(compressed)}).toThrow('decompress failed: can not find key tpl[1]')
        })
        it('throw error when unescape failed', () => {
            var compressed = {
                k: [['a']],
                v: [],
                c: [0, new Array(3).fill(VALUE_ID_PRE).join('')]
            }
            expect(() => {decompress(compressed)}).toThrow('decompress failed: invalid string input \"' + compressed.c[1] + '\"');
        });
    })
})