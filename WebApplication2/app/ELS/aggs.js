(function () {
    'use strict';

    var controllerId = 'aggs';

    angular.module('app')
        .controller(controllerId, function ($scope, $location, common, client, datasearch) {


            var vm = this;
            vm.title = "Aggragations";
            //variable
            vm.fi = "";
            var getLogFn = common.logger.getLogFn;
            var log = getLogFn(controllerId);

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
        vm.fieldname = [];
          

            //function
  
            vm.changev = changev;
            vm.aggShow = aggShow;
            activate();
            vm.getFieldName = getFieldName;
        

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
                common.activateController([getFieldName()], controllerId)
                    .then(function () {
                        log('Activated Aggs search View');
                        google.setOnLoadCallback(drawDashboard);

                    });
            }


            function aggShow(aggName) {              
            client.search({
                index: 'logs',
                type: vm.type,
                body: ejs.Request()
                    .aggregation(ejs.TermsAggregation("agg").field(aggName))
                   // .aggregation(ejs.TermsAggregation("myagg2").field("username"))
                   // .aggregation(ejs.TermsAggregation("myagg3").field("response"))
                   // .aggregation(ejs.TermsAggregation("myagg4").field("message"))
                    
                }).then(function (resp) {
                //vm.hits = resp.aggregations;
                    vm.total = resp.hits.total;
                    drawDashboard(resp.aggregations.agg);
               /* switch (aggName) {
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

                }*/
            }, function (err) {
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
                                    "size": 10
                                }
                            }
                        }
                    }
                }).then(function (resp) {
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
                }, function (err) {
                    log(err.message);
                });

            }






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
                dashboard.bind(donutRangeSlider, [pieChart, table]);

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
