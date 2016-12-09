'use strict';

var app = angular.module('app', ['ngRoute']);

(function() {
    function mostrarError(error) {
        $.Notify({
            caption: 'Error',
            content: error,
            type: 'alert'
        });
    }
    function mostrarSuccess(msg) {
        $.Notify({
            caption: 'Informacion',
            content: msg,
            type: 'success'
        });
    }
    var path = '/grafosMongo';
    app.config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when(path + '/nuevoProyecto', {
                templateUrl: path + '/views/nuevoProyecto.html',
            })
            .when(path + '/abrirProyecto', {
                templateUrl: path + '/views/abrirProyecto.html',
            })
            .when(path + '/agregarVertice', {
                templateUrl: path + '/views/agregarVertice.html',
            })
            .when(path + '/agregarArista', {
                templateUrl: path + '/views/agregarArista.html',
            })
            .when(path + '/verVertices', {
                templateUrl: path + '/views/verVertices.html'
            })
            .when(path + '/verAristas', {
                templateUrl: path + '/views/verAristas.html'
            })
            .when(path + '/graficar', {
                templateUrl: path + '/views/graficar.html',
                controller: 'graficarCtrl'
            });
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        $locationProvider.html5Mode(true);
    });
   
    app.controller('appCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {
        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };
        var inicializarProyecto = function() {
            $scope.vertices = [];
            $scope.aristas = [];
        };
        $scope.path = path;

        $scope.crearProyecto = function(nombreProyecto) {
            $scope.nombreProyecto = nombreProyecto;
            $location.path(path);
            inicializarProyecto();
        }

        $scope.agregarVertice = function(vertice) {
            if(vertice != undefined && vertice.trim() != '') {
                var encontrado = false;
                for(var i in $scope.vertices) {
                    if($scope.vertices[i].id == vertice.trim()) {
                        encontrado = true;
                    }
                }
                if(encontrado === false) {
                    $scope.vertices.push({id: vertice.trim(), label: vertice.trim()});
                } else {
                    mostrarError("Ya existe el vertice");
                }
                $scope.vertice = '';
                mostrarSuccess("Agregado correctamente");
            } else {
                mostrarError("Debe digitar el nombre del vertice");
            }
        }
        $scope.agregarArista = function(origen, destino) {
            if(origen && destino && origen.trim() != '' && destino.trim() != '') {
                var encontrado = false;
                for(var i in $scope.aristas) {
                    if($scope.aristas[i].from == origen.trim() && $scope.aristas[i].to == destino.trim()) {
                        encontrado = true;
                    }
                }
                if(encontrado === false) {
                    encontrado = 0;
                    for(var i in $scope.vertices) {
                        if($scope.vertices[i].id == origen.trim() || $scope.vertices[i].id == destino.trim()) {
                            encontrado+= 1;
                        }
                    }
                    if(encontrado == 2) {
                        $scope.aristas.push({from: origen.trim(), to: destino.trim()});
                    } else {
                        mostrarError("No existe el origen o el destino");
                    }
                } else {
                    mostrarError("Ya existe la arista");
                }
                $scope.origen = '';
                $scope.destino = '';
                mostrarSuccess("Agregado correctamente");
            } else {
                mostrarError("Debe digitar el nombre del vertice de origen y destino");
            }
        };
        $scope.resetear = function(origen, destino) {
            inicializarProyecto();
        };
        $scope.guardar = function() {
            var data = {
                nombre: $scope.nombreProyecto,
                vertices: JSON.stringify($scope.vertices),
                aristas: JSON.stringify($scope.aristas)
            };
            $.post({ url: path + '/api.php?q=guardar', type: "POST", data: data, success: function(response) {
                mostrarSuccess("Guardado correctamente");
            }});
            //inicializarProyecto();
        };
        $scope.abrirProyecto = function(nombreProyecto) {
            var data = { nombre: nombreProyecto };
            $.post({ url: path + '/api.php?q=abrir', type: "POST", data: data, success: function(data) {
                $scope.vertices = data.vertices;
                $scope.aristas = data.aristas;
                $scope.nombreProyecto = data.nombre;
                $location.path(path);
                $scope.safeApply();
            }});
        };
    }]);

    app.controller('graficarCtrl', ['$scope', '$http', function($scope, $http) {
        if($scope.vertices && $scope.aristas) {
            var contenerdor = $('#grafo')[0];
            var datos = {
                nodes: new vis.DataSet($scope.vertices),
                edges: new vis.DataSet($scope.aristas)
            };
            var opciones = {
                edges: {arrows: {to: {enabled: true}}},
                configure: {
                    enabled: false,
                    showButton: false
                }
            };
            var grafo = new vis.Network(contenerdor, datos, opciones);
        }
       
    }]);

})();
