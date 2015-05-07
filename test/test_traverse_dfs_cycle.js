/*global require, describe, it, beforeEach, afterEach*/
/*jshint -W030 */

var Promise = require("bluebird");
var Graph = require("../lib/graph").Graph;
var adjacency = Promise.promisifyAll(require("../lib/adjacency"));

var config = require('config');
var Store = require('../lib/store/' + config.store).Store;


describe("Travese dfs with cycles", function () {   
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
    it("should traverse whole graph with cycle", function (done) {
        
        var aList = {
            a: {
                data: "start",
                neighbors: ['b', 'd']
            },
            b: {
                data: null,
                neighbors: ['c']
            },
            c: {
                data: null,
                neighbors: ['a']
            }
        }; 
        var ids = null;
        var graph = Promise.promisifyAll(new Graph(this.store));
        var steps = [];
        var visited = {};
        
        adjacency.undirectedAsync(graph, aList).then(function (_ids) {
            ids = _ids;
            return graph.traverseDFSAsync(
                function (node) {
                    var data = node.getData();
                    return data === "start";
                },
                function (neighbors, depth) {
                    return neighbors.filter(function (node) {
                        return true;
                    });
                },
                function (node, depth, parent) {
                    visited[node.id] = true;
                    steps.push([parent, node]);
                },
                function (node) {
                    return false;
                }
            ).then(function () {
                steps.should.have.length(5);
                done();
            });
        }).catch(function (err) {done(err);});

    });
});
