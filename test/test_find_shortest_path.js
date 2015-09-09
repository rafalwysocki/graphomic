/*global require, describe, it, beforeEach, afterEach*/
/*jshint -W030 */

var Promise = require("bluebird");
var Graph = require("../lib/graph").Graph;
var adjacency = Promise.promisifyAll(require("../lib/adjacency"));

var config = require('config');
var Store = require('../lib/store/' + config.store).Store;


var aList = {
    start: {
        data: "start",
        neighbors: ['a', 'c', 'd']
    },
    a: {
        data: 10,
        neighbors: ['b']
    },
    b: {
        data: 15,
        neighbors: ['end']
    },
    c: {
        data: 20,
        neighbors: ['end']
    },
    d: {
        data: 25,
        neighbors: ['f']
    },
    f: {
        data: 5,
        neighbors: ['end']
    },
    end: {
        data: "end"
    }
};

describe('Algorithm of finding the shortes path', function () {
    beforeEach(function (done) {
        this.store = new Store();
        this.graph = Promise.promisifyAll(new Graph(this.store));
        this.ids = null;
        this.store.connect(
            config.options,
            function (err) {
                if (err) return done(err);
                adjacency.directed(this.graph, aList, function (err, ids) {
                    if (err) return done(err);
                    this.ids = ids;
                    done();
                }.bind(this));
            }.bind(this)
        );
    });
    it("should find shortest path", function (done) {        
        // result of the algorithm
        var paths = [];
        var _newPath = function () {
            return {cost:0, nodes:[]};
        };
        var path = _newPath();
        var result = [];
        this.graph.traverseDFSAsync(
            function (node) {
                var start = node.getData() === "start";
                if (start) {
                    _newPath = function () {
                        return {cost:0, nodes:[node]};
                    };
                }
                return start;
            },
            null,
            function (node, depth, parentNode) {
                var data = node.getData();
                if (typeof data === "number") {
                    path.cost += data;
                    path.nodes.push(node);
                } else if (data === "end") {
                    path.nodes.push(node);
                    paths.push(path);
                    path = _newPath();
                } else if (data === "start") {
                    path.nodes.push(node);
                }
            },
            null
        ).then(function() {
            var cheapestPath = paths.reduce(function (prev, curr) {
                return curr.cost < prev.cost ? curr : prev;
            });
            result = cheapestPath.nodes;
            result.should.have.length(3);
            result[0].getData().should.eql("start");
            result[1].getData().should.eql(20);
            result[2].getData().should.eql("end");
            done();
        }).catch(function (err) {
            return done(err);
        });
    });
});















