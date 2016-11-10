describe('Mock', function () {
    'use strict';

    describe('Data Driven', function () {

        function setXMLHttpRequestContext(ctx) {
            var xhrChain, mockObj, mockFunction, mockFunctionArgs;

            for (var i = 0; i < ctx.xhrMockMethods.length; i++) {
                mockObj = ctx.xhrMockMethods[i];
                mockFunction = Object.keys(mockObj)[0];
                mockFunctionArgs = mockObj[mockFunction];

                if (typeof XMLHttpRequest[mockFunction] === 'undefined' || mockFunction === 'setRequestHeader') {
                    continue;
                }

                if (typeof xhrChain === 'undefined') {
                    xhrChain = XMLHttpRequest[mockFunction].apply(XMLHttpRequest, mockFunctionArgs);
                } else {
                    xhrChain = xhrChain[mockFunction].apply(xhrChain, mockFunctionArgs);
                }
            }
        }

        function setInstanceXHRSendOptions(sendOptions) {
            if(typeof sendOptions.beforeSend === 'function') {
                sendOptions.beforeSend();
            }
        }
        
        function setRequestHeaders(x, ctx) {
            var mockObj, mockFunction, mockFunctionArgs;
            for (var i = 0; i < ctx.xhrMockMethods.length; i++) {
                mockObj = ctx.xhrMockMethods[i];
                mockFunction = Object.keys(mockObj)[0];

                if(mockFunction === 'setRequestHeader') {
                    mockFunctionArgs = mockObj[mockFunction];
                    x.setRequestHeader.apply(x, mockFunctionArgs);
                }
            }

        }

        data_driven([
            {
                itShould: "match request header on equality",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: '1, 1'}]  },
                    { setResponseBody: [{mock: ['body']}]  },
                    { setRequestHeader: ['a', 1],  },
                    { setRequestHeader: ['a', 1],  }
                ],
                sendOptions: {
                },
                expected: {
                    responseBody: '{"mock":["body"]}'
                }
            },
            {
                itShould: "match request headers using a regex pattern and an equality",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: '1, 6'}]  },
                    { ifRequestHeader: [{b: /33$/}]  },
                    { setResponseBody: [{mock: ['body2']}]  },
                    { setRequestHeader: ['a', 1]  },
                    { setRequestHeader: ['a', 6]  },
                    { setRequestHeader: ['b', 133]  }
                ],
                sendOptions: {
                },
                expected: {
                    responseBody: '{"mock":["body2"]}'
                }
            },
            {
                itShould: "match request header set with multiple keys",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: '1, 1', b: 'multiple', c: 'd'}]  },
                    { setResponseBody: [{mock: ['body3']}]  },
                    { setRequestHeader: ['a', 1]  },
                    { setRequestHeader: ['a', 1]  },
                    { setRequestHeader: ['b', 'multiple']  },
                    { setRequestHeader: ['c', 'd']  }
                ],
                sendOptions: {
                },
                expected: {
                    responseBody: '{"mock":["body3"]}'
                }
            },
            {
                itShould: "not match on a duplicated equality request header key for the first duplicate equality",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: '1'}]  },
                    { ifRequestHeader: [{a: '2'}]  },
                    { setResponseBody: [{mock: ['body3.5']}]  },
                    { setRequestHeader: ['a', '1'] }
                ],
                sendOptions: {
                },
                expected: {
                    responseBody: '{"mock":"json"}'
                }
            },
            {
                itShould: "not match on a duplicated equality request header key for the most recent duplicate equality",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: '1'}]  },
                    { ifRequestHeader: [{a: '2'}]  },
                    { setResponseBody: [{mock: ['body3.25']}]  }
                ],
                sendOptions: {
                    setRequestHeaders: [
                        ['a', '2']
                    ]
                },
                expected: {
                    responseBody: '{"mock":"json"}'
                }
            },
            {
                itShould: "not match on a duplicated regex request header key for the first duplicate regex key",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: /^kd/}]  },
                    { ifRequestHeader: [{a: /^lbj/}]  },
                    { setResponseBody: [{mock: ['body3.35']}]  },
                    { setRequestHeader: ['a', 'kd1']  }
                ],
                sendOptions: {
                },
                expected: {
                    responseBody: '{"mock":"json"}'
                }
            },
            {
                itShould: "not match on a duplicated regex request header key for the most recent duplicate regex key",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: /^kd/}]  },
                    { ifRequestHeader: [{a: /^lbj/}]  },
                    { setResponseBody: [{mock: ['body3.45']}]  },
                    { setRequestHeader: ['a', 'lbj1']  }
                ],
                sendOptions: {
                },
                expected: {
                    responseBody: '{"mock":"json"}'
                }
            },
            {
                itShould: "match on a duplicated regex request header key if all patterns test true for the header",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: /^kd/}]  },
                    { ifRequestHeader: [{a: /lbj$/}]  },
                    { ifRequestHeader: [{a: /\d/}]  },
                    { setResponseBody: [{mock: ['body3.45']}] },
                    { setRequestHeader: ['a', 'kd5lbj']  }
                ],
                sendOptions: {
                },
                expected: {
                    responseBody: '{"mock":["body3.45"]}'
                }
            },
            {
                itShould: "not match on a duplicated regex request header key if any pattern tests false for the header",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: /^kd/}]  },
                    { ifRequestHeader: [{a: /lbj$/}]  },
                    { ifRequestHeader: [{a: /\d/}]  },
                    { setResponseBody: [{mock: ['body3.45']}] },
                    { setRequestHeaders: ['a', 'kdlbj']  }
                ],
                sendOptions: {
                },
                expected: {
                    responseBody: '{"mock":"json"}'
                }
            },
            {
                itShould: "not match if request header pattern succeeds but equality fails",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: /^kd/}]  },
                    { ifRequestHeader: [{a: 'kd32'}]  },
                    { setResponseBody: [{mock: ['body3.65']}] },
                    { setRequestHeaders: ['a', 'kd22']  }
                ],
                sendOptions: {
                },
                expected: {
                    responseBody: '{"mock":"json"}'
                }
            },
            {
                itShould: "match the response status",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: '1, 1'}]  },
                    { setResponseStatus: [400]  },
                    { setResponseBody: [{mock: ['body4']}]  },
                    { setRequestHeader: ['a', 1]  },
                    { setRequestHeader: ['a', 1]  }
                ],
                sendOptions: {
                },
                expected: {
                    responseBody: '{"mock":["body4"]}',
                    responseStatus: 400
                }
            },
            {
                itShould: "mock response based on location param equality",
                xhrMockMethods: [
                    { ifLocationParam: [{a: '1'}]  },
                    { setResponseHeader: [{c: 1}]  },
                    { setResponseHeader: [{c: 1, d: 1}]  },
                    { setResponseHeader: [{c: 1, d: 1, e: 5}]  },
                    { setResponseBody: [{mock: ['body5']}]  }
                ],
                sendOptions: {
                    beforeSend: function () {
                        location.hash = 'a=1';
                    }
                },
                expected: {
                    responseBody: '{"mock":["body5"]}'
                }
            },
            {
                itShould: "mock response based on multiple location param equality",
                xhrMockMethods: [
                    { ifLocationParam: [{a: '1', b: 'b', c: 'd'}]  },
                    { setResponseHeader: [{c: 1}]  },
                    { setResponseHeader: [{c: 1, d: 1}]  },
                    { setResponseHeader: [{c: 1, d: 1, e: 5}]  },
                    { setResponseBody: [{mock: ['body6']}]  }
                ],
                sendOptions: {
                    beforeSend: function () {
                        location.hash = 'a=1&b=b&c=d';
                    }
                },
                expected: {
                    responseBody: '{"mock":["body6"]}'
                }
            },
            {
                itShould: "mock response based on most recent location param equality",
                xhrMockMethods: [
                    { ifLocationParam: [{a: '1', b: 'b'}]  },
                    { ifLocationParam: [{a: '1', b: 'b', c: 'd'}]  },
                    { setResponseHeader: [{c: 1}]  },
                    { setResponseHeader: [{c: 1, d: 1}]  },
                    { setResponseHeader: [{c: 1, d: 1, e: 5}]  },
                    { setResponseBody: [{mock: ['body7']}]  }
                ],
                sendOptions: {
                    beforeSend: function () {
                        location.hash = 'a=1&b=b&c=d';
                    }
                },
                expected: {
                    responseBody: '{"mock":["body7"]}'
                }
            }

        ], function () {
            beforeEach(function () {
                location.hash = '';
                XMLHttpRequest.dropAllMocks();
            });

            it('should {itShould}', function (ctx, done) {
                var x = new XMLHttpRequest();

                // set send option defaults for method and url
                ctx.openMethod = typeof ctx.openMethod === 'undefined' ? 'GET' : ctx.openMethod;
                ctx.openUrl = typeof ctx.openUrl === 'undefined' ? 'base/spec/mock.json' : ctx.openUrl;

                setXMLHttpRequestContext(ctx);

                x.open(ctx.openMethod, ctx.openUrl);
                setRequestHeaders(x, ctx);
                setInstanceXHRSendOptions(ctx.sendOptions);
                x.onload = onload;

                function onload() {
                    if(typeof ctx.expected.allResponseHeaders !== 'undefined') {
                        expect(this.getAllResponseHeaders()).toBe(ctx.expected.allResponseHeaders);
                    }

                    expect(this.responseText).toBe(ctx.expected.responseBody);

                    if(typeof ctx.expected.responseStatus !== 'undefined') {
                        expect(this.status).toBe(ctx.expected.responseStatus);
                    }

                    for(responseHeader in ctx.expected.responseHeader) {
                        responseHeaderVal = ctx.expected.responseHeader[responseHeader];
                        expect(this.getResponseHeader(responseHeader)).toBe(responseHeaderVal);
                    }

                    done();
                }

                x.send();
            });
        });
    });


    describe('Non Data Driven', function () {
        beforeEach(function () {
            XMLHttpRequest.dropAllMocks();
        });

        it('should mock response based on request header', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifRequestHeader({a: '1, 1'})
                .ifRequestHeader({b: /^1$/})
                .setResponseStatus(1)
                .setResponseHeader({c: 1})
                .setResponseHeader({c: 1, d: 1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.open('GET', 'base/spec/mock.json');
                x.setRequestHeader('a', 1);
                x.onload = onload;
                x.send();

                function onload() {
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.open('GET', 'base/spec/mock.json');
                    this.setRequestHeader('a', 1);
                    this.setRequestHeader('a', 1);
                    this.setRequestHeader('b', 1);
                    this.onload = onload;
                    this.send();

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });

        it('should mock response based on request URL pattern', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifRequestURL(/1$/)
                .setResponseStatus(1)
                .setResponseHeader({c: 1})
                .setResponseHeader({c: 1, d: 1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.open('GET', 'base/spec/mock.json');
                x.onload = onload;
                x.send();

                function onload() {
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.open('GET', 'base/spec/mock.json?1');
                    this.onload = onload;
                    this.send();

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });

        it('should mock response based on request URL equality', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifRequestURL('1')
                .setResponseStatus(1)
                .setResponseHeader({c: 1})
                .setResponseHeader({c: 1, d: 1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.open('GET', 'base/spec/mock.json');
                x.onload = onload;
                x.send();

                function onload() {
                    expect(this.getAllResponseHeaders()).not.toBe('c:3, 3\r\nd:3');
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.open('GET', '1');
                    this.onload = onload;
                    this.send();

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });

        it('should mock response based on request method pattern', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifRequestMethod(/^1$/)
                .setResponseStatus(1)
                .setResponseHeader({c: 1})
                .setResponseHeader({c: 1, d: 1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.open('GET', 'base/spec/mock.json');
                x.onload = onload;
                x.send();

                function onload() {
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.open('1', 'base/spec/mock.json');
                    this.onload = onload;
                    this.send();

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });

        it('should mock response based on request method equality', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifRequestMethod('1')
                .setResponseStatus(1)
                .setResponseHeader({c: 1})
                .setResponseHeader({c: 1, d: 1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.open('GET', 'base/spec/mock.json');
                x.onload = onload;
                x.send();

                function onload() {
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.open('1', 'base/spec/mock.json');
                    this.onload = onload;
                    this.send();

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });

        it('should mock response based on request body JSON', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifRequestBody({a: 1, b: /^1$/})
                .ifRequestBody({c: [1, /^1$/]})
                .setResponseStatus(1)
                .setResponseHeader({c: 1})
                .setResponseHeader({c: 1, d: 1})
                .setResponseBody({mock: ['body']});

        (function () {
            x.open('GET', 'base/spec/mock.json');
            x.onload = onload;
            x.send();

                function onload() {
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.onload = onload;
                    this.open('GET', 'base/spec/mock.json');
                    this.send(JSON.stringify({a: 1, b: 1, c: [1, 1]}));

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });

        it('should mock response based on request body string', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifRequestBody('1')
                .setResponseStatus(1)
                .setResponseHeader({c: 1})
                .setResponseHeader({c: 1, d: 1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.onload = onload;
                x.open('GET', 'base/spec/mock.json');
                x.send();

                function onload() {
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.open('GET', 'base/spec/mock.json');
                    this.onload = onload;
                    this.send(1);

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });

        it('should mock response based on location params', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifLocationParam({a: '1', b: '1'})
                .ifLocationParam({c: /^1$/})
                .setResponseStatus(1)
                .setResponseHeader({c:1})
                .setResponseHeader({c:1, d:1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.open('GET', 'base/spec/mock.json');
                location.hash = 'a=1&b=1';
                x.onload = onload;
                x.send();

                function onload() {
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.open('GET', 'base/spec/mock.json');
                    location.hash = 'a=1&b=1&c=1';
                    this.onload = onload;
                    this.send();

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });
    });


});