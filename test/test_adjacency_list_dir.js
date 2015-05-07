/*global require, describe, it, beforeEach, afterEach*/
/*jshint -W030 */

var async = require("async");
var Graph = require("../lib/graph").Graph;
var adjacency = require("../lib/adjacency");

var config = require('config');
var Store = require('../lib/store/' + config.store).Store;

var aList =
    {
        a:{
            data: null,
            neighbors: [
                'b', 'c', 'd', 'e', 'f'
            ]
        },
        b: {
            data: {header: "X"},
            neighbors: [
                'd', 'g', 'h', 'i'
            ]
        },
        c: {
            data: {header: "Y"}
        },
        f: {
            data: {},
            neighbors: [
                'h', 'i'
            ]
        }
    };
    

describe("Adjacency list", function () {
    describe("directed graph", function () { 
        beforeEach(function (done) {
            this.store = new Store();
            this.store.connect(
                config.options,
                done
            );
        });
        afterEach(function (done) {
            this.store.removeAllNodes(done);
            //done();
        });
        it("it should create graph with connected nodes", function (done) {
            var graph = new Graph(this.store);
            var ids = null;
            async.waterfall([
                async.apply(adjacency.directed, graph, aList),
                function (_ids, cb) {
                    ids = _ids;
                    cb();
                },
                function (cb) {
                    var adj = ['b', 'c', 'd', 'e', 'f'];
                    async.each(adj, function (i, _cb) {
                        graph.adjacent(ids.a, ids[i], function (err, isAdj) {
                            (err === null).should.be.true;
                            isAdj.should.be.true;
                            _cb();
                        });
                    }, cb);
                },
                function (cb) {
                    var adj = ['b', 'c', 'd', 'e', 'f'];
                    async.each(adj, function (i, _cb) {
                        graph.adjacent(ids[i], ids.a, function (err, isAdj) {
                            (err === null).should.be.true;
                            isAdj.should.be.false;
                            _cb();
                        });
                    }, cb);
                },
                function (cb) {
                    var adj = ['g', 'h', 'i'];
                    async.each(adj, function (i, _cb) {
                        graph.adjacent(ids.a, ids[i], function (err, isAdj) {
                            (err === null).should.be.true;
                            isAdj.should.be.false;
                            _cb();
                        });
                    }, cb);
                },
                function (cb) {
                    var adj = ['g', 'h', 'i'];
                    async.each(adj, function (i, _cb) {
                        graph.adjacent(ids[i], ids.a, function (err, isAdj) {
                            
                            (err === null).should.be.true;
                            isAdj.should.be.false;
                            _cb();
                        });
                    }, cb);
                },
            ], function (err, result) {
                done(err);
            });
        });
        it("it should create nodes with data", function (done) {
            var graph = new Graph(this.store);
            var ids = null;
            async.waterfall([
                async.apply(adjacency.directed, graph, aList),
                function (_ids, cb) {
                    ids = _ids;
                    cb();
                },
                function (cb) {
                    graph.findFirst(function (node) {
                        return node.id === ids.a;
                    }, cb);
                },
                //async.apply(graph.findFirst, _findById(ids.a)),
                function (node, cb) {
                    (null === node.getData()).should.be.true;
                    cb();
                },
                function (cb) {
                    graph.findFirst(function (node) {
                        return node.id === ids.b;
                    }, cb);
                },
                //async.apply(graph.findFirst, _findById(ids.b)),
                function (node, cb) {
                    node.getData().should.eql({header: "X"});
                    cb();
                },
                function (cb) {
                    graph.findFirst(function (node) {
                        return node.id === ids.c;
                    }, cb);
                },
                //async.apply(graph.findFirst, _findById(ids.c)),
                function (node, cb) {
                    node.getData().should.eql({header: "Y"});
                    cb();
                },
                function (cb) {
                    graph.findFirst(function (node) {
                        return node.id === ids.f;
                    }, cb);
                },
                //async.apply(graph.findFirst, _findById(ids.f)),
                function (node, cb) {
                    node.getData().should.eql({});
                    cb();
                },
                function (cb) {
                    graph.findFirst(function (node) {
                        return node.id === ids.i;
                    }, cb);
                },
                //async.apply(graph.findFirst, _findById(ids.i)),
                function (node, cb) {
                    node.getData().should.eql({});
                    cb();
                },
                function (cb) {
                    graph.findFirst(function(node) {return node.id === ids.b;}, cb);
                },
                function (node, cb) {
                    node.getData().should.eql({header: 'X'});
                    cb();
                }
            ], function (err, result) {
                done(err);
            });
         });
    });
});
