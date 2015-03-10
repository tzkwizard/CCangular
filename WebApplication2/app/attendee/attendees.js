(function () {
    'use strict';

    var controllerId = 'attendees';
    angular 
        .module('app')
        .controller(controllerId, ['common','config', 'datacontext', attendees]);


  

    function attendees(common,config,datacontext) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Attendees';
       
       
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;

        vm.attendees = [];
        vm.attendeeCount = 0;
        vm.attendeeFilteredCount = 0;
        vm.attendeeSearch = '';
        vm.filteredAttendees = [];
        vm.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 25
        };
        vm.pageChanged = pageChanged;

        vm.search = search;
        vm.refresh = refresh;
        activate();


        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                return Math.floor(vm.attendeeFilteredCount / vm.paging.pageSize) + 1;
            }
        });


       

    function getAttendeeCount() {
            //return datacontext.getAttendeeCount().then(function (data) {
        return datacontext.attendee.getCount().then(function (data) {
                
                return vm.attendeeCount = data;
            });
        }

        function getAttendeeFilteredCount() {
            vm.attendeeFilteredCount = datacontext.attendee.getFilteredCount(vm.attendeeSearch);
        }



        function activate() {

            common.activateController([getAttends()], controllerId)
                .then(function () { log('Activated Attendee View'); });

        }
        function getAttends(forceRefresh) {
            return datacontext.attendee.getAll(forceRefresh, vm.paging.currentPage, vm.paging.pageSize, vm.attendeeSearch).then(function (data) {
                vm.attendees = data;
                if (!vm.attendeeCount || forceRefresh) {
                    // Only grab the full count once or on refresh
                    getAttendeeCount();
                }
                getAttendeeFilteredCount();
                return data;
            });
        }
        function refresh() {
            getAttends(true);
        }

        function pageChanged() {
           /* if (!page) {
                return;
            }
            vm.paging.currentPage = page;*/
            getAttends();
        }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.attendeeSearch = '';
            }

            getAttends();
        }
    }
})();
