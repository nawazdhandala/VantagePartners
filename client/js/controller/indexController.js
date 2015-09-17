app.controller('IndexController',
  ['$scope',  function ($scope) {

        $scope.init = function(){
            //init
            var socket = socketCluster.connect({
              hostname: 'localhost',
              port: 8000,
              autoReconnectOptions: {
                initialDelay: 1000,
                randomness: 1000,
                maxDelay: 4000
              }
            });

            $scope.socket = socket;

            console.log('Connecting socket.');

            socket.on('connect', function (status) {
              $scope.$apply(function () {
                $scope.hasWebSocketSupport = true;
                console.log('Socket connected.');

              });
            });


        };




        $scope.send = function(request,callback){
          var req = {"method":"getUserProfile","args":["gilles"],"id":"386006-1"};
          request.id = kendo.guid();

          //Send the data to the server

          $scope.socket.emit("test", request, function(err, response){
            if(request.id === response.id)
                callback(response);
          });

          //$scope.callRPC();
        };

        //RPC call
        $scope.callRPC = function(){

          var clientRPC = new avs.scRpc($scope.socket);
          remote = clientRPC.remote('getUserProfile');

          remote.getUserProfile('gilles',function(user, err){
              if (err)
                alert("remote error in getUserProfile: " + err);
              else
                alert("name: " + user.name + " age: " + user.age);
          });
        };


        $scope.mainGridOptions = {
                dataSource: {

                    autoSync: true,
                    schema: {
                        model: {
                            id: "PersonID",
                            fields: {
                                "PersonID": { editable: false, nullable: true },
                                "FirstName":{type:"text"}
                            }
                        },
                        data: "data"
                    },
                    transport: {
                        push: function(options) {
                            //Listen to the "test" event fired when the server pushes data
                          console.log('push');
                          $scope.socket.on("test", function(e) {
                            var result = e;
                              console.log("pushed data  recived");
                              if (result.type == "push-update") {
                                  options.pushUpdate(result);
                              } else if (result.type == "push-destroy") {
                                  options.pushDestroy(result);
                              } else if (result.type == "push-create") {
                                  options.pushCreate(result);
                              }

                          });
                        },
                        read: function(options) {
                            console.log('read');
                            var request = { type:'read' };
                            $scope.send(request, function(result){
                                options.success(result);
                            });
                        },

                        update: function(options) {
                            console.log('update' + JSON.stringify(options.data));
                            var request = { type:'update', data: [options.data] };
                            $scope.send(request, options.success);
                        },

                        destroy: function(options) {
                            console.log("destroy" + JSON.stringify(options.data));
                            var request = { type:'destroy', data: [options.data] };
                            $scope.send(request, options.success);
                        },

                        create: function(options) {
                          console.log("create "+ JSON.stringify(options.data));
                            var request = { type:'create', data: [options.data] };
                            $scope.send(request, options.success);
                        }
                    }
                },
                sortable: true,
                pageable: false,
                editable: true,
                height: 300,
                toolbar: ["create"],
                columns: [{
                    field: "FirstName",
                    title: "First Name",
                    width: "120px"
                    },{
                    field: "LastName",
                    title: "Last Name",
                    width: "120px"
                    },{
                    field: "Country",
                    width: "120px"
                  },
                  {
                    command: "destroy", width: 80
                  }
                ]
            };
}]);
