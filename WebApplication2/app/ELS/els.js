(function () {
    'use strict';

    var controllerId = 'els';

    angular.module('app')
        .controller(controllerId, function($scope, $location, common, client) {


            var vm = this;
           vm.title = "Elasticsearch";
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
            vm.type = 'log';
            vm.filterAggName = "";
            vm.pagecount = 10;
            vm.indices = ['logs', 'logsd'];           
            vm.total = "";
           
            vm.paging = {
                currentPage: 1,
                maxPagesToShow: 5,
                pageSize: 8
            };

            Object.defineProperty(vm.paging, 'pageCount', {
                get: function () {
                    return Math.floor(vm.total / vm.paging.pageSize) + 1;
                }
            });

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
            vm.f = f;
            vm.pageChanged = pageChanged;
            vm.getresult = getresult;

            function getresult(res) {
                vm.res = [];
                vm.j = 0;
                vm.pagenumber = vm.paging.pageSize * vm.paging.currentPage;
                if (vm.pagenumber > vm.total)
                    vm.pagenumber = vm.total;
                for (vm.i = (vm.paging.currentPage - 1) * vm.paging.pageSize; vm.i < vm.pagenumber; vm.i++) {
                    vm.res[vm.j] = res[vm.i];
                    vm.j++;
                }
            }



            function pageChanged() {
                log("1");
                vm.getresult(vm.hitSearch);
                log("2");
            }
         
   



            function f(doc) {
                if (doc.mapping === "")
                    return doc.full_name;
                return "";
            }
            function test(searchText) {
              /*  client.search({
                    index: vm.indices,
                    type: 'log',
                    size: vm.pagecount,
                    body: ejs.Request()
                    //.query(ejs.MatchQuery("message", searchText).zeroTermsQuery("all"))
                    //.query(ejs.BoolQuery().must(ejs.MatchQuery("message", searchText)).mustNot(ejs.MatchQuery("message", "java")))
                    //  .query(ejs.BoostingQuery(ejs.MultiMatchQuery(["username", "response", "message", "ip"], searchText), ejs.MatchQuery("message", "java"), 0.2))
                    //   .query(ejs.CommonTermsQuery("message", searchText).cutoffFrequency(0.01).highFreqOperator("and").minimumShouldMatchLowFreq(2))
                       .query(ejs.RangeQuery("ip").gte("19.18.200.201").lte("19.18.200.204"))
                }).then(function (resp) {
                    vm.hitSearch = resp.hits.hits;
                }, function (err) {
                    log(err.message);
                });*/


                client.indices.getFieldMapping({
                    local: true,
                    index: 'logs',
                    type: 'log',
                    field: '*'
                }).then(function (resp) {
                    vm.hitSearch = resp.logs.mappings.log;
                   
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
                       index: vm.indices,
                       type: vm.type,
                        size: vm.pagecount,
                        body: {
                            query: {
                                "match_all": {}
                            }
                        }
                    }
                ).then(function(resp) {
                    vm.hitSearch = resp.hits.hits;

                    vm.total = resp.hits.total < vm.pagecount?resp.hits.total:vm.pagecount;  
                    vm.getresult(vm.hitSearch);
                    log('Loaded sample document');
                }, function(err) {
                    log(err.message);
                });
            }


            function changev(aggName) {
                client.search({
                    index: 'logs',
                    type: vm.type,
                    body: {
                        "aggs": {
                            "myagg1": {
                                "terms": {
                                    "field": "ip",
                                    "size": 10
                                }
                            },
                            "myagg2": {
                                "terms": {
                                    "field": "username",
                                    "size": 10
                                }
                            },
                            "myagg3": {
                                "terms": {
                                    "field": "response",
                                    "size": 10
                                }
                            },
                            "myagg4": {
                                "terms": {
                                    "field": "message",
                                     "size":10
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
                if (searchText == undefined||searchText==="") {
                    log("input text");
                    init();
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
                 type: vm.type,
                 size: vm.pagecount,
                 body: ejs.Request()
                     .query(ejs.MatchQuery(vm.aggName, searchText))
                    .filter(ejs.TermFilter(vm.filterAggName, vm.fi))
  
             }).then(function (resp) {
                 vm.hitSearch = resp.hits.hits;

                 if (resp.hits.total > vm.pagecount)
                 { vm.total = vm.pagecount;}
                 else
                { vm.total=resp.hits.total;}
                 vm.getresult(vm.hitSearch);
             }, function (err) {
                 log(err.message);
             });
               
         }
      
         function searchWithoutFilter(searchText) {
             client.search({
                 index: 'logs',
                 type: vm.type,
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
         }




         function mSearch(searchText) {
             client.search({
                 index: 'logs',
                 type: vm.type,
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
                index: vm.indices,
                type: vm.type,
                size: vm.pagecount,
                body: ejs.Request()
                    .query(ejs.QueryStringQuery(searchText))
            }).then(function (resp) {
                vm.hitSearch = resp.hits.hits;
                vm.total = resp.hits.total;
                vm.getresult(vm.hitSearch);
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
                 log('elasticsearch cluster is connected');
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

             //table

             var table = new google.visualization.ChartWrapper({
                 'chartType': 'Table',
                 'containerId': 'chart2',
                 'options': {
                     'width': '300px'
                 }
             });
             
             // Establish dependencies, declaring that 'filter' drives 'pieChart',
             // so that the pie chart will only display entries that are let through
             // given the chosen slider range.
             dashboard.bind(donutRangeSlider, [pieChart,table]);

             // Draw the dashboard.
             dashboard.draw(data);
         }

         function drawTable() {
             var data = new google.visualization.DataTable();
             data.addColumn('string', 'Name');
             data.addColumn('number', 'Salary');
             data.addColumn('boolean', 'Full Time Employee');
             data.addRows([
               ['Mike', { v: 10000, f: '$10,000' }, true],
               ['Jim', { v: 8000, f: '$8,000' }, false],
               ['Alice', { v: 12500, f: '$12,500' }, true],
               ['Bob', { v: 7000, f: '$7,000' }, true]
             ]);

             var table = new google.visualization.Table(document.getElementById('table_div'));

             table.draw(data, { showRowNumber: true });
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
