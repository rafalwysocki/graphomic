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
            data: {header: "Y"},
            neighbors: [
                'b'
            ]
        },
        f: {
            data: {},
            neighbors: [
                'h', 'i'
            ]
        }
    };




describe("Remove node", function () {
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
    it("should remove node", function (done) {
        var graph = new Graph(this.store);
        var ids = null;
            async.waterfall([
                async.apply(adjacency.undirected, graph, aList),
                function (_ids, cb) {
                    ids = _ids;
                    cb();
                },
                function (cb) {
                    graph.removeNode(ids.b, cb);
                },
                function (cb) {
                    graph.adjacent(ids.a, ids.b, function (err, isAdj) {
                        (err === null).should.be.true;
                        isAdj.should.be.false;
                        cb();
                    });
                }, function (cb) {
                    graph.adjacent(ids.c, ids.b, function (err, isAdj) {
                        (err === null).should.be.true;
                        isAdj.should.be.false;
                        cb();
                    });
                }, function (cb) {
                    graph.findFirst(function (node) {
                        var data = node.getData();
                        if (data) return data.header === 'X';
                        return false;
                    }, function (err, node) {
                        (err === null).should.be.true;
                        (node === null).should.be.true;
                        cb();
                    });
                }
            ], function (err, result) {
                done(err);
            });
    });
});
