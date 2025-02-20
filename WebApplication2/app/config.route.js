﻿(function () {
    'use strict';

    var app = angular.module('app');

    // Collect the routes
    app.constant('routes', getRoutes());
    
    // Configure the routes and route resolvers
    app.config(['$routeProvider', 'routes', '$locationProvider', routeConfigurator]);
    function routeConfigurator($routeProvider, routes, $locationProvider) {


     /*   $locationProvider.html5Mode({
            enabled: true,
           
        });
       //TODO get rid of me 
        $routeProvider.when('/invalid', {
            templateUrl:'/app/els/els.html'   
            }
            );*/

         //TODO get rid of me 
       /* $routeProvider.when('/pass', {
            templateUrl: 'app/session/sessions.html',
            resolve: {fake:fakeAllow}
            }
            );

        fakeAllow.$inject = ['$q'];
        function fakeAllow($q) {
            var data = { x: 1 };
            var defer = $q.defer();
            var promise = defer.promise;
            promise.then(function () { toastr.info("get --"); });
            defer.resolve(data);
            promise.then(function () { toastr.info("get it"); });
            return defer.promise;
        }
        $routeProvider.when('/fail', {
            templateUrl: 'app/session/sessions.html',
            resolve: { fake: fakeReject }
        }
             );

        fakeReject.$inject = ['$q'];
        function fakeReject($q) {
            var data = { x: 1 };
            var defer = $q.defer();
            defer.reject({msg:'haha'});
            return defer.promise;
        }*/

        routes.forEach(function (r) {
           // $routeProvider.when(r.url, r.config);
            setRoute(r.url, r.config);
        });
        $routeProvider.otherwise({ redirectTo: '/' });
        function setRoute(url, definition) {
            definition.resolve = angular.extend(definition.resolve || {}, {
                prime: prime
            });

            $routeProvider.when(url, definition);
        }
    }

    prime.$inject = ['datacontext'];
    function prime(d) {
       //return d.prime();
    }
    // Define the routes 
    function getRoutes() {
        return [
            {
                url: '/dashboard',
                config: {  
                    templateUrl: 'app/dashboard/dashboard.html',
                    title: 'dashboard',
                    settings: {
                        nav: 1,
                        content: '<i class="fa fa-dashboard"></i> Dashboard'
                    }
                }
            }, {
                url: '/admin',
                config: {
                    title: 'admin',
                    templateUrl: 'app/admin/admin.html',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-lock"></i> Admin'
                    }
                }
            },
             {
                url: '/sessions',
                config: {
                    title: 'sessions',
                    templateUrl: 'app/session/sessions.html',
                    settings: {
                        nav: 3,
                        content: '<i class="fa fa-calendar"></i> Sessions '
                    }
                }
             }
             ,
              {
                  url: '/sessions/search/:searchvarible',
                  config: {
                      title: 'sessions-search',
                      templateUrl: 'app/session/sessions.html',
                      settings: {
                      }
                  }
              }
             ,
             {
                 url: '/speakers',
                 config: {
                     title: 'speakers',
                     templateUrl: 'app/speaker/speakers.html',
                     settings: {
                         nav: 4,
                         content: '<i class="fa fa-key"></i> Speakers'  
                     }
                 }
             }
             ,
             {
                 url: '/attendees',
                 config: {
                     title: 'attendees',
                     templateUrl: 'app/attendee/attendees.html',
                     settings: {
                         nav: 5,
                         content: '<i class="fa fa-cab"></i> Attendees'
                     }
                 }
             }
              ,
             {
                 url: '/',
                 config: {
                     title: 'els',
                     templateUrl: 'app/ELS/els.html',
                     settings: {
                         nav: 6,
                         content: '<i class="fa fa-search"></i> ELS'
                     }
                 }
             },{
                 url: '/aggs',
                 config: {
                     title: 'aggs',
                     templateUrl: 'app/ELS/aggs.html',
                     settings: {
                         nav: 7,
                         content: '<i class="fa fa-area-chart"></i> Aggs'
                     }
                 }
             }
        ];
    }

    /*app.use(function (req, res) {
        res.sendfile(__dirname + '/Public/index.html');
    });*/
    

})();