/*global require, describe, it, beforeEach*/
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

describe('Building directed graph from adjaceny list', function () {
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
    it('should build directed graph', function (done) {
        var graph = this.graph;
        this.graph.findAsync(function (node) {
            return node.getData() === "start";
        }).then(function (nodes) {
            nodes.should.have.length(1);
            var n = nodes[0];
            return graph.neighborsAsync(n.id).then(function (neighbors) {
                neighbors.should.have.length(3);
                neighbors.some(function (node) {return node.getData() === 10;}).should.be.true;
                neighbors.some(function (node) {return node.getData() === 20;}).should.be.true;
                neighbors.some(function (node) {return node.getData() === 25;}).should.be.true;
            });
        }).then(function () {
           return  graph.findAsync(function (node) {
                return node.getData() === 10;
            }).then(function (nodes) {
                nodes.should.have.length(1);
                var n = nodes[0];
                return graph.neighborsAsync(n.id).then(function (neighbors) {
                    neighbors.should.have.length(1);
                    neighbors[0].getData().should.be.eql(15);
                });
            });
        }).then(function () {
            return graph.findAsync(function (node) {
                return node.getData() === 15;
            }).then(function (nodes) {
                nodes.should.have.length(1);
                var n = nodes[0];
                return graph.neighborsAsync(n.id).then(function (neighbors) {
                    neighbors.should.have.length(1);
                    neighbors[0].getData().should.be.eql('end');
                });
            });
        }).then(function () {
            return graph.findAsync(function (node) {
                return node.getData() === "end";
            }).then(function (nodes) {
                nodes.should.have.length(1);
                var n = nodes[0];
                return graph.neighborsAsync(n.id).then(function (neighbors) {
                    neighbors.should.have.length(0);
                });
            });
        }).then(function () {
            return graph.findAsync(function (node) {
                return node.getData() === 20;
            }).then(function (nodes) {
                nodes.should.have.length(1);
                var n = nodes[0];
                return graph.neighborsAsync(n.id).then(function (neighbors) {
                    neighbors.should.have.length(1);
                    neighbors[0].getData().should.be.eql('end');
                });
            });
        }).then(function () {
            return graph.findAsync(function (node) {
                return node.getData() === 25;
            }).then(function (nodes) {
                nodes.should.have.length(1);
                var n = nodes[0];
                return graph.neighborsAsync(n.id).then(function (neighbors) {
                    neighbors.should.have.length(1);
                    neighbors[0].getData().should.be.eql(5);
                });
            });
        }).then(function () {
            return graph.findAsync(function (node) {
                return node.getData() === 5;
            }).then(function (nodes) {
                nodes.should.have.length(1);
                var n = nodes[0];
                return graph.neighborsAsync(n.id).then(function (neighbors) {
                    neighbors.should.have.length(1);
                    neighbors[0].getData().should.be.eql('end');
                    done();
                });
            });
        }).catch(function (err) {return done(err);}); 

    });
});
