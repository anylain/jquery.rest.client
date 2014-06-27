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
    assert.equal( url, good, "Simple url params" );
    
    var url = rc.buildUrl('users/{id}', null, {id:123});
    var good = 'users/123';
    assert.equal( url, good, "Simple path params" );
    
    var url = rc.buildUrl('users', null, null, {id:123});
    var good = 'users?id=123';
    assert.equal( url, good, "Simple query params" );
    
    var url = rc.buildUrl('users/{id}', {id:456}, {id:123});
    var good = 'users/123';
    assert.equal( url, good, "Path params priority than the url params" );
    
    var url = rc.buildUrl('users', {id:456}, null, {id:123});
    var good = 'users?id=123';
    assert.equal( url, good, "Query params priority than the url params" );
    
    var url = rc.buildUrl('users/{id}/book/{book}', {id:123}, {book:"rest_client"}, {key:"javascript"}, '.pdf');
    var good = 'users/123/book/rest_client.pdf?key=javascript';
    assert.equal( url, good, "Simple (Has ext)" );
    
    try{
    	rc.buildUrl('users/{id}', null);
    	assert.ok(false, "Throw an exception on can't found params.")
    }catch (e) {
    	assert.ok(true, "Throw an exception on can't found params.")
	}
    
    var url = rc.buildUrl('users/{id}/books/{book}', {id:123, book:'Spring实战(第三版)', page:12, keyword:'http://spring.io/'}, null, null, '.json');
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
	
    var methods = ['GET','POST','PUT','DELETE'];
    $(methods).each(function(index, method){

    	var rc = new $.RestClient().updateOptions({
    		error: function(message, jqXHR, textStatus, errorThrown) {
    			if(errorThrown) throw new Error(errorThrown);
    			else throw new Error(message);
    		}
    	});
    	
    	var serializeRequestBodyCalled = false;
    	var compatibleCalled = false;
    	var request = rc.buildRequest(method, {
    		serializeRequestBody: function(){
    			serializeRequestBodyCalled = true;
    		},
    		compatible: function(mth, req) {
    			compatibleCalled = true;
    		}
    	});
    	assert.ok(serializeRequestBodyCalled, "(Method=" + method + ") Auto serialize request body");
    	assert.ok(compatibleCalled, "(Method=" + method + ") Call compatible function");

		assert.ok(request.success, "(Method=" + method + ") Request has success callback function");
		assert.ok(request.error, "(Method=" + method + ") Request has error callback function");
    });
});

QUnit.test("Update Options Test", function( assert ) {
    var rc = new $.RestClient();
    var source = {
    	"number" : 123.321,
    	"str" : "some string",
		"array" : [ 1, 2, 3, 4 ],
		"obj" : {
			a : "apple",
			b : "banana"
		}
	};
    
    var newValue = {
    	"str" : "new string",
    	"array" : [ 'alpha', 'beta' ],
    	"obj" : {
    		b : "blue",
    		c : "cat"
    	}
    };
    
    var forceResult = {
    	"number" : 123.321,
    	"str" : "new string",
    	"array" : [ 'alpha', 'beta' ],
		"obj" : {
			a : "apple",
    		b : "blue",
    		c : "cat"
		}
    };
    
    var noForceResult = {
    	"number" : 123.321,
    	"str" : "some string",
		"array" : [ 1, 2, 3, 4 ],
		"obj" : {
			a : "apple",
			b : "banana",
	    	c : "cat"
		}
    };
    
    assert.notEqual(rc._updateOptions(source, {}, true), source, "Create a new object for result");
    assert.deepEqual(rc._updateOptions(source, newValue, true), forceResult, "Update options by force (use new value with conflict)");
    assert.deepEqual(rc._updateOptions(source, newValue, false), noForceResult, "Update options by no force (use source value with conflict)");
});

QUnit.test("Compatible Test", function( assert ) {
    var rc = new $.RestClient();
    var request;
    
    var methods = ['GET','POST','PUT','DELETE'];
    $(methods).each(function(index, method){
        request = {
            	compatible : 'x-method'
            };
            rc._compatibleHandler(method, request);
            assert.equal(request.type, 'POST', "(Method=" + method + ") In 'x-method' model, request method will be replaced by 'POST'");
            assert.equal(request.headers['x-method-override'], method, "(Method=" + method + ") In 'x-method' model, the real method will write in http header 'x-method-override'");
            
            request = {
            	compatible : 'url'
            };
            rc._compatibleHandler(method, request);
            assert.equal(request.type, 'POST', "(Method=" + method + ") In 'url' model, request method will be replaced by 'POST'");
            assert.equal(request.urlParams['__method'], method, "(Method=" + method + ") In 'url' model, the real method will write in url query parameter '__method'");
            
            var called = false;
            request = {
            	compatible : function(mth, req){
            		if(mth == method && request===req)
            			called=true;
            	}
            };
            rc._compatibleHandler(method, request);
            assert.ok(called, "(Method=" + method + ") When compatible is function, they will be call to build request");
    });
});