/*global require, describe, it, beforeEach, afterEach*/
/*jshint -W030 */

var async = require("async");

var config = require('config');
var Store = require('../lib/store/' + config.store).Store;

describe("Store " + config.name, function () {
    
    describe("nodes", function () {  
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
        it("should be empty", function (done) {
            this.store.find(null, function (err, nodes) {
                if (err) return done(err);
                nodes.should.be.empty;
                done();
            });
        });
        it("should add one node", function (done) {
            var data = {"a":2};
            var self = this;
            async.waterfall(
                [
                    async.apply(this.store.addNode.bind(this.store), data),
                    function (nodeId, cb) {
                        self.store.find(function (node) {return node.getData().a === 2;}, function (err, nodes) {
                            if (err) return cb(err);
                            
                            nodes[0].getData().should.have.property("a", 2);
                            cb(null, nodes, nodeId);
                        });
                    },
                    function (nodes, nodeId, cb) {
                        nodes.should.have.length(1);
                        nodes[0].should.have.property("id", nodeId);
                        nodes[0].getData().should.eql({"a":2});
                        nodes[0].should.have.property("_edges", {});
                        cb();
                    }
                    
                ],
                done
            );
        });
        it("should add many nodes", function (done) {
            var data = [
                {"a":2},
                {"b":4},
                {"c":6}
            ];
            var self = this;
            async.waterfall(
                [
                    async.apply(async.map, data, this.store.addNode.bind(this.store)),
                    function (ids, cb) {
                        self.store.find(null, function (err, nodes) { 
                            if (err) return cb(err);
                            return cb(err, nodes, ids); 
                        });
                    },
                    function (nodes, ids, cb) {
                        nodes.should.have.length(3);
                        nodes = nodes.reduce(function (prev, curr) { prev[curr.id] = curr; return prev; }, {});
                        ids.forEach(function (id, index) {
                            nodes[id].should.have.property("id", id);
                            nodes[id].getData().should.eql(data[index]);
                            nodes[id].should.have.property("_edges", {});
                        }); 
                        cb();
                    } 
                ],
                done
            );
        });
        it("should find first node", function (done) {
            var data = [
                {"a":2},
                {"b":4},
                {"c":6}
            ];
            var self = this;
            async.waterfall(
                [
                    async.apply(async.map, data, this.store.addNode.bind(this.store)),
                    function (ids, cb) {
                        self.store.findFirst(function (node) {return node.getData().b === 4;}, function (err, node) { 
                            if (err) return cb(err);
                            return cb(err, node); 
                        });
                    },
                    function (node, cb) {
                        node.getData().should.eql({"b":4});
                        cb();
                    } 
                ],
                done
            );
        });
        it("should remove node", function (done) {
            var data = [
                {"a":2},
                {"b":4},
                {"c":6}
            ];
            var self = this;
            async.waterfall(
              [
                  async.apply(async.map, data, this.store.addNode.bind(this.store)),
                  function (ids, cb) {
                      self.store.removeNode(ids[1], function (err) {
                          cb(err, ids);
                      });
                  },
                  function (ids, cb) {
                        self.store.find(null, function (err, nodes) {
                            if (err) return cb(err);
                            return cb(err, nodes, ids);
                        });
                  },
                  function (nodes, ids, cb) {
                      var id0 = ids[0];
                      var id2 = ids[2];
                      nodes = nodes.reduce(function (prev, curr) { prev[curr.id] = curr; return prev; }, {});
                      nodes[id0].should.have.property("id", id0);
                      nodes[id0].getData().should.eql(data[0]);
                      nodes[id0].should.have.property("_edges", {});
                      
                      nodes[id2].should.have.property("id", id2);
                      nodes[id2].getData().should.eql(data[2]);
                      nodes[id2].should.have.property("_edges", {});
                      cb();
                  }
              ],
                done  
            );

        });

        it("should connect (undirected) nodes", function (done) {
            var data = [
                {"a":2},
                {"b":4},
                {"c":6}
            ];
            var self = this;
            var ids = null;
            async.waterfall(
              [
                  async.apply(async.map, data, this.store.addNode.bind(this.store)),
                  function (_ids, cb) {
                      ids = _ids;
                      self.store.addEdge(ids[0], ids[1], cb);
                  },
                  function (cb) {
                      self.store.adjacent(ids[0], ids[1], function (err, a) {
                          if (err) return cb(err);
                          a.should.be.true;
                          cb();
                      });
                  },
                  function (cb) {
                      self.store.adjacent(ids[0], ids[2], function (err, a) {
                          if (err) return cb(err);
                          a.should.be.false;
                          cb();
                      });
                  }

              ],
                done  
            );

        });

        it("should connect (directed) nodes", function (done) {
            var data = [
                {"a":2},
                {"b":4},
                {"c":6}
            ];

            var self = this;
            var ids = null;
            async.waterfall(
                [
                    async.apply(async.map, data, this.store.addNode.bind(this.store)),
                    function (_ids, cb) {
                        ids = _ids;
                        self.store.addDirEdge(ids[0], ids[1], cb);
                    },
                    function (cb) {
                        self.store.adjacent(ids[0], ids[1], function (err, a) {
                            if (err) return cb(err);
                            a.should.be.true;
                            cb();
                        });
                    },
                    function (cb) {
                        self.store.adjacent(ids[0], ids[2], function (err, a) {
                            if (err) return cb(err);
                            a.should.be.false;
                            cb();
                        });
                    },
                    function (cb) {
                        self.store.adjacent(ids[1], ids[0], function (err, a) {
                            if (err) return cb(err);
                            a.should.be.false;
                            cb();
                        });
                    },
                ],
                done  
            );
            
        });
        
        
    });

});
