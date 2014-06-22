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
	var request = {
		data : {
	    	"number" : 123.321,
	    	"str" : "some string",
			"array" : [ 1, 2, 3, 4 ],
			"obj" : {
				a : "apple",
				b : "banana"
			}
		}
	};
	
	assert.equal(rc._buildRequest(request).data, 
			rc.getOptions().serializeRequestBody(request),
			"Auto serialize request body");
	assert.equal(rc._buildRequest({data: null}).data, "null",
		"Not Skip serialize when body is null");
	assert.equal(rc._buildRequest({data: {}}).data, "{}",
		"Not Skip serialize when body is {}");
	assert.equal(rc._buildRequest({data: 0}).data, "0",
		"Not Skip serialize when body is 0");
	assert.equal(rc._buildRequest({data: ""}).data, '""',
		'Not Skip serialize when body is empty string');

	assert.ok(rc._buildRequest().success, "Request has success callback function");
	assert.ok(rc._buildRequest().error, "Request has error callback function");

	// Addon Test
	var addon = {
		headers: {
			'accept': 'image/png',
			'X-SomeKey': 'lalala'
		},
		data: {
			'array' : [ 1, 2, 3],
			'addon' : 123
		}
	};
	rc.updateOptions({serializeRequestBody:function(request){return request.data;}});

	assert.deepEqual(rc._buildRequest(request, addon).data['array'], [1,2,3], "Addon replace Array");
	assert.equal(rc._buildRequest(request, addon).data['addon'], 123, "Addon add property");
	assert.equal(rc._buildRequest(request, addon).headers['X-SomeKey'], 'lalala', "Addon add header");
	assert.ok(
			rc.getOptions().headers['accept'] != 'image/png'
			&& rc._buildRequest(request, addon).headers['accept'] == 'image/png', 
			"Addon replace header");
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