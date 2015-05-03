/**
 spec for xml.factory.js
**/
describe('Spec: xml.factory', function() {

    var moduleName = 'xml.factory', module;

    beforeEach(function() {
        angular.module(moduleName);
    });

    beforeEach(inject(function() {
        var $injector = angular.injector([moduleName]);
        module = $injector.get(moduleName);
    }));

    it('is a defined factory', function () {
        expect(module).toBeDefined();
    });

    it('is able to parse a xml file', function () {
        var xmlSample = '<?xml version="1.0" encoding="utf-8"?>' +
            '<LogDataExport xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
            '<name>log</name> ' +
            '<exportTime>2015-05-02T16:29:12.8640284+02:00</exportTime>' +
            '<logdata></logdata>' +
            '</LogDataExport>';
        var parsedXML = module.read(xmlSample);
        var value = parsedXML.find('name').text();
        expect(value).toBe('log');
    });

});