/*global require, describe, it, beforeEach, afterEach*/
/*jshint -W030 */


var Promise = require("bluebird");

var config = require('config');
var Store = require('../lib/store/' + config.store).Store;


describe("Store " + config.name, function () {
    describe("nodes " + config.name, function () {
        beforeEach(function (done) {
            this.store = Promise.promisifyAll(new Store());
            done();
        });

    });
    describe("store " + config.name, function () {
        beforeEach(function (done) {
            this.store = Promise.promisifyAll(new Store());
            done();
        }); 
        it("should be empty", function (done) {
            this.store.findAsync(null).
                then(function (nodes) {
                    nodes.should.be.empty;
                    done();
                }).
                catch(done);
        }); 
        it("should add one node", function (done) {
            var data = {"a":2};
            var self = this;
            var nodeId = null;
            this.store.addNodeAsync(data).then(function (_nodeId) {
                nodeId = _nodeId;
                return self.store.findAsync(function (n) {return n.getData().a === 2;});
            }).then(function (nodes) {
                nodes.should.have.length(1);
                nodes[0].should.have.property("id", nodeId);
                nodes[0].getData().should.eql({"a":2});
                nodes[0].should.have.property("_edges", {});
                done();
            }).catch(done);;
        });
        it("should add many nodes", function (done) {
            var data = [
                {"a":2},
                {"b":4},
                {"c":6}
            ];
            var self = this;
            var ids = null;
            var d = data.map(function (d) {return self.store.addNodeAsync(d);});
            Promise.all(d).then(function (_ids) {
                ids = _ids;
                return self.store.findAsync(null);
            }).then(function (nodes) {
                nodes.should.have.length(3);
                nodes = nodes.reduce(function (prev, curr) { prev[curr.id] = curr; return prev; }, {});  
                ids.forEach(function (id, index) {
                    nodes[id].should.have.property("id", id);
                    nodes[id].getData().should.eql(data[index]);
                    nodes[id].should.have.property("_edges", {});
                });
                done();
            }).catch(done);
        });
        it("should find first node", function (done) {
            var data = [
                {"a":2},
                {"b":4},
                {"c":6}
            ];
            var self = this;
            var d = data.map(function (d) {return self.store.addNodeAsync(d);});
            Promise.all(d).then(function (_ids) {
                return self.store.findFirstAsync(function (node) {return node.getData().b === 4;});
            }).then(function (node) {
                node.getData().should.eql({"b":4});
                done();
            }).catch(done);
        });
        it("should find any node", function (done) {
            var data = [
                {"a":2},
                {"b":4},
                {"c":6}
            ];
            var self = this;
            var d = data.map(function (d) {return self.store.addNodeAsync(d);});
            Promise.all(d).then(function (_ids) {
                return self.store.findFirstAsync(null);
            }).then(function (node) {
                node.should.not.be.null;
                done();
            }).catch(done);
        });
        it("should remove node", function (done) {
            var data = [
                {"a":2},
                {"b":4},
                {"c":6}
            ];
            var self = this;
            var ids = null;
            var d = data.map(function (d) {return self.store.addNodeAsync(d);});
            Promise.all(d).then(function (_ids) {
                ids = _ids;
                return self.store.removeNodeAsync(ids[1]);
            }).then(function () {
                return self.store.findAsync(null);
            }).then(function (nodes) {
                var id0 = ids[0];
                var id2 = ids[2];
                nodes = nodes.reduce(function (prev, curr) { prev[curr.id] = curr; return prev; }, {});
                nodes[id0].should.have.property("id", id0);
                nodes[id0].getData().should.eql(data[0]);
                nodes[id0].should.have.property("_edges", {});
                
                nodes[id2].should.have.property("id", id2);
                nodes[id2].getData().should.eql(data[2]);
                nodes[id2].should.have.property("_edges", {});
                done();
            }).catch(done);
        });
        it("should connect (undirected) nodes", function (done) {
            var data = [
                {"a":2},
                {"b":4},
                {"c":6}
            ];
            var self = this;
            var ids = null;
            var d = data.map(function (d) {return self.store.addNodeAsync(d);});
            Promise.all(d).then(function (_ids) {
                ids = _ids;
                return self.store.addEdge(ids[0], ids[1]);
            }).then(function () {
                return self.store.adjacentAsync(ids[0], ids[1]);
            }).then(function (a) {
                a.should.be.true;
            }).then(function () {
                return self.store.adjacentAsync(ids[0], ids[2]);
            }).then(function (a) {
                a.should.be.false;
            }).then(done).catch(done);
        });
        it("should disconnect nodes", function (done) {
            var data = [
                {"a":2},
                {"b":4},
                {"c":6}
            ];
            var self = this;
            var ids = null;
            var d = data.map(function (d) {return self.store.addNodeAsync(d);});
            Promise.all(d).then(function (_ids) {
                ids = _ids;
                return self.store.addEdgeAsync(ids[0], ids[1]);
            }).then(function () {
                return self.store.removeEdgeAsync(ids[0], ids[1]);
            }).then(function () {
                return self.store.adjacentAsync(ids[0], ids[2]);
            }).then(function (a) {
                a.should.be.false;
            }).then(done).catch(done);
        });
        it("should disconnect all nodes", function (done) {
            var data = [
                {"a":2},
                {"b":4},
                {"c":6}
            ];
            var self = this;
            var ids = null;
            var d = data.map(function (d) {return self.store.addNodeAsync(d);});
            Promise.all(d).then(function (_ids) {
                ids = _ids;
                return self.store.addEdgeAsync(ids[0], ids[1]).
                    then(function () {return self.store.addEdgeAsync(ids[0], ids[2]);}).
                    then(function () {return self.store.addEdgeAsync(ids[1], ids[2]);});
            }).then(function (a) {
                return self.store.removeAllEdgesAsync(ids[0]);
            }).then(function () {
                return self.store.adjacentAsync(ids[0], ids[1]).
                    then(function (a) { a.should.be.false; });
            }).then(function ( ) {
                return self.store.adjacentAsync(ids[0], ids[2]).
                    then(function (a) { a.should.be.false; });
            }).then(function ( ) {
                return self.store.adjacentAsync(ids[1], ids[2]).
                    then(function (a) { a.should.be.true});
            }).then(done).catch(done); 
        });
        it("should set data on node", function (done) {
            var data = {"a":2};
            var self = this;
            this.store.addNodeAsync(data).then(function () {
                return self.store.findAsync(function (n) {return n.getData().a === 2;});
            }).then(function (nodes) {
                var n = nodes[0];
                n = Promise.promisifyAll(n);
                return n.setDataAsync({"b": 3, "c":4});
            }).then(function () {
                return self.store.findAsync(function (n) {return n.getData().b === 3;});
            }).then(function (nodes) {
                nodes.should.have.length(1);
                var n = nodes[0];
                n.getData().should.eql({"b":3, "c":4});
                n.should.have.property("_edges", {});
            }).then(function () {
                return self.store.findAsync(function (n) {return n.getData().a === 2;});
            }).then(function (nodes) {
                nodes.should.have.length(0);
            }).then(done).catch(done); 
        });
        it("should set data on node using store", function (done) {
            var data = {"a":2};
            var self = this;
            this.store.addNodeAsync(data).then(function () {
                return self.store.findAsync(function (n) {return n.getData().a === 2;});
            }).then(function (nodes) {
                var n = nodes[0];
                return self.store.setNodeDataAsync(n.id, {"b": 3, "c":4});
            }).then(function () {
                return self.store.findAsync(function (n) {return n.getData().b === 3;});
            }).then(function (nodes) {
                nodes.should.have.length(1);
                var n = nodes[0];
                n.getData().should.eql({"b":3, "c":4});
                n.should.have.property("_edges", {});
            }).then(function () {
                return self.store.findAsync(function (n) {return n.getData().a === 2;});
            }).then(function (nodes) {
                nodes.should.have.length(0);
            }).then(done).catch(done); 
        });
        it("should update data on node using store", function (done) {
            var data = {"a":2};
            var self = this;
            this.store.addNodeAsync(data).then(function () {
                return self.store.findAsync(function (n) {return n.getData().a === 2;});
            }).then(function (nodes) {
                var n = nodes[0];
                return self.store.updateNodeDataAsync(n.id, {"b": 3, "c":4});
            }).then(function () {
                return self.store.findAsync(function (n) {return n.getData().b === 3;});
            }).then(function (nodes) {
                nodes.should.have.length(1);
                var n = nodes[0];
                n.getData().should.eql({"a":2, "b":3, "c":4});
                n.should.have.property("_edges", {});
            }).then(done).catch(done); 
        });
    });  
});
