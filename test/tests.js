QUnit.test( "URL Build Test", function( assert ) {
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

QUnit.test( "Option Test", function( assert ) {
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