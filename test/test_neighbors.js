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

describe("Neighbors", function () {
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
    it("should return neighbors by node id", function (done) {
        var graph = new Graph(this.store);
        var ids = null;
        async.waterfall([
            async.apply(adjacency.undirected, graph, aList),
            function (_ids, cb) {
                ids = _ids;
                cb();
            },
            function (cb) {
                graph.neighbors(ids.a, cb);
            }.bind(this),
            function (neigbors, cb) {
                neigbors.should.have.length(5);
                cb();
            }
        ], function (err, result) {
            done(err);
        });
    });

    it("should return neighbors by node", function (done) {
        var graph = new Graph(this.store);
        async.waterfall([
            async.apply(adjacency.undirected, graph, aList),
            function (_ids, cb) {
                graph.node(_ids.a, cb);
            },
            function (node, cb) {
                graph.neighbors(node, cb);
            }.bind(this),
            function (neigbors, cb) {
                neigbors.should.have.length(5);
                cb();
            }
        ], function (err, result) {
            done(err);
        });
    });

    it("should return neighbors from node", function (done) {
        var graph = new Graph(this.store);
        var ids = null;
        async.waterfall([
            async.apply(adjacency.undirected, graph, aList),
            function (_ids, cb) {
                graph.node(_ids.a, cb);
            },
            function (node, cb) {
                node.neighbors(cb);
            }.bind(this),
            function (neigbors, cb) {
                neigbors.should.have.length(5);
                cb();
            }
        ], function (err, result) {
            done(err);
        });
    });
});
