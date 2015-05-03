/**
 - reads a xml files and returns it as an object
 - gets and object and returns xml file structure
 **/
angular.module('xml.factory', [])
    .factory('xml.factory', function () {

    return {
        read: function (xmlData) {
            var xmlDoc = $.parseXML(xmlData);
            return $(xmlDoc);
        }
    };
});