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

describe('Naive algorithm of finding the shortes path', function () {
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
    it("should find path that is not shortest", function (done) {        
        // result of the algorithm
        var result = [];
        this.graph.traverseBFSAsync(
            function (node) {
                return node.getData() === "start";
            },
            function (neighbors, depth, parentNode) {
                return [neighbors.reduce(function (prevNode, currNode) {
                    return currNode.getData() < prevNode.getData() ? currNode : prevNode; 
                })];
            },
            function (node, depth, parentNode) {
                result.push(node);
            },
            function (node, depth, parentNode) {
                return node.getData() === "end";
            }
        ).then(function() {
            result.should.have.length(4);
            result[0].getData().should.eql("start");
            result[1].getData().should.eql(10);
            result[2].getData().should.eql(15);
            result[3].getData().should.eql("end");
            done();
        }).catch(function (err) {
            return done(err);
        });
    });
});















