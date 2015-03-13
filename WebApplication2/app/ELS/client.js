(function () {
    'use strict';

    angular
        .module('app')
        .service('client', function(esFactory) {
        return esFactory({
            host: 'localhost:9200',
            log: 'trace'
        });
    });
})();