(function () {
    'use strict';
    var controllerId = 'sessions';
    angular
        .module('app')
        .controller(controllerId, ['$routeParams','common','config', 'datacontext', sessions]);

    // sessions.$inject = ['$location']; 

    function sessions($routeParams,common, config, datacontext) {
        /* jshint validthis:true */
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var applyFilter = function () { };
        vm.filteredSessions = [];
        vm.search = search;
        vm.sessionsSearch = $routeParams.searchvarible || '';
        var keyCodes = config.keyCodes;
        vm.sessionsFilter = sessionsFilter;

        vm.title = 'Sessions';
        vm.sessions = [];

        vm.refresh = refresh;
        activate();

        function activate() {
            var promises = [getSessions()];
            common.activateController(promises, controllerId)
                .then(function () {
                    // createSearchThrottle uses values by convention, via its parameters:
                    //     vm.sessionsSearch is where the user enters the search 
                    //     vm.sessions is the original unfiltered array
                    //     vm.filteredSessions is the filtered array
                    //     vm.sessionsFilter is the filtering function
                    applyFilter = common.createSearchThrottle(vm, 'sessions');
                    if (vm.sessionsSearch) { applyFilter(true); }
                 log('Activated Sessions View');
            });
        }
        function getSessions(forceRefresh){
            return datacontext.session.getPartials(forceRefresh).then(function (data) {
                return vm.sessions = vm.filteredSessions = data;
        });
        }
        function refresh() {
            getSessions(true);
        }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.sessionsSearch = '';
                applyFilter(true);
            } else {
                applyFilter();
            }
        }

        function sessionsFilter(session) {
            var textContains = common.textContains;
            var searchText = vm.sessionsSearch;
            var isMatch = searchText ?
                textContains(session.title, searchText)
                    || textContains(session.tagsFormatted, searchText)
                    || textContains(session.room.name, searchText)
                    || textContains(session.track.name, searchText)
                    || textContains(session.speaker.fullName, searchText)
                : true;
            return isMatch;
        }

    }
})();