(function () {
    'use strict';

    var controllerId = 'els';

    angular.module('app')
        .controller(controllerId, function($scope, $location, common, client, datasearch) {


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
            vm.type = 'logs';
            vm.filterAggName = "";
            vm.pagecount = 100;
            vm.indices = ['logs', 'logsd'];
            vm.total = "";
            vm.fieldname = [];
            vm.indexName = [];
            vm.t = [];
            vm.paging = {
                currentPage: 1,
                maxPagesToShow: 5,
                pageSize: 8
            };
       
            Object.defineProperty(vm.paging, 'pageCount', {
                get: function() {
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

            vm.pageChanged = pageChanged;
            vm.getCurrentPageData = getCurrentPageData;
            vm.getFieldName = getFieldName;
            vm.getIndexName = getIndexName;



            vm.showModal = false;
            vm.toggleModal = toggleModal;

            function toggleModal() {
                vm.showModal = !vm.showModal;
            }
     




            function getCurrentPageData(res) {
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
                vm.getCurrentPageData(vm.hitSearch);
            }


            function test(searchText) {
                /* client.search({
                    index: vm.indices,
                    type: 'log',
                    size: vm.pagecount,
                    body: ejs.Request()
                    //.query(ejs.MatchQuery("message", searchText).zeroTermsQuery("all"))
                    .query(ejs.BoolQuery().must(ejs.MatchQuery("message", searchText)).mustNot(ejs.MatchQuery("message", "java")))
                    //  .query(ejs.BoostingQuery(ejs.MultiMatchQuery(["username", "response", "message", "ip"], searchText), ejs.MatchQuery("message", "java"), 0.2))
                    //   .query(ejs.CommonTermsQuery("message", searchText).cutoffFrequency(0.01).highFreqOperator("and").minimumShouldMatchLowFreq(2))
                     //  .query(ejs.RangeQuery("ip").gte("19.18.200.201").lte("19.18.200.204"))
                }).then(function (resp) {
                    vm.hitSearch = resp.hits.hits;
                    vm.total = resp.hits.total < vm.pagecount ? resp.hits.total : vm.pagecount;
                    vm.getCurrentPageData(vm.hitSearch);
                }, function (err) {
                    log(err.message);
                });*/
                client.indices.exists({
                    index: 'logs'
                }).then(function (resp) {
                    vm.hitSearch = resp;
                }, function (err) {
                    log(err.message);
                });

              toastr.info( "\r\n" );
            }
            

            function getIndexName() {               
                gett();
                geti();        
                function gett() {
                    vm.j = 0;  
                 vm.x = 'logstash-';
                 for (vm.i = 0; vm.i < 144; vm.i++) {
                     vm.y = new Date(2015, 2, 10 + vm.i);
                     vm.t[vm.j] = vm.x + vm.y.getFullYear() + "." + ('0' + vm.y.getMonth()).slice(-2) + "." + ('0' + vm.y.getDate()).slice(-2);
                     vm.j++;
                 }
             }
             function geti() {
                 vm.j = 0;
                 vm.z = 0;
                 vm.i = 0;
                 for (vm.i = 0; vm.i < 144; vm.i++) {
                     client.indices.exists({
                         index: vm.t[vm.i]
                     }).then(function(resp) {
                         if (resp) {
                             vm.indexName[vm.j] = vm.t[vm.z];
                             vm.j++;
                             log(vm.z);
                         }
                         vm.z++;
                     }, function(err) {
                         log(err.message);
                     });
                    
                 }
             }
            }
      
             

            function getFieldName() {

                client.indices.getFieldMapping({
                    index: 'logs',
                    type: 'log',
                    field: '*'
                }).then(function (resp) {
                    vm.map = resp.logs.mappings.log;
                    vm.j = 0;
                    vm.res2 = [];
                    angular.forEach(vm.map, function (name) {
                        if (name.full_name.substring(0, 1) !== '_' && name.full_name !== 'constant_score.filter.exists.field') {
                            vm.fieldname[vm.j] = name.full_name;
                            vm.j++;
                        }
                    }
                    );
                }, function (err) {
                    log(err.message);
                });
       
            }

           

            function activate() {
                common.activateController([getIndexName(), getFieldName()], controllerId)
                    .then(function () {
                         init();
                        log('Activated ELS search View');
                        google.setOnLoadCallback(drawDashboard);

                    });
            }
         


            function init() {
                datasearch.getSampledata(vm.indexName,vm.type, vm.pagecount).then(function (resp) {
                    vm.hitSearch = resp.hits.hits;
                    vm.total = resp.hits.total < vm.pagecount?resp.hits.total:vm.pagecount;  
                    vm.getCurrentPageData(vm.hitSearch);
                    log('Loaded sample document');
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
                getIndexName();
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
             datasearch.basicSearch(vm.indices, vm.type, vm.pagecount, vm.aggName, searchText, vm.filterAggName, vm.fi)
            .then(function (resp) {
                 vm.hitSearch = resp.hits.hits;
                 vm.total = resp.hits.total < vm.pagecount ? resp.hits.total : vm.pagecount;
                 vm.getCurrentPageData(vm.hitSearch);
             }, function (err) {
                 log(err.message);
             });
               
         }
      
         function searchWithoutFilter(searchText) {
             datasearch.searchWithoutFilter(vm.indices, vm.type, vm.pagecount,vm.aggName ,searchText).then(function (resp) {
                 vm.hitSearch = resp.hits.hits;
                 vm.total = resp.hits.total < vm.pagecount ? resp.hits.total : vm.pagecount;
                 vm.getCurrentPageData(vm.hitSearch);
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
             datasearch.stringSearch(vm.indices, vm.type, vm.pagecount,searchText).then(function (resp) {
                vm.hitSearch = resp.hits.hits;
                vm.total = resp.hits.total < vm.pagecount ? resp.hits.total : vm.pagecount;
                vm.getCurrentPageData(vm.hitSearch);
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

        



    });
})();
