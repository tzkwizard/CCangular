(function () {
    'use strict';

    var controllerId = 'els';

    angular.module('app')
     .controller(controllerId, function ($scope, common, client) {


       
         var vm = this;
         vm.fi = "";
         var getLogFn = common.logger.getLogFn;
         var log = getLogFn(controllerId);
         vm.search = search;
         vm.filter1 = filter1;
         vm.filter2 = filter2;
         vm.searchText = 'hello';
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
             console.log("test");
             console.log(ejs.Request().query(ejs.MatchQuery('message', searchText)));

             if (searchText == undefined)
                 searchText = 0;
             client.search({
                 index: 'mytest',
                 type: 'post',
                 body: ejs.Request()
                     .query(ejs.MatchQuery('message', searchText))
                 // .SumAggregation.field('message')
                //  .NumericRangeFilter('id').gt(2)
             }, function (err, resp) {
                 vm.hits = resp.hits.hits;
                 if (err != undefined) {
                     log(err);
                 }

             });
         }


         function agg(searchText) {
             if (searchText == undefined)
                 searchText = 0;
             client.search({
                 index: 'mytest',
                 type: 'post',
                 body: {
                     "query": {
                         "match": {
                             "message": "hello"
                         }

                     },
                     "aggs": {
                         "all_wordees": {
                             "terms": {
                                 "field": "message"
                             }
                         }
                     }

                 }
             }, function (err, resp) {
                 vm.hits = resp.aggregations.all_wordees;
                 if (err != undefined) {
                     log(err);
                 }

             });
         }






         function filter2(searchText) {
             if (searchText == undefined)
                 searchText = 0;
             client.search({
                 index: 'mytest',
                 type: 'post',
                 body: ejs.Request()
                     .query(ejs.MatchQuery('message', searchText))
                     .filter(ejs.TermFilter('id',vm.fi))
         }, function (err, resp) {
                 vm.hits = resp.hits.hits;
                 if (err!=undefined) {
                     log(err);
                 }
                 
             });
         }


         function filter1(searchText) {
            client.search({
                 index: 'mytest',
                 type: 'post',
                 body: {
                     query: {                      
                         /*match: {
                             "message": searchText
                         }*/
                         "filtered": {
                             "query": {
                                 "match": {
                                     "message": "hello"
                                 }
                             },
                             "filter": {
                                 "term": {
                                     "id": 2
                                 }
                             }
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
