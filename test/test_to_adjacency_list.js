/*global require, describe, it, beforeEach, afterEach*/
/*jshint -W030 */

var Promise = require("bluebird");
var Graph = require("../lib/graph").Graph;
var adjacency = Promise.promisifyAll(require("../lib/adjacency"));

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


describe("Converting graph to adjacency list", function () {
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
    it("should build adjacency list from graph", function (done) {
        var graph = Promise.promisifyAll(new Graph(this.store));
        adjacency.undirectedAsync(graph, aList).then(function (ids) {
            return adjacency.toAdjacencyListAsync(graph).then(function (aList) {
                (aList[ids.a].data === null).should.be.true;
                aList[ids.b].data.should.eql({ header: 'X' });
                aList[ids.c].data.should.eql({ header: 'Y' });
                aList[ids.d].data.should.eql({});
                aList[ids.e].data.should.eql({});
                aList[ids.f].data.should.eql({});
                aList[ids.g].data.should.eql({});
                aList[ids.h].data.should.eql({});
                aList[ids.i].data.should.eql({});

                aList[ids.a].neighbors.should.eql([ids.b, ids.c, ids.d, ids.e, ids.f]);
                aList[ids.b].neighbors.should.eql([ids.a, ids.d, ids.g, ids.h, ids.i]);
                aList[ids.c].neighbors.should.eql([ids.a]);

                aList[ids.d].neighbors.should.eql([ids.a, ids.b]);
                aList[ids.e].neighbors.should.eql([ids.a], ids.h, ids.i);

                aList[ids.f].neighbors.should.eql([ids.a, ids.h, ids.i]);

                aList[ids.g].neighbors.should.eql([ids.b]);
                aList[ids.h].neighbors.should.eql([ids.b, ids.f]);
                aList[ids.i].neighbors.should.eql([ids.b, ids.f]);

                done();
            });
        }).catch(function (err) {done(err);});
        
    });
});
