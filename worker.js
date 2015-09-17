var fs = require('fs');
var express = require('express');
var path = require('path');
var rpc = require('avs-rpc');
var sockets = [];
var dataStore = [{"PersonID":"abcd123", "FirstName": "Sample1","LastName": "Cliente 1","Country": "1 - Cliente 1"},{"PersonID":"abcd124", "FirstName": "Sample2","LastName": "Cliente 2","Country": "1 - Cliente 1"}];


//Socket
module.exports.run = function (worker) {

  //RPC
  function getUserProfile(name, callback){
    console.log("rpc method " + name);
    callback({name:name, age:32});
  }

  var local = {};
  local.getUserProfile = getUserProfile;

  console.log('   >> Worker PID:', process.pid);

  var httpServer = worker.httpServer;
  var scServer = worker.scServer;

  var app = require('express')();
  httpServer.on('request', app);

  scServer.on('connection', function (socket) {
    sockets.push(socket);

    //implement RPC
    var serverRPC = new rpc.scRpc(socket);
    serverRPC.implementAsync(local);

    socket.on('test', function (data, res){
      if(data.type === "read"){
          data.data = dataStore;
          console.log("read");
          res(null, data);

      }else if(data.type === "update"){

          console.log("update" + JSON.stringify(data));
          data.type = "push-update";
          //scServer.emit('test', data);
          broadcast('test', data);
          res(null, data);

      }else if(data.type === "destroy"){

        console.log("destroy" + JSON.stringify(data));
        data.type = "push-destroy";
        //scServer.emit('test', data);
        broadcast('test', data);
        res(null, data);

      }else if(data.type === "create"){
        data.data[0].PersonID = data.id;
        data.data[0].FirstName = "ABc";
        console.log("create " + JSON.stringify(data));
        data.type = "push-create";
        //scServer.emit('test', data);

        broadcast('test', data);
        res(null, data);

      }
    });
  });
};

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}
