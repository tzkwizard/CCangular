(function () {
    'use strict';

    var serviceId = 'datasearch';
    angular.module('app').factory(serviceId, ['common', 'client', datacontext]);

    function datacontext(common, client) {

        var service = {
            getSampledata: getSampledata,
            stringSearch: stringSearch,
            searchWithoutFilter: searchWithoutFilter,
            basicSearch: basicSearch
        }
        return service;

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

        function basicSearch(indices, type, pagecount, field, searchText, filterField, filter) {
            return client.search({
                index: indices,
                type: type,
                size: pagecount,
                body: ejs.Request()
                    .query(ejs.MatchQuery(field, searchText))
                    .filter(ejs.TermFilter(filterField, filter))

            });
        }


    }
})();