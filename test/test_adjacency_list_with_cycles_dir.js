/*global require, describe, it, beforeEach, afterEach*/
/*jshint -W030 */

var async = require("async");
var Graph = require("../lib/graph").Graph;
var adjacency = require("../lib/adjacency");

var config = require('config');
var Store = require('../lib/store/' + config.store).Store;

var aList = {
    a: {
        data: "start",
        neighbors: [
                'd', 'b'
            ]
    },
    b: {
        data: {
            header: "X"
        },
        neighbors: [
                'c',
            ]
    },
    c: {
        data: {
            header: "Y"
        },
        neighbors: [
                'a'
            ]
    }
};
    

describe("Adjacency list with cycles", function () {
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
                    graph.adjacent(ids.a, ids.b, function (err, isAdj) {
                        (err === null).should.be.true;
                        isAdj.should.be.true;
                        cb();
                    });
                },
                function (cb) {
                    graph.adjacent(ids.b, ids.a, function (err, isAdj) {
                        (err === null).should.be.true;
                        isAdj.should.be.false;
                        cb();
                    });
                },
                function (cb) {
                    graph.adjacent(ids.a, ids.d, function (err, isAdj) {
                        (err === null).should.be.true;
                        isAdj.should.be.true;
                        cb();
                    });
                },
                function (cb) {
                    graph.adjacent(ids.d, ids.a, function (err, isAdj) {
                        (err === null).should.be.true;
                        isAdj.should.be.false;
                        cb();
                    });
                },
                function (cb) {
                    graph.adjacent(ids.b, ids.c, function (err, isAdj) {
                        (err === null).should.be.true;
                        isAdj.should.be.true;
                        cb();
                    });
                },
                function (cb) {
                    graph.adjacent(ids.c, ids.b, function (err, isAdj) {
                        (err === null).should.be.true;
                        isAdj.should.be.false;
                        cb();
                    });
                },
                function (cb) {
                    graph.adjacent(ids.c, ids.a, function (err, isAdj) {
                        (err === null).should.be.true;
                        isAdj.should.be.true;
                        cb();
                    });
                },
                function (cb) {
                    graph.adjacent(ids.a, ids.c, function (err, isAdj) {
                        (err === null).should.be.true;
                        isAdj.should.be.false;
                        cb();
                    });
                }
            ], function (err, result) {
                done(err);
            });
        });
   
    });
});
