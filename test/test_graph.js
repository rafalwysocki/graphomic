/*global require, describe, it, beforeEach, afterEach*/
/*jshint expr:true */

var Graph = require("../lib/graph").Graph;
var config = require('config');
var Store = require('../lib/store/' + config.store).Store;


describe("Graph", function() {
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
    it("should create empty graph", function(done) {
        var graph = new Graph(this.store);
        graph.find(function (node) {
            return true;
        }, function (err, result) {
            (err === null).should.be.true;
            result.should.have.length(0);
            done();
        });
    });
    it("should add node", function(done) {
        var graph = new Graph(this.store);
        graph.addNode({
            message: "custom node data"
        }, function (err) {
            if (err) return done(err);
            graph.find(function (node) {
                return node.getData().message === "custom node data";
            }, function (err, result) {
                (err === null).should.be.true;
                result.should.have.length(1);
                result[0].getData().should.have.property("message","custom node data");
                done();
            });
        });

    });
});

