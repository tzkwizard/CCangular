(function () {
    'use strict';
        
    var serviceId = 'datacontext';  
    angular.module('app').factory(serviceId, ['common','entityManagerFactory','model', 'repositories', datacontext]);

    function datacontext(common, emFactory,model, repositories) {
      //  var EntityQuery = breeze.EntityQuery;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
      //  var Predicate = breeze.Predicate;
        var logError = getLogFn(serviceId, 'error');
        var logSuccess = getLogFn(serviceId, 'success');
        var manager = emFactory.newManager();
        var $q = common.$q;
        var primePromise;
        var repoNames = ['attendee', 'lookup', 'session', 'speaker'];
        var entityNames = model.entityNames;

        var storeMeta = {
            isLoaded: {
                sessions: false,
                attendees:false
            }
        };

        

        var service = {
            prime: prime,
           getPeople: getPeople,
            getMessageCount: getMessageCount,
            /* getSessionPartials: getSessionPartials,
            getSpeakerPartials: getSpeakerPartials,
            getAttendsPartials: getAttendsPartials,
            getFilteredCount: getFilteredCount,
            getAttendeeCount: getAttendeeCount,
            getSessionCount: getSessionCount,
            getSpeakerCountLocal: getSpeakerCountLocal,
            getSpeakerTopLocal: getSpeakerTopLocal,
            getTrackCounts: getTrackCounts*/
        };
        init();
        return service;
        function init()
        {            
            repositories.init(manager);
            defineLazyLoadedRepos();
        }
        // Add ES5 property to datacontext for each named repo
        function defineLazyLoadedRepos()
        {
            repoNames.forEach(function(name)
            {
                Object.defineProperty(service, name, {
                    configurable: true, // will redefine this property once
                    get: function()
                    {
                        // The 1st time the repo is request via this property, 
                        // we ask the repositories for it (which will inject it).
                        var repo = repositories.getRepo(name);

                        // Rewrite this property to always return this repo;
                        // no longer redefinable
                        Object.defineProperty(service, name, {
                            value: repo,
                            configurable: false,
                            enumerable: true
                        });

                        return repo;
                    }
                });
            });
        }

        function prime() {
            if (primePromise) return primePromise;
            primePromise = $q.all([service.lookup.getAll(), service.speaker.getPartials(true)])
                .then(extendMetadata)
                .then(success);
            return primePromise;
            function success() {
                service.lookup.setLookups();
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

        /*        function getAttendsPartials(forceRemote,page,size,nameFilter) {
            var Orderby = 'firstName,lastName';
            var attendees = [];

            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            if (_areAttendeesLoad() && !forceRemote) {
                return $q.when(getByPage());

                //attendees = _getAlllocal(entityNames.attendee, Orderby);
                return $q.when(attendees);
            }

            return EntityQuery.from('Persons')
            .select('id,firstName,lastName,imageSource')
            .orderBy(Orderby)
            .toType(entityNames.attendee)
            .using(manager).execute()
            .then(querySucceeded, _queryFailed);


            function getByPage() {
                var predicate = null;
                if (nameFilter) {
                    predicate = _fullNamePredicate(nameFilter);
                }
                var attendees = EntityQuery.from(entityNames.attendee)
                    .where(predicate)
                    .take(take)
                    .skip(skip)
                    .orderBy(Orderby)
                    .using(manager) 
                    .executeLocally();
                return attendees;
            }


            function querySucceeded(data) {
                // attendees = data.results;

                _areAttendeesLoad(true);
                log('Retrieved [Attendee Partials] from remote data source', data.results.length, true);
                return getByPage();
            }
        }
        function getAttendeeCount() {
            if (_areAttendeesLoad()) {
                return $q.when(_getLocalEntityCount(entityNames.attendee));               
            }
            return EntityQuery.from('Persons').take(0).inlineCount()
                .using(manager).execute()
                .to$q(_getInlineCount); 
        }

       function  getSessionCount(){
           if (_areSessionsLoad()) {
               return $q.when(_getLocalEntityCount(entityNames.session));
           }
           return EntityQuery.from('Sessions').take(0).inlineCount()
               .using(manager).execute()
               .then(_getInlineCount);
       }

       function getTrackCounts() {
          return getSessionPartials().then(function (data) {
               var sessions = data;
               //loop thru the sessions and create a mapped track counter object
               var trackMap = sessions.reduce(function (accum, session) {
                   var trackName = session.track.name;
                   var trackId = session.track.id;
                   if (accum[trackId - 1]) {
                       accum[trackId - 1].count++;
                   }
                   else {
                       accum[trackId - 1] =
                           {
                               track: trackName,
                               count: 1
                           };
                   }

                   return accum;
               }, []);
               return trackMap;
           });
       }

       function getSpeakerCountLocal() {
           var orderBy = 'firstName,lastName';
           var predicate = Predicate.create('isSpeaker', '==', true);
           return _getAlllocal(entityNames.speaker,orderBy,predicate);
       }

       function getSpeakerTopLocal()
        {
            var orderBy = 'firstName,lastName';
            var predicate = Predicate.create('lastName', '==', 'Papa')
                .or('lastName', '==', 'Guthrie')
                .or('lastName', '==', 'Bell')
                .or('lastName', '==', 'Hanselman')
                .or('lastName', '==', 'Lerman')
                .and('isSpeaker', '==', true);

            return _getAlllocal(entityNames.speaker, orderBy, predicate);
        }


        function _getInlineCount(data) {
            return data.inlineCount;
        }
        function _getLocalEntityCount(resource) {
            var entities = EntityQuery.from(resource)
                                     .using(manager)
                                      .executeLocally();
            return entities.length;
        }

        function getFilteredCount(nameFilter) {
            var predicate = _fullNamePredicate(nameFilter);
            var attendees = EntityQuery.from(entityNames.attendee)
                   .where(predicate)
                   .using(manager)
                   .executeLocally();
            return attendees.length;
        }

        function _fullNamePredicate(filterValue) {
            return Predicate.create('firstName', 'contains', filterValue).or('lastName', 'contains', filterValue);
        }

        function getSpeakerPartials(forceRemote) {
            var predicate = Predicate.create('isSpeaker', '==', true);
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
*/
    }

})();