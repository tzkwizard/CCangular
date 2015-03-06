(function () {
    'use strict';
    var controllerId = 'dashboard';
    angular.module('app').controller(controllerId, ['common', 'datacontext', dashboard]);

    function dashboard(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.news = {
            title: 'Code Camp',
            description: 'Code Camp is a community event where developers learn from fellow developers. All are welcome to attend and speak. Code Camp is free, by and for the deveoper community, and occurs on the weekends.'
        };

        vm.attendeeCount = 0;
        vm.speakerCount = 0;
        vm.sessionCount = 0;
        vm.messageCount = 0;
       // vm.people = [];
        vm.title = 'Dashboard';

        vm.content = {
            predicate: '',
            reverse: false,
            setSort: setContentSort,
            title: 'Content',
            tracks: []
        };
        vm.map = {
            title: 'Location'
        };

        vm.speakers = {
            interval: 5000,
            list: [],
            title: 'Top Speakers'
        };


        activate();

        function activate() {
            getSpeakerTopLocal();
            var promises = [getMessageCount(), getAttendeeCount(), getSessionCount(), getSpeakerCount(), getTrackCounts()];
                common.activateController(promises, controllerId)
                    .then(function () { log('Activated Dashboard View'); });
        }
        
        function getMessageCount() {
            return datacontext.getMessageCount().then(function (data) {
                return vm.messageCount = data;
            });
        }
        function getAttendeeCount() {
            return datacontext.attendee.getCount().then(function (data) {
                return vm.attendeeCount = data
            //var attendee = datacontext.getAttendsPartials();
            
           // vm.attendeeCount = attendee.length;
           
       });
        }
        
        function getSessionCount() {
            return datacontext.session.getCount().then(function (data) {
                return vm.sessionCount = data;
            });
        }

        function getTrackCounts() {
            return datacontext.session.getTrackCounts().then(function (data) {
                return vm.content.tracks = data;
            });
          
        }


        function getSpeakerTopLocal() {
            vm.speakers.list = datacontext.speaker.getTopLocal();
        }

            
        function getSpeakerCount() {
            var speakers = datacontext.speaker.getAllLocal();
            vm.speakerCount = speakers.length;
        }



       /* function getPeople() {
            return datacontext.getPeople().then(function (data) {
                return vm.people = data;
            });
        }*/
        function setContentSort(prop) {
            vm.content.predicate = prop;
            vm.content.reverse = !vm.content.reverse;
        }

    }
})();