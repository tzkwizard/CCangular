(function () {
    'use strict';
        
    var serviceId = 'datacontext';  
    angular.module('app').factory(serviceId, ['common','entityManagerFactory','model', datacontext]);

    function datacontext(common, emFactory,model) {
        var EntityQuery = breeze.EntityQuery;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        
        var logError = getLogFn(serviceId, 'error');
        var logSuccess = getLogFn(serviceId, 'success');
        var manager = emFactory.newManager();
        var $q = common.$q;
        var primePromise;
        var entityNames = model.entityNames;

        var storeMeta = {
            isLoaded: {
                sessions: false,
                attendees:false
            }
        };

        

        var service = {
            getPeople: getPeople,
            getMessageCount: getMessageCount,
            getSessionPartials: getSessionPartials,
            getSpeakerPartials: getSpeakerPartials,
            prime: prime,
            getAttendsPartials:getAttendsPartials
        };

        return service;

        function getMessageCount() { return $q.when(72); }

        function getPeople() {
            var people = [
                { firstName: 'John', lastName: 'Papa', age: 25, location: 'Florida' },
                { firstName: 'Ward', lastName: 'Bell', age: 31, location: 'California' },
                { firstName: 'Colleen', lastName: 'Jones', age: 21, location: 'New York' },
                { firstName: 'Madelyn', lastName: 'Green', age: 18, location: 'North Dakota' },
                { firstName: 'Ella', lastName: 'Jobs', age: 18, location: 'South Dakota' },
                { firstName: 'Landon', lastName: 'Gates', age: 11, location: 'South Carolina' },
                { firstName: 'Haley', lastName: 'Guthrie', age: 35, location: 'Wyoming' }
            ];
            return $q.when(people);
        }

        function getAttendsPartials(forceRemote) {
            var Orderby = 'firstName,lastName';
            var attendees = [];

            if (_areAttendeesLoad() && !forceRemote) {
                attendees = _getAlllocal(entityNames.attendee, Orderby);
                return $q.when(attendees);
            }

            return EntityQuery.from('Persons')
            .select('id,firstName,lastName,imageSource')
            .orderBy(Orderby)
            .toType(entityNames.attendee)
            .using(manager).execute()
            .then(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                attendees = data.results;
                _areAttendeesLoad(true);
                log('Retrieved [Attendee Partials] from remote data source', attendees.length, true);
                return attendees;
            }
        }


        function getSpeakerPartials(forceRemote) {
            var predicate = breeze.Predicate.create('isSpeaker', '==', true);
            var speakerOrderby = 'firstName,lastName';
            var speakers = [];
                
            if (!forceRemote) {
                speakers= _getAlllocal(entityNames.speaker, speakerOrderby,predicate);
                return $q.when(speakers);
            }

            return EntityQuery.from('Speakers')
            .select('id,firstName,lastName,imageSource')
            .orderBy(speakerOrderby)
            .toType(entityNames.speaker)
            .using(manager).execute()
            .then(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                speakers = data.results;
                for(var i= speakers.length;i--;) {
                    speakers[i].isSpeaker = true;
                }
                log('Retrieved [Speaker Partials] from remote data source', speakers.length, true);
                return speakers;
            }
        }


        function getSessionPartials(forceRemote) {
            var orderBy = 'timeSlotId,level,speaker.firstName';
            var sessions;

            if (_areSessionsLoad() && !forceRemote) {              
                sessions = _getAlllocal(entityNames.session, orderBy);
                return $q.when(sessions);
            }
            
            return EntityQuery.from('Sessions')
            .select('id,title,code,speakerId,trackId,timeSlotId,roomId,level,tags')
            .orderBy(orderBy)
            .toType(entityNames.session)
            .using(manager).execute()
            .then(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                sessions = data.results;
                _areSessionsLoad(true);
                log('Retrieved [Session Partials] from remote data source', sessions.length, true);
                return sessions;
            }
            

        }   

        function prime() {
            if (primePromise) return primePromise;
            primePromise = $q.all([getLookups(), getSpeakerPartials(true)]).then(extendMetadata).then(success);
            return primePromise;
            function success() {
                setLookups();
                log("Primed data");
            }
            function extendMetadata() {
                var metadataStore = manager.metadataStore;
                var types = metadataStore.getEntityTypes();
                types.forEach(function (type) {
                    if (type instanceof breeze.EntityType) {
                        set(type.shortName, type);
                    }
                });
                var personEntityName = entityNames.person;
                ['Speakers', 'Speaker', 'Attendees', 'Attendee'].forEach(function (r) {
                    set(r, personEntityName);
                });
                function set(resourceName,entityName) {
                    metadataStore.setEntityTypeForResourceName(resourceName,entityName);
                }
            }
        }

        function setLookups() {
           
            service.lookupCacheData = {
                rooms: _getAlllocal(entityNames.room,'name'),
                tracks: _getAlllocal(entityNames.track, 'name'),
                timeslots: _getAlllocal(entityNames.timeslot, 'start')

            };
        }
        function _getAlllocal(resource, ordering, predicate) {
            return EntityQuery.from(resource)
                .orderBy(ordering)
                .where(predicate)
                .using(manager)
                .executeLocally();
        }
        function getLookups() {
            return EntityQuery.from('Lookups')
                .using(manager).execute()
                .to$q(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                log('Retrieved [Lookups]', data, true);
                return true;
            }

        }


        function _queryFailed(error) {
            var msg = config.appErrorPrefix + 'Error retreiving data.' + error.message;
            logError(msg, error);
            throw error;
        }

        function _areSessionsLoad(value) {
            return _areItemsLoaded('sessions', value);
        }
       

        function _areAttendeesLoad(value) {
            return _areItemsLoaded('attendees', value);
          
        }
        function _areItemsLoaded(key, value) {
            if (value == undefined) {
            
                 return storeMeta.isLoaded[key];
            }//get
          
            return storeMeta.isLoaded[key] = value; //set
        }

    }

})();