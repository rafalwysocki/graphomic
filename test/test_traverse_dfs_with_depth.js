/*global require, describe, it, beforeEach, afterEach*/
/*jshint -W030 */

var Promise = require("bluebird");
var Graph = require("../lib/graph").Graph;
var adjacency = Promise.promisifyAll(require("../lib/adjacency"));


var config = require('config');
var Store = require('../lib/store/' + config.store).Store;


var aList = {
    a: {
        data: "start",
        neighbors: [
                'b', 'c', 'd', 'e'
            ]
    },
    b: {
        data: {
            header: "X"
        },
        neighbors: [
                'd', 'g', 'h', 'i'
            ]
    },
    c: {
        data: {
            header: "Y"
        },
        neighbors: [
                'f'
            ]
    },
    f: {
        data: {
            'end': true
        },
        neighbors: [
                'h', 'i'
            ]
    }
};


describe("Travese dfs with deep", function () {
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
    it("should traverse graph with depth information and find node", function (done) {
        var ids = null;
        var graph = Promise.promisifyAll(new Graph(this.store));
        var steps = [];
        var visited = {};
        var depths = [];

        adjacency.undirectedAsync(graph, aList).then(function (_ids) {
            ids = _ids;
            return graph.traverseDFSAsync(
                function (node) {
                    var data = node.getData();
                    return data === "start";
                },
                function (neighbors) {
                    return neighbors.filter(function (node) {
                        if (visited[node.id]) return false;
                        visited[node.id] = true;
                        return true;
                    });
                },
                function (node, depth) {
                    depths.push(depth);
                },
                function (node) {
                    var data = node.getData();
                    return data.end === true;
                }
            );
        }).then(function (node) {
            depths.should.eql([ 0, 1, 2, 2, 3 ]);
            node.id.should.eql(ids.f);
            node.getData().should.eql({
                end: true
            });
            done();
        }).catch(function (err) {
            done(err);
        });
    });
    
    it("should traverse whole graph with depth information", function (done) {
        var ids = null;
        var graph = Promise.promisifyAll(new Graph(this.store));
        var steps = [];
        var visited = {};
        var depths = [];
        
        adjacency.undirectedAsync(graph, aList).then(function (_ids) {
            ids = _ids;
            return graph.traverseDFSAsync(
                function (node) {
                    var data = node.getData();
                    return data === "start";
                },
                function (neighbors, depth) {
                    return neighbors.filter(function (node) {
                        if (visited[node.id]) return false;
                        visited[node.id] = true;
                        return true;
                    });
                },
                function (node, depth) {
                    steps.push(node);
                    depths.push(depth);
                },
                function (node) {
                    return false;
                }
            );
        }).then(function (node) {
            steps.should.have.length(9);
            depths.should.eql([ 0, 1, 2, 2, 3, 2, 1, 1, 1 ]);
            done();
        }).catch(function(err) {
            done(err);
        });

    });

    it("should traverse graph and filter by depth", function (done) {
        var ids = null;
        var graph = Promise.promisifyAll(new Graph(this.store));
        var steps = [];
        var visited = {};
        var depths = [];

        adjacency.undirectedAsync(graph, aList).then(function (_ids) {
            ids = _ids;
            return graph.traverseDFSAsync(
                function (node) {
                    var data = node.getData();
                    return data === "start";
                },
                function (neighbors, depth) {
                    return neighbors.filter(function (node) {
                        if (visited[node.id]) return false;
                        return depth < 2;
                    });
                },
                function (node, depth) {
                    steps.push(node);
                    visited[node.id] = true;
                    depths.push(depth);
                },
                null
            );
        }).then(function (node) {
            depths.should.eql([0, 1, 1, 1, 1]);
            Object.keys(visited).should.containEql(ids.a);
            Object.keys(visited).should.containEql(ids.b);
            Object.keys(visited).should.containEql(ids.c);
            Object.keys(visited).should.containEql(ids.d);
            Object.keys(visited).should.containEql(ids.e);
            done();
        }).catch(function (err) {
            done(err);
        });
    });
});
