(function() {
    'use strict';

    var serviceId = 'model';

    angular.module('app').factory(serviceId, model);
     
    
    function model () {

        var entityNames = {
            attendee: 'Person',
            person: 'Person',
            speaker: 'Person',
            session: 'Session',
            room: 'Room',
            track: 'Track',
            timeslot: 'TimeSlot'
        };

        var service = {
            configurationMetadataStore: configurationMetadataStore,
            entityNames:entityNames
        };
        return service;

        function registerTimeSlot(metadataStore) {
            metadataStore.registerEntityTypeCtor('TimeSlot', TimeSlot);

            function TimeSlot() { };
            
            Object.defineProperty(TimeSlot.prototype, 'name', {
                get: function () {
                    var start = this.start;

                    var value =  moment.utc(start).format('ddd hh:mm a') ;

                    return value;
                }
            });
        }

        function registerPerson(metadataStore) {
            metadataStore.registerEntityTypeCtor('Person', Person);

            function Person() {
                this.isSpeaker = false;
                this.isPartial = false;
            };

            Object.defineProperty(Person.prototype, 'fullName', {
                get: function () {
                    var fn = this.firstName;
                    var ln = this.lastName;

                    return ln ? fn + ' ' + ln : fn;
                }
            });
        }

        function registerSession(metadataStore) {
            metadataStore.registerEntityTypeCtor('Session', Session);

            function Session() {
                this.isPartial = false;
            };

            Object.defineProperty(Session.prototype, 'tagsFormatted', {
                get: function () {
                    return this.tags ? this.tags.replace(/\|/g, ', ') : this.tags;
                },
                set: function (value) {
                    this.tags = value.replace(/\, /g, '|');
                }
            });
        }

        function configurationMetadataStore(metadataStore) {
            registerSession(metadataStore);
            registerPerson(metadataStore);
            registerTimeSlot(metadataStore);

           // modelValidation.createAndRegister(entityNames);
        }
    }

})();