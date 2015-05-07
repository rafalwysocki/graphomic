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


describe("Travese bfs", function () {
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
    it("should traverse graph and find node", function (done) {
        var ids = null;
        var graph = Promise.promisifyAll(new Graph(this.store));
        var steps = [];
        var visited = {};
        
        adjacency.undirectedAsync(graph, aList).then(function (_ids) {
            ids = _ids;
            return graph.traverseBFSAsync(
                function (node) {
                    var data = node.getData();
                    return data === "start";
                },
                function (neighbors, depth, parent) {
                    return neighbors.filter(function (node) {
                        if (visited[node.id]) return false;
                        visited[node.id] = true;
                        return true;
                    });
                },
                function (node) {
                    steps.push(node);
                },
                function (node) {
                    var data = node.getData();
                    return data.end === true;
                }
            ).then(function (node) {
                node.id.should.eql(ids.f);
                node.getData().should.eql({
                    end: true
                });
                done();
            });
        }).catch(function (err) {
            done(err);
        });
    });
    
    it("should traverse whole graph", function (done) {
        var ids = null;
        var graph = Promise.promisifyAll(new Graph(this.store));
        var steps = [];
        var visited = {};
        
        adjacency.undirectedAsync(graph, aList).then(function (_ids) {
            ids = _ids;
            return graph.traverseBFSAsync(
                function (node) {
                    var data = node.getData();
                    return data === "start";
                },
                function (neighbors, depth, parent) {
                    return neighbors.filter(function (node) {
                        if (visited[node.id]) return false;
                        visited[node.id] = true;
                        return true;
                    });
                },
                function (node) {
                    steps.push(node);
                },
                function (node) {
                    return false;
                }
            ).then(function (node) {
                steps.should.have.length(9);
                done();
            });
        }).catch(function (err) {
            done(err);
        });

    });
});
