/*global require, describe, it, beforeEach, afterEach*/
/*jshint -W030 */

var async = require("async");
var Graph = require("../lib/graph").Graph;
var adjacency = require("../lib/adjacency");

var config = require('config');
var Store = require('../lib/store/' + config.store).Store;


describe("Adjacency list with empty neighbor lists", function () {
    describe("undirected graph", function () { 
        beforeEach(function (done) {
            this.store = new Store();
            this.store.connect(
                config.options,
                done
            );
        });
        afterEach(function (done) {
            this.store.removeAllNodes(done);
        });
        it("it should create graph with not connected nodes", function (done) {
            var aList =
                {
                    a:{
                        data: null,
                        neighbors: [

                        ]
                    },
                    b: {
                        data: {header: "X"},
                        neighbors: [

                        ]
                    },
                    c: {
                        data: {header: "Y"}
                    },
                    d: {
                        data: {},
                        neighbors: [
 
                        ]
                    }
                };

            var graph = new Graph(this.store);
            var ids = null;
            async.waterfall([
                async.apply(adjacency.undirected, graph, aList),
                function (_ids, cb) {
                    ids = _ids;
                    cb();
                },
                function (cb) {
                    var adj = ['a', 'b', 'c', 'd'];
                    async.each(adj, function (i, _cb) {
                        graph.adjacent(ids.a, ids[i], function (err, isAdj) {
                            (err === null).should.be.true;
                            isAdj.should.be.fasle;
                            _cb();
                        });
                    }, cb);
                },
                function (cb) {
                    var adj = ['a', 'b', 'c', 'd'];
                    async.each(adj, function (i, _cb) {
                        graph.adjacent(ids[i], ids.a, function (err, isAdj) {
                            (err === null).should.be.true;
                            isAdj.should.be.false;
                            _cb();
                        });
                    }, cb);
                },
                function (cb) {
                    var adj = ['a', 'b', 'c', 'd'];
                    async.each(adj, function (i, _cb) {
                        graph.adjacent(ids.a, ids[i], function (err, isAdj) {
                            (err === null).should.be.true;
                            isAdj.should.be.false;
                            _cb();
                        });
                    }, cb);
                },
                function (cb) {
                    var adj = ['a', 'b', 'c', 'd'];
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
    });
});


describe("Adjacency list with no neighbor lists", function () {
    describe("undirected graph", function () { 
        beforeEach(function (done) {
            this.store = new Store();
            this.store.connect(
                config.options,
                done
            );
        });
        afterEach(function (done) {
            this.store.removeAllNodes(done);
        });
        it("it should create graph with not connected nodes", function (done) {
            var aList =
                {
                    a:{
                        data: null
                    },
                    b: {
                        data: {header: "X"}
                    },
                    c: {
                        data: {header: "Y"}
                    },
                    d: {
                        data: {}
                    }
                };

            var graph = new Graph(this.store);
            var ids = null;
            async.waterfall([
                async.apply(adjacency.undirected, graph, aList),
                function (_ids, cb) {
                    ids = _ids;
                    cb();
                },
                function (cb) {
                    var adj = ['a', 'b', 'c', 'd'];
                    async.each(adj, function (i, _cb) {
                        graph.adjacent(ids.a, ids[i], function (err, isAdj) {
                            (err === null).should.be.true;
                            isAdj.should.be.fasle;
                            _cb();
                        });
                    }, cb);
                },
                function (cb) {
                    var adj = ['a', 'b', 'c', 'd'];
                    async.each(adj, function (i, _cb) {
                        graph.adjacent(ids[i], ids.a, function (err, isAdj) {
                            (err === null).should.be.true;
                            isAdj.should.be.false;
                            _cb();
                        });
                    }, cb);
                },
                function (cb) {
                    var adj = ['a', 'b', 'c', 'd'];
                    async.each(adj, function (i, _cb) {
                        graph.adjacent(ids.a, ids[i], function (err, isAdj) {
                            (err === null).should.be.true;
                            isAdj.should.be.false;
                            _cb();
                        });
                    }, cb);
                },
                function (cb) {
                    var adj = ['a', 'b', 'c', 'd'];
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
    });
});
