/*global require, describe, it*/
/*jshint -W030 */

var Promise = require("bluebird");
var MemoryStore = require('../lib/store/memory').Store;
var Graph = require("../lib/graph").Graph;
var adjacency = Promise.promisifyAll(require("../lib/adjacency"));


var config = require('config');

var prepare = function () {
    var aList = {};

    for (var i=0; i<1000; i++) {
        var neighbors = [];
        for (var j=i+1; j<i+100; j++) {
            var nId = j < 1000 ? j : j-1000;
            neighbors.push(''+nId);
        }
        aList[''+i] = {"neighbors":neighbors};
    }

    aList.start = {
        data: 'start',
        neighbors: ['0', '1', '2']
    };
    aList.end = {
        data: 'end',
        neighbors: ['99']
    };
    return aList;
};



describe("Travese big graph", function () {    
    it("should traverse whole graph with cycle", function (done) {
        return done();
        
        if (config.store !== 'memory') {
            return done();
        }
        
        this.timeout(120000);
        var ids = null;
        var graph = Promise.promisifyAll(new Graph(new MemoryStore()));
        var steps = [];
        var visited = {};
        
        var aList = prepare();
        
        adjacency.undirectedAsync(graph, aList).then(function (_ids) {
            ids = _ids;
            return graph.traverseBFSAsync(
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
                Object.keys(visited).should.have.length(1002);
                done();
            });;
        }).catch(function (err) {
            done(err);
        });
    });
});

