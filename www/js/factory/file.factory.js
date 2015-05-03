/**
 - reads a file and returns content as string
 **/
angular.module('file.factory', [])
    .factory('file.factory', function () {

        return {
            read: function (xmlData) {
                var xmlDoc = $.parseXML(xmlData);
                return $(xmlDoc);
            }
        };
    });