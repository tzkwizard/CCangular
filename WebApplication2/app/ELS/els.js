(function () {
    'use strict';

    var controllerId = 'els';

    angular.module('app')
        .controller(controllerId, function($scope, $location, common, client) {


            var vm = this;
            //variable
            vm.fi = "";
            var getLogFn = common.logger.getLogFn;
            var log = getLogFn(controllerId);
            vm.searchText = 'hello';
            vm.hitSearch = "";
            vm.acount = 4;
            vm.hits = "2";
            vm.total = 0;
            vm.mystyle = { 'color': 'blue' };
            vm.aggName = "";
            vm.type = "";
            vm.filterAggName = "";
            vm.pagecount = 100;
        vm.fieldName = {};
        //function
            vm.search = search;
            vm.mSearch = mSearch;
            vm.changev = changev;
            vm.searchWithoutFilter = searchWithoutFilter;
            vm.filtertemp = filtertemp;
            vm.init = init;
            vm.test = test;
            vm.stringSearch = stringSearch;
            activate();

            function test(doc, searchText) {
                client.search({
                    index: 'logsd',
                    type: 'log',
                    size: vm.pagecount,
                    body: ejs.Request().
                         filter(ejs.NumericRangeFilter("response").gt(202).lt(205))
                }).then(function (resp) {
                    vm.hitSearch = resp.hits.hits;
                }, function (err) {
                    log(err.message);
                });
                //toastr.info(doc._source.ip + "\r\n" + doc._source.username);
            }

            function activate() {
                common.activateController([], controllerId)
                    .then(function() {
                        init();
                        log('Activated ELS search View');
                        google.setOnLoadCallback(drawDashboard);

                    });
            }

            function init() {
                client.search({
                        index: 'logs',
                        type: 'log',
                        size: vm.pagecount,
                        body: {
                            query: {
                                "match_all": {}
                            }
                        }
                    }
                ).then(function(resp) {
                    vm.hitSearch = resp.hits.hits;
                }, function(err) {
                    log(err.message);
                });
            }


            function changev(aggName) {
                client.search({
                    index: 'logs',
                    type: 'log',
                    body: {
                        "aggs": {
                            "myagg1": {
                                "terms": {
                                    "field": "ip"
                                }
                            },
                            "myagg2": {
                                "terms": {
                                    "field": "username"
                                }
                            },
                            "myagg3": {
                                "terms": {
                                    "field": "response"
                                }
                            },
                            "myagg4": {
                                "terms": {
                                    "field": "message"
                                }
                            }
                        }
                    }
                }).then(function(resp) {
                    //vm.hits = resp.aggregations;
                    vm.total = resp.hits.total;
                    switch (aggName) {
                    case "ip":
                        vm.hits = resp.aggregations.myagg1;
                        drawDashboard(resp.aggregations.myagg1);
                        break;
                    case "username":
                        drawDashboard(resp.aggregations.myagg2);
                        vm.hits = resp.aggregations.myagg2;
                        break;
                    case "response":
                        drawDashboard(resp.aggregations.myagg3);
                        vm.hits = resp.aggregations.myagg3;
                        break;
                    case "message":
                        drawDashboard(resp.aggregations.myagg4);
                        vm.hits = resp.aggregations.myagg4;
                        break;

                    }
                }, function(err) {
                    log(err.message);
                });

            }


            function search(searchText) {
                if (searchText == undefined) {
                    log("input text");
                    searchText = "";
                }
                if (vm.aggName === "" || vm.aggName === "all") {
                   // mSearch(searchText); 
                    stringSearch(searchText);
                 return;
             }
             if (vm.fi === ""||vm.filterAggName===""||vm.filterAggName==="all") {
                 vm.searchWithoutFilter(searchText);
                 return;
             }
             client.search({
                 index: 'logs',
                 type: 'log',
                 size: vm.pagecount,
                 body: ejs.Request()
                     .query(ejs.MatchQuery(vm.aggName, searchText))
                    .filter(ejs.TermFilter(vm.filterAggName, vm.fi))
  
             }).then(function (resp) {
                 vm.hitSearch = resp.hits.hits;
             }, function (err) {
                 log(err.message);
             });
               
         }
      
         function searchWithoutFilter(searchText) {
             client.search({
                 index: 'logs',
                 type: 'log',
                 size: vm.pagecount,
                 body: ejs.Request()
                     .query(ejs.MatchQuery(vm.aggName, searchText))
             }).then(function (resp) {
                 vm.hitSearch = resp.hits.hits;
             }, function (err) {
                 log(err.message);
             });
         }

         function filtertemp(searchText) {
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




         function mSearch(searchText) {
             client.search({
                 index: 'logs',
                 type: 'log',
                 size: 100,
                 body: {
                     query: {
                         "filtered": {
                             "query": {
                                 "multi_match": {
                                     "query": searchText,
                                     "fields": ["username", "response", "message", "ip"]
                                 }

                             }

                         }

                     }
                 }
             }
             ).then(function (resp) {
                 vm.hitSearch = resp.hits.hits;
             }, function (err) {
                 log(err.message);
             });
            /* client.search({
                 index: 'logs',
                 type: 'log',
                 body: ejs.Request()
                     .query(ejs.MultiMatchQuery(["username", "response", "message", "ip"], searchText))
                 //  .filter(ejs.TermFilter(vm.filterAggName, vm.fi))
             }).then(function (resp) {
                 vm.hitSearch = resp.hits.hits;
             }, function (err) {
                 log(err.message);
         });*/
             }


         function stringSearch(searchText) {
            client.search({
                index: 'logs',
                type: 'log',
                size: vm.pagecount,
                body: ejs.Request()
                    .query(ejs.QueryStringQuery(searchText))
            }).then(function (resp) {
                vm.hitSearch = resp.hits.hits;
            }, function (err) {
                log(err.message);
            });
        }

         client.ping({
             requestTimeout: 1000,
             hello: "elasticsearch!"
         }, function (error) {
             if (error) {
                 log('elasticsearch cluster is down!');
             } else {
                 log('All is well');
             }
         });

 

         function drawDashboard(agg) {
     
             // Create our data table.
             /*var data = google.visualization.arrayToDataTable([
               ['Key', 'Number'],
               [vm.hits.myagg3.buckets[0].key, vm.hits.myagg3.buckets[0].doc_count],
               [vm.hits.myagg3.buckets[1].key, vm.hits.myagg3.buckets[1].doc_count],
               [vm.hits.myagg3.buckets[2].key, vm.hits.myagg3.buckets[2].doc_count],
               [vm.hits.myagg3.buckets[3].key, vm.hits.myagg3.buckets[3].doc_count],
               [vm.hits.myagg3.buckets[4].key, vm.hits.myagg3.buckets[4].doc_count]
             ]);*/
           
             var data = new google.visualization.DataTable();
             data.addColumn('string', 'key');
             data.addColumn('number', 'Number');
             for (var i = 0; i < agg.buckets.length; i++) {
                 data.addRow([agg.buckets[i].key.toString(), agg.buckets[i].doc_count]);
                 
             }        
             // Create a dashboard.
             var dashboard = new google.visualization.Dashboard(
                 document.getElementById('dashboard_div'));

             // Create a range slider, passing some options
             var donutRangeSlider = new google.visualization.ControlWrapper({
                 'controlType': 'NumberRangeFilter',
                 'containerId': 'filter_div',
                 'options': {
                     'filterColumnLabel': 'Number'
                 }
             });

             // Create a pie chart, passing some options
             var pieChart = new google.visualization.ChartWrapper({
                 'chartType': 'PieChart',
                 'containerId': 'chart_div',
                 'options': {
                     'width': 800,
                     'height': 800,
                     'pieSliceText': 'value',
                     'legend': 'right',
                     is3D: true
                 }
             });

             // Establish dependencies, declaring that 'filter' drives 'pieChart',
             // so that the pie chart will only display entries that are let through
             // given the chosen slider range.
             dashboard.bind(donutRangeSlider, pieChart);

             // Draw the dashboard.
             dashboard.draw(data);
         }



         /* $scope.data1.dataTable.addColumn("string", "Name");
        $scope.data1.dataTable.addColumn("number", "Qty");
         $scope.data1.dataTable.addRow(["Test", 1]);
        $scope.data1.dataTable.addRow(["Test2", 2]);
        $scope.data1.dataTable.addRow(["Test3", 3]);
        $scope.data1.title = "My Pie";

        $scope.data2 = {};
        $scope.data2.dataTable = new google.visualization.DataTable();
       $scope.data2.dataTable.addColumn("string", "Name");
       $scope.data2.dataTable.addColumn("number", "Qty");
        $scope.data2.dataTable.addRow(["Test", 1]);
        $scope.data2.dataTable.addRow(["Test2", 2]);
        $scope.data2.dataTable.addRow(["Test3", 3]);


        $scope.data3 = {};
        $scope.data3.dataTable = new google.visualization.DataTable();
       $scope.data3.dataTable.addColumn("string", "Name");
       $scope.data3.dataTable.addColumn("number", "Qty");
        $scope.data3.dataTable.addRow(["Test", 1]);
        $scope.data3.dataTable.addRow(["Test2", 2]);
        $scope.data3.dataTable.addRow(["Test3", 3]);*/



    });
})();
