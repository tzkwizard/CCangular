(function () {
    'use strict';

    var serviceId = 'datasearch';
    angular.module('app').factory(serviceId, ['common', 'client', datacontext]);

    function datacontext(common, client) {

        var vm = this;
        vm.typesName = [];
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var service = {
            getSampledata: getSampledata,
            stringSearch: stringSearch,
            searchWithoutFilter: searchWithoutFilter,
            basicSearch: basicSearch,
            getIndexName: getIndexName,
            getTypeName: getTypeName,
            getFieldName: getFieldName
        }
        return service;
        
        

        function getIndexName() {
            vm.indicesName = [];
            vm.mx = [];
            client.cluster.state({
                flatSettings: true

            }).then(function (resp) {
                vm.mm = resp.routing_table.indices;
                vm.j = 0;
                angular.forEach(vm.mm, function (name) {

                    vm.mx[vm.j] = name.shards;
                    angular.forEach(vm.mx[vm.j], function (nn) {
                        vm.indicesName[vm.j] = nn[0].index;
                    });
                    vm.j++;
                });

            }, function (err) {
                log(err.message);
            });
            return vm.indicesName;
        }
        function getTypeName(index,pagecount) {
            if (index === "all" || index === "")
                return "";
            vm.typesName = [];
            client.search({
                index: index,
                size: pagecount,
                body: {
                    query: {
                        "match_all": {}
                    }
                }
            }).then(function (resp) {
                vm.map = resp.hits.hits;
                angular.forEach(vm.map, function (n) {
                    if (vm.typesName.indexOf(n._type) === -1) {
                        vm.typesName.push(n._type);
                    }
                });

            }, function (err) {
                log(err.message);
            });
            return vm.typesName;
        }

        function getFieldName(index,type) {
            if (type === "all" || type === "" || vm.typesName.indexOf(type)===-1)
                return "";
            vm.fieldsName = [];
            client.indices.getFieldMapping({
                index: index,
                type: type,
                field: '*'
            }).then(function (resp) {
                //vm.map = resp.logs.mappings.logs;

                angular.forEach(resp, function (m) {
                    vm.map = m.mappings;
                    angular.forEach(vm.map, function (n) {
                        vm.j = 0;
                        angular.forEach(n, function (name) {
                            if (name.full_name.substring(0, 1) !== '_' && name.full_name !== 'constant_score.filter.exists.field') {
                                vm.fieldsName[vm.j] = name.full_name;
                                vm.j++;
                            }
                        }
                        );
                    });
                });
            }, function (err) {
                log(err.message);
            });
            return vm.fieldsName;
        }



        function getSampledata(indices,type,pagecount) {
            return client.search({
                index: indices,
                type: type,
                size: pagecount,
                body: {
                    query: {
                        "match_all": {}
                    }
                }
            }
               );
        }


        function stringSearch(indices, type, pagecount,searchText) {
          return  client.search({
                index: indices,
                type:  type,
                size:  pagecount,
                body: ejs.Request()
                    .query(ejs.QueryStringQuery(searchText))
            });
        }

        function searchWithoutFilter(indices, type, pagecount,field, searchText) {
            return client.search({
                index: indices,
                type: type,
                size: pagecount,
                body: ejs.Request()
                    .query(ejs.MatchQuery(field, searchText))
            });
        }

        function basicSearch(indices, type, pagecount, field, searchText, filterField, filter,condition) {
            

            if (field === "" || field === "all") {
                // mSearch(searchText); 
                return stringSearch(indices, type, pagecount, searchText);
                
            }
            if (filter === "" || filterField === "" || filterField === "all") {
                return searchWithoutFilter(indices, type, pagecount, field, searchText);
            }

            var fmust;
            var fmusttrue = ejs.TermFilter(filterField, filter);
            var fmustfalse = ejs.NotFilter(ejs.TermFilter(filterField, ""));
            var fnotmust;        
            var fnotmustture = ejs.TermFilter(filterField, filter);
            var fnotmustfalse = ejs.TermFilter(filterField, "");
            var fshould;
            var fshouldtrue = ejs.TermFilter(filterField, filter);
            var fshouldfalse = ejs.NotFilter(ejs.TermFilter(filterField, ""));

            if (condition === "MUST") {
                fmust = fmusttrue;
                fnotmust = fnotmustfalse;
                fshould = fshouldfalse;
            }
            else if (condition === "MUST_NOT") {
                fmust = fmustfalse;
                fnotmust = fnotmustture;
                fshould = fshouldfalse;
            } else {
                fmust = fmustfalse;
                fnotmust = fnotmustfalse;
                fshould = fshouldtrue;
            }

            return client.search({
                index: indices,
                type: type,
                size: pagecount,
                body: ejs.Request()
                    .query(ejs.MatchQuery(field, searchText))
                    //.filter(ejs.TermFilter(filterField, filter))
                    //.filter(ejs.BoolFilter().mustNot(mmm))
                    .filter(ejs.BoolFilter().must(fmust).mustNot(fnotmust).should(fshould))

            });
        }


    }
})();