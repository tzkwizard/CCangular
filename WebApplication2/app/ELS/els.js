(function () {
    'use strict';

    var controllerId = 'els';

    angular.module('app')
     .controller(controllerId, function ($scope, common, client) {

        var vm = this;
         var getLogFn = common.logger.getLogFn;
         var log = getLogFn(controllerId);
         vm.search = search;
         vm.searchText = '';
         vm.acount = 4;
        vm.hits = "2";
        //var hits = hits;
         client.ping({
             requestTimeout: 1000,
             // undocumented params are appended to the query string
             hello: "elasticsearch!"
         }, function (error) {
             if (error) {
                 log('elasticsearch cluster is down!');
             } else {
                 log('All is well');
             }
         });

        

         function search(searchText) {
            client.search({
                 index: 'azure',
                 type: 'activitylog',
                 body: {
                     query: {
                         // "match_all": {}
                         match: {
                             "time": searchText
                         }
                     }
                 }
             }
            ).then(function (resp) {
                vm.hits = resp.hits.hits;
               // $scope.acount = $scope.hits.total;
            }, function (err) {
                log(err.message);
            });

            client.count({
                index: 'azure',
                type: 'activitylog',
                body: {
                    query: {
                        // "match_all": {}
                        match: {
                            "time": searchText
                        }
                    }
                }
            }
            ).then(function (resp2) {                
                vm.acount = resp2.count;
            }, function (err) {
                log(err.message);
            });

        }
/*     

       //  var ejs = ejsResource('http://localhost:9200');

         var oQuery = ejs.QueryStringQuery().defaultField('Title');

         var client = ejs.Request()
             .indices('stackoverflow')
             .types('question');

         $scope.search = function () {
             $scope.results = client
                 .query(oQuery.query($scope.queryTerm || '*'))
                 .doSearch();
         };
*/

        activate();
         function activate() {
             common.activateController([], controllerId)
                 .then(function () { log('Activated ELS search View'); });
         }
     


     });
})();
