(function () {
    'use strict';

    var controllerId = 'attendees';
    angular
        .module('app')
        .controller(controllerId, ['common', 'datacontext', attendees]);


  

    function attendees(common,datacontext) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Attendees';
       
        vm.attendees = [];
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        vm.refresh = refresh;
        activate();

        function activate() {

            common.activateController([getAttends()], controllerId)
                .then(function () { log('Activated Attendee View'); });

        }
        function getAttends(forceRefresh) {
            return datacontext.getAttendsPartials(forceRefresh).then(function (data) {
               return vm.attendees = data;
            });
        }
        function refresh() {
            getAttends(true);
        }
    }
})();
