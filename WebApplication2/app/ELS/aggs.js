(function () {
    'use strict';

    var controllerId = 'aggs';

    angular.module('app')
        .controller(controllerId, function ($scope, $location, common, client, datasearch, dataconfig) {


            var vm = this;
            vm.title = "Aggragations";
            //variable
            var getLogFn = common.logger.getLogFn;
            var log = getLogFn(controllerId);

            vm.hitSearch = "";
            vm.hits = "";
            vm.total = 0;
            vm.mystyle = { 'color': 'blue' };
            vm.aggName = "";
            vm.type = '';
            vm.filterAggName = "";
            vm.pagecount = 10;
            vm.indices = ['logs', 'logsd'];

            vm.fieldsName = [];
            vm.typesName = [];
            vm.indicesName = [];
            vm.index = 'logs';
            vm.type = '';


            vm.dashboard = "dash";
            vm.range = "range";
            vm.barchart = "bar";
            vm.tablechart = "table";

            //function
  
            vm.changev = changev;
            vm.aggShow = aggShow;
            vm.aggshows = aggshows;
         
          
            vm.getFieldName = getFieldName;
            vm.getIndexName = getIndexName;
            vm.getTypeName = getTypeName;

     
            activate();
            function activate() {
                common.activateController([getIndexName()], controllerId)
                    .then(function () {
                        log('Activated Aggs search View');
                        google.setOnLoadCallback(drawDashboard);

                    });
            }
            
            
            vm.test = "ab";
            vm.testm = testm;
            function testm() {
                return vm.test;
            }

           


           

            function aggshows(aggName) {

                dataconfig.createContainer(aggName);
     
                vm.dashboard = "dash";
                vm.range = "range";
                vm.barchart = "bar";
                vm.tablechart = "table";

                client.search({
                    index: vm.index,
                    type: vm.type,
                    body: ejs.Request()
                        .aggregation(ejs.TermsAggregation("agg").field(aggName))       

                }).then(function (resp) {
                    vm.dashboard = vm.dashboard + aggName;
                    vm.range = vm.range + aggName;
                    vm.barchart = vm.barchart + aggName;
                    vm.tablechart = vm.tablechart + aggName;
                    vm.total = resp.hits.total;
                    drawDashboard2(resp.aggregations.agg, aggName);                   
                }, function (err) {
                    log(err.message);
                });

            }

            function aggShow(aggName) {
                var main = document.getElementById('div2');
                var contain = document.getElementById('contain');
                if (contain !== null)
               { main.removeChild(contain);}

                if(vm.aggName===""||vm.aggName==="all")
                {angular.forEach(vm.fieldsName, function (name) {
                    aggshows(name);
                });
                    return;
                }
   
                client.search({
                    index: vm.index,
                    type: vm.type,
                    body: ejs.Request()
                        .aggregation(ejs.TermsAggregation("agg").field(aggName))          

                }).then(function (resp) {                   
                    vm.total = resp.hits.total;
                    drawDashboard(resp.aggregations.agg);                    
                }, function (err) {
                    log(err.message);
                });

            }

            function drawDashboard2(agg,y) {
                        

                var data = new google.visualization.DataTable();
                data.addColumn('string', 'key');
                data.addColumn('number', 'Number');
                for (var i = 0; i < agg.buckets.length; i++) {
                    data.addRow([agg.buckets[i].key.toString(), agg.buckets[i].doc_count]);

                }
                // Create a dashboard.
                var dashboard = new google.visualization.Dashboard(
                    document.getElementById("dash"+y));

                // Create a range slider, passing some options
                var donutRangeSlider = new google.visualization.ControlWrapper({
                    'controlType': 'NumberRangeFilter',
                    'containerId': "range"+y,
                    'options': {
                        'filterColumnLabel': 'Number'
                    }
                });

                // Create a pie chart, passing some options
                var pieChart = new google.visualization.ChartWrapper({
                    'chartType': 'PieChart',
                    'containerId': "bar"+y,
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
                    'containerId': "table"+y,
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
                if (vm.typesName.indexOf(vm.type) === -1 || vm.fieldsName.indexOf(vm.aggName) === -1) {
                    return;
                }

                var data = new google.visualization.DataTable();
                data.addColumn('string', 'key');
                data.addColumn('number', 'Number');
                for (var i = 0; i < agg.buckets.length; i++) {
                    data.addRow([agg.buckets[i].key.toString(), agg.buckets[i].doc_count]);

                }
                // Create a dashboard.
                var dashboard = new google.visualization.Dashboard(
                    document.getElementById('dashboard'));

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
                    'containerId': 'table_div',
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


            function getIndexName() {

                vm.indicesName = dataconfig.getIndexName();
            }

            function getTypeName() {
                vm.typesName = dataconfig.getTypeName(vm.index, vm.pagecount);
            }

            function getFieldName() {
                vm.fieldsName = dataconfig.getFieldName(vm.index, vm.type);
                vm.aggName = "";
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


        });
})();


/* function getFieldName() {

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

           }*/


/* function drawTable() {
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
           }*/

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

