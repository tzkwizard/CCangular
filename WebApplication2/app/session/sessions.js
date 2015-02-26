(function () {
    'use strict';
    var controllerId = 'sessions';
    angular
        .module('app')
        .controller(controllerId, ['common', 'datacontext', sessions]);

    // sessions.$inject = ['$location']; 

    function sessions(common, datacontext) {
        /* jshint validthis:true */
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        
        vm.title = 'Sessions';
        vm.sessions = [];

        vm.refresh = refresh;
        activate();

        function activate() {
            var promises = [getSessions()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Sessions View'); });
        }
        function getSessions(forceRefresh){
            return datacontext.getSessionPartials(forceRefresh).then(function (data) {
              return vm.sessions = data;
        });
        }
        function refresh() {
            getSessions(true);
        }
    }
})();