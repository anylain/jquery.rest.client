QUnit.test("Get Version Test", function( assert ) {
    var rc = new $.RestClient();
    assert.ok(rc.getVersion(), "version = " + rc.getVersion());
});

QUnit.test("Default Instance Test", function( assert ) {
    assert.ok($.rest, "Has default instance with '$.rest'");
    assert.deepEqual($.rest.getOptions(), $.RestClient.options.defaults, "Init default options on create default instance");
});

QUnit.test("URL Build Test", function( assert ) {
    var rc = new $.RestClient();
    
    var url = rc.buildUrl('users/{id}', {id:123});
    var good = 'users/123';
    assert.equal( url, good, "Simple" );
    
    var url = rc.buildUrl('users/{id}', {id:123}, '.xml');
    var good = 'users/123.xml';
    assert.equal( url, good, "Simple (Has ext)" );
    
    var url = rc.buildUrl('users/{id}', null);
    var good = 'users/{id}';
    assert.equal( url, good, "null param" );
    
    var url = rc.buildUrl('users/{id}', null, '.xml');
    var good = 'users/{id}.xml';
    assert.equal( url, good, "null param (has ext)" );
    
    var url = rc.buildUrl('users/{id}/books/{book}', {id:123, book:'Spring实战(第三版)', page:12, keyword:'http://spring.io/'}, '.json');
    var good = 'users/123/books/Spring%E5%AE%9E%E6%88%98(%E7%AC%AC%E4%B8%89%E7%89%88).json?page=12&keyword=http%3A%2F%2Fspring.io%2F';
    assert.equal( url, good, "Param encoding" );
});

QUnit.test("Init Options Test", function( assert ) {
    var rc1 = new $.RestClient();
    var rc2 = new $.RestClient($.RestClient.options.json);
    var rc3 = new $.RestClient($.RestClient.options.xml);
    assert.deepEqual(rc1.getOptions(), $.RestClient.options.defaults, "Init default options on create new instance by no args");
    assert.deepEqual(rc2.getOptions(), $.RestClient.options.json, "Init options on create new instance by $.RestClient.options.json");
    assert.deepEqual(rc3.getOptions(), $.RestClient.options.xml, "Init options on create new instance by $.RestClient.options.xml");
    
    var customOption = {dataType : "text", headers : { accept : "text/plain" }};
    var rc4 = new $.RestClient(customOption);
    assert.deepEqual(rc4.getOptions(), customOption, "Init options on create new instance by custom options");
});

QUnit.test("Request Build Test", function( assert ) {
    var rc = new $.RestClient();
    assert.equal(rc._buildRequest({}), rc.getOptions(), "Result is equal options when request param is empty object.");
    assert.throws(function() { rc._buildRequest(); }, "When request param is null will throw exception.");
});

QUnit.test("Update Options Test", function( assert ) {
    var rc = new $.RestClient();
    // TODO
});

QUnit.test("Compatible Test", function( assert ) {
    var rc = new $.RestClient();
    // TODO
});