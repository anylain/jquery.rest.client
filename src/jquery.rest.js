/**
 * JQuery Rest Client Plugin v1.1 https://git.oschina.net/anylain/RestClient
 * 
 * Copyright 2014 Pan Ying Released under the Apache 2.0 License
 */
(function($) {

	$.RestClient = function(options) {

		var version = '1.1';
		var currOptions = null;

		this.getVersion = function() {
			return version;
		};

		var _gsub = function(source, pattern, replacement) {
			var result = '', match;
			while (source.length > 0) {
				if (match = source.match(pattern)) {
					result += source.slice(0, match.index);
					result += replacement(match).toString();
					source = source.slice(match.index + match[0].length);
				} else {
					result += source, source = '';
				}
			}
			return result;
		};

		this._updateOptions = function(target, data, force) {
			var result;
			if (target === undefined) {
				result = data;
			} else if (target !== null && typeof (target) == 'object') {
				result = {};
				for ( var key in target) {
					result[key] = target[key];
				}
				for ( var key in data) {
					result[key] = this._updateOptions(target[key], data[key],
							force);
				}
			} else if (force) {
				result = data;
			} else {
				result = target;
			}
			return result;
		};

		this._buildRequest = function(request, addon) {
			var result = {};

			for ( var key in request) {
				result[key] = request[key];
			}

			if (addon)
				result = this._updateOptions(result, addon, true);

			result = this._updateOptions(result, currOptions);

			var successHandler = result.success;
			var errorHandler = result.error;

			if (result.serializeRequestBody) {
				try {
					result.data = result.serializeRequestBody(result);
				} catch (e) {
					if (errorHandler)
						errorHandler('Serialize request body fault.\n'
								+ e.message);
					if (result.complete)
						result.complete();
					return false;
				}
			}

			result.success = function(data, textStatus, jqXHR) {
				if (result.deserializeResponseBody) {
					try {
						data = result.deserializeResponseBody(data, result);
					} catch (e) {
						if (errorHandler)
							errorHandler('Deserialize response body fault.',
									jqXHR, textStatus, e.message);
						return;
					}
				}
				if (successHandler)
					successHandler(data, textStatus, jqXHR);
			};

			result.error = function(jqXHR, textStatus, errorThrown) {
				var message;
				if (result.deserializeError)
					message = result.deserializeError(jqXHR, textStatus,
							errorThrown, result);
				else
					message = jqXHR.responseText || errorThrown || textStatus;

				if (errorHandler)
					errorHandler(message, jqXHR, textStatus, errorThrown);
			};

			return result;
		};

		this._compatibleHandler = function(method, request) {
			if (!request.compatible) {
				request.type = method;
				return;
			}

			if ($.isFunction(request.compatible)) {
				request.compatible(method, request);
				return;
			}

			switch (request.compatible) {
			case 'url':
				request.type = 'POST';
				request.urlParams = request.urlParams || {};
				request.urlParams['__method'] = method;
				break;

			case 'x-method':
				request.type = 'POST';
				request.headers = request.headers || {};
				request.headers['x-method-override'] = method;
				break;

			default:
				throw new Error('Unsupport rest compatible mode "'
						+ request.compatible + '"');
				break;
			}
		};

		this.updateOptions = function(newOptions) {
			currOptions = this._updateOptions(currOptions, newOptions, true);
			return this;
		};

		this.setOptions = function(newOptions) {
			currOptions = newOptions;
			return this;
		};

		this.getOptions = function() {
			return currOptions;
		};

		this.buildUrl = function(sourceUrl, params, ext) {
			if (!params)
				return sourceUrl;

			var urlParams = [];
			var result = _gsub(sourceUrl, /\{(.+?)\}/, function(match) {
				var key = match[1];
				var value = params[key];
				if (value === undefined) {
					return match[0];
				} else if (value === null) {
					value = '';
				}
				urlParams.push(key);
				return encodeURIComponent(value);
			});

			if (ext)
				result += ext;

			var searchParams = {};
			$.each(params, function(key, value) {
				if ($.inArray(key, urlParams) == -1) {
					searchParams[key] = value;
				}
			});
			var queryString = this.buildQueryString(searchParams);
			if (queryString)
				result += '?' + queryString;

			return result;
		};

		this.buildQueryString = function(queryParams) {
			return $.param(queryParams);
			/*
			 * var qsList = []; $.each(queryParams, function(key,value){
			 * if($.isArray(value)) value = value.join(','); if(value) {
			 * qsList.push(encodeURIComponent(key) + '=' +
			 * encodeURIComponent(value)); }else {
			 * qsList.push(encodeURIComponent(key)); } }); return
			 * qsList.join('&');
			 */
		};

		this.sendRequest = function(method, request, addon) {
			var r = this._buildRequest(request, addon);

			this._compatibleHandler(method, r);

			r.url = this.buildUrl(r.url, r.urlParams, r.ext);
			if (r.baseUrl)
				r.url = r.baseUrl + r.url;

			return $.ajax(r);
		};

		this.get = function(request, addon) {
			return this.sendRequest('GET', request, addon);
		};

		this.post = function(request, addon) {
			return this.sendRequest('POST', request, addon);
		};

		this.put = function(request, addon) {
			return this.sendRequest('PUT', request, addon);
		};

		this.del = function(request, addon) {
			return this.sendRequest('DELETE', request, addon);
		};

		this.setOptions(options || $.RestClient.options.defaults);

	};

	$.RestClient.options = {};

	$.RestClient.options.json = {
		baseUrl : null,
		compatible : null,
		dataType : "json",
		contentType : "application/json",
		headers : {
			accept : "application/json"
		},
		// ext: ".json", // 资源后缀，如果目标API以URL后缀区分资源类型可以加上这个参数
		serializeRequestBody : function(request) {
			if (JSON && JSON.stringify) {
				return JSON.stringify(request.data);
			} else if ($.toJSON) {
				return $.toJSON(request.data);
			}
			throw new Error(
					'Need jQuery json plugin to serialize request body.');
		},
		deserializeResponseBody : null,
		deserializeError : null,
		// 默认的错误处理
		error : function(message, jqXHR, textStatus, errorThrown) {
			alert(message);
		}

	};

	$.RestClient.options.xml = {
		dataType : "xml",
		headers : {
			accept : "application/xml"
		},
		// ext: ".xml",
		contentType : "application/xml"
	};

	$.RestClient.options.text = {
		dataType : "text",
		headers : {
			accept : "text/plain"
		}
	};

	$.RestClient.options.defaults = $.RestClient.options.json;

	$.rest = new $.RestClient();

})(jQuery);
