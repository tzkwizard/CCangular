﻿(function () {
    'use strict';

    var serviceId = 'routeMediator';
    angular
        .module('app')
        .factory(serviceId, ['$location','$rootScope','config','logger',routeMediator]);

    //routeMediator.$inject = ['$http'];

    function routeMediator($location, $rootScope, config, logger) {
        var handleRouteChangeError = false;
        var service = {
            setRoutingHandlers: setRoutingHandlers
        };

        return service;

        function setRoutingHandlers() {

           // $rootScope.x = "4";
            updateDocTitle();
            handleRoutingErrors();  
        }


        function handleRoutingErrors() {
            $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
               if (handleRouteChangeError) {
                    return;
                }

              handleRouteChangeError = true;

                var msg = 'Error routing: ' + (current && current.name) + '. ' + (rejection.msg || '');

                logger.logWarning(msg, current, serviceId, true);

                $location.path('/');
            });
        }   

        function updateDocTitle() {
            $rootScope.$on('$routeChangeSuccess',
                function (event, current, previous) {
                    handleRouteChangeError = false;
                    var title = config.docTitle + (current.title || '');

                    $rootScope.title = title;
                }
            );
        }
    }
})();