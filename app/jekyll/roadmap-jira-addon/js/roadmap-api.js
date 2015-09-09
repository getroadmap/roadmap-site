/**
 *  Roadmap JIRA Connect Addon - Roadmap API Helpers
 *
 *  Author: Anton Maslo
 *  Created: 2015-07-06
 */

var addonConfig,
    userConfig,
    rmUser,
    rmRoles;

// For now this class is only needed for static functions
function API() {
    return this;
}

API.checkJIRAContext = function() {    
    if(!window.location.search.match('xdm_e') || !window.location.search.match('cp')) {
        $('body > *').remove();
        $('body').append('<h3>Roadmap JIRA Addon</h3>' 
            + '<p><strong>Error:</strong> Attempt to access Roadmap JIRA addon outside of proper context.</p>');
        return false;
    }
    
    return true;
};

API.getUrlParam = function(param) {
    var codedParam = '',
        matchResult = (new RegExp(param + '=([^&]+)')).exec(window.location.search);
    
    if(matchResult && matchResult.length > 1)
        codedParam = matchResult[1];
    
    return decodeURIComponent(codedParam);
};

API.getHostInfo = function(baseUrl) {
    return {
        Type: 4,
        ID: baseUrl 
    };
};

API.networkError = function(url, jqXHR, textStatus, errorThrown) {
    var alert = { 
        title: 'Network error', 
        url: url,
        message: textStatus,
        bodyClass: 'network-error'
    };
    
    if(/roadmap\-config\.html/.test(window.location.href)) {
        alert.prependTo = '#main-page-content';
    }
    
    Alert.show(alert);
};

API.unsetAddonConfig = function() {
    addonConfig = null;
};

// TODO: Separate not-found and error callbacks?
API.getAddonProperty = function(key, callback, errorCallback, notFoundCallback) {
    // Check full properties list
    var url = '/rest/atlassian-connect/1/addons/roadmap/properties';
    
    AP.require('request', function(request) {    
        request({
            url: url,
            success: function(properties) {
                var found = false;

                if(typeof properties === 'string')
                    properties = JSON.parse(properties);

                if(properties && properties.keys && properties.keys.length > 0) {
                    for(var i = 0; i < properties.keys.length; i++) {
                        if(properties.keys[i].key === key) {
                            found = true;

                            var propUrl = '/rest/atlassian-connect/1/addons/roadmap/properties/' + key;

                            request({
                                url: propUrl,
                                success: function(response) {
                                    return callback(API.getResponseValue(response));
                                }, error: function(jqXHR, textStatus, errorThrown) { 
                                    errorCallback('[JIRA]' + propUrl, jqXHR, textStatus, errorThrown); 
                                }
                            });
                        }
                    }
                }

                if(!found)
                    notFoundCallback();
            },
            error: function(jqXHR, textStatus, errorThrown) { errorCallback('[JIRA]' + url, jqXHR, textStatus, errorThrown); }
        });
    });
}

API.getAddonConfig = function(callback, errorCallback) {
    if(addonConfig) {
        callback(addonConfig);
    } else {
        API.getAddonProperty(
            'config', 
            function(respValue) {
                addonConfig = respValue;
                callback(addonConfig)
            },
            errorCallback,
            function() {
                // Config not found
                errorCallback(
                    '[JIRA]/rest/atlassian-connect/1/addons/roadmap/properties/config', 
                    null, 
                    'Error getting addon configuration.', 
                    null);
            }
        );
    }
};

API.getUserConfig = function(userKey, callback, errorCallback) {
    if(userConfig) {
        callback(userConfig);
    } else {
        API.getAddonProperty(
            'user-config-' + userKey,
            function(respValue) {
                userConfig = respValue;
                callback(userConfig)
            },
            errorCallback,
            function() {
                // User config not found
                errorCallback(
                    '[JIRA]/rest/atlassian-connect/1/addons/roadmap/properties/user-config-' + userKey, 
                    null, 
                    'Error getting user configuration.', 
                    null);
            }
        );
    }
};

// Called from the issue panel
API.saveUserConfig = function(userKey, request, callback) {
    var submitBtn = AJS.$('#addon-user-config #update-config'),
        rmToken = AJS.$('#rm-token').val();

    AJS.$('<span class="aui-icon aui-icon-wait"></span>').prependTo(submitBtn);
    submitBtn.prop('disabled', true);

    Alert.clearAll();

    userConfig = {
        rmToken: rmToken
    };

    request({
        url: '/rest/atlassian-connect/1/addons/roadmap/properties/user-config-' + userKey,
        type: 'PUT',
        data: JSON.stringify(userConfig),
        contentType: "application/json",
        success: function(response) {
            AJS.messages.success({
                body: 'User settings saved',
                fadeout: true,
                delay: 1000
            });

            AJS.$('body').removeClass().addClass('loading');
            
            AJS.$('#rm-addon-actions, #cancel-user-config').show();

            callback(request);
        },
        error: function() {
            userConfig = null;

            Alert.show({ 
                title: 'Error: ' + arguments[0].statusText,
                message: 'Error saving user congiguration.'
            });

            submitBtn.find('.aui-icon-wait').remove();
            submitBtn.prop('disabled', false);
        }
    });
};

API.getRmUser = function(callback) {
    if(rmUser) {
        callback(rmUser);
    } else {
        API.callRMAPI(
            'GET', 
            '/v1.1/ext/getme',
            false,
            null,
            callback,
            API.networkError
        );
    }
};

API.getRmRoles = function(callback) {
    if(rmRoles) {
        callback(rmRoles);
    } else {
        API.callRMAPI(
            'GET', 
            '/v1.1/ext/role',
            false,
            null,
            callback,
            API.networkError
        );
    }
};

API.callRMAPI = function(method, url, isAdmin, data, successCallback, errorCallback) {
    // Ensure connection info is available
    if(!addonConfig || !addonConfig.apiURL || !addonConfig.rmAdminToken) {
        // Connection info is not available, retrieve it
        if(/roadmap\-config\.html/.test(window.location.href)) {
            // Roadmap Config page, values already available
            addonConfig = {
                rmAdminToken: AJS.$('#rm-admin-token').val(),
                appURL: AJS.$('#app-url').val(),
                apiURL: AJS.$('#api-url').val()
            };
        } else {
            // Another page - request JIRA for connection values
            return API.getAddonConfig(function() {
                checkUserTokenBeforeAPICall(method, url, isAdmin, data, successCallback, errorCallback);
            }, errorCallback);
        }
    }
    
    // Connection info is ready, make the call
    checkUserTokenBeforeAPICall(method, url, isAdmin, data, successCallback, errorCallback);
    
    return;
    
    
    
    
    
    /**
     *  Helper functions
     */
    
    function checkUserTokenBeforeAPICall(method, url, isAdmin, data, successCallback, errorCallback) {
        var userKey;
        
        if(isAdmin) {
            // User information is not needed, make the call
            makeAPICall(method, url, isAdmin, data, successCallback, errorCallback);
        } else {
            // Make the call after user information is retrieved
            AP.getUser(function(user) {
                API.getUserConfig(user.key, function() {
                    makeAPICall(method, url, isAdmin, data, successCallback, errorCallback);
                }, errorCallback);
            });
        }
    }
    
    // Ensure addonConfig and userConfig are available before calling this
    function makeAPICall(method, url, isAdmin, data, successCallback, errorCallback) {
        var base64 = new Base64(),
            callUrl = API.trimTrailingSlash(addonConfig.apiURL) + url;
        
        $.ajax({
            url: callUrl,
            method: method,
            headers: {
                'Authorization': 'Basic ' + base64.encode(
                    (isAdmin ? addonConfig.rmAdminToken : userConfig.rmToken)
                    + ':anypassword')
            },
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                if(response && response.IsException) {
                    errorCallback(
                        addonConfig.apiURL + url, 
                        null, 
                        response.Message, 
                        response.Message);
                    return;
                }
                
                successCallback(response);
            },
            error: function(jqXHR, textStatus, errorThrown) { // Wraps error callback to add URL argument
                // Note: Response information is limited for CORS 
                // http://stackoverflow.com/questions/4844643/is-it-possible-to-trap-cors-errors
                errorCallback(callUrl, jqXHR, textStatus, errorThrown);
            }
        });
    }
    
    // Taken from http://stackoverflow.com/a/246813/253974
    function Base64() {
        // private property
        this._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        // public method for encoding
        this.encode = function(input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = this._utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }
            return output;
        };

        // public method for decoding
        this.decode = function(input) {
            var output = "",
                chr1, chr2, chr3,
                enc1, enc2, enc3, enc4,
                i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = Base64._utf8_decode(output);
            return output;
        };

        // private method for UTF-8 encoding
        this._utf8_encode = function(string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {	
                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }		
            }		
            return utftext;
        };

        // private method for UTF-8 decoding
        this._utf8_decode = function(utftext) {
            var string = "",
                i = 0, c = 0, c1 = 0, c2 = 0, c3 = 0;

            while ( i < utftext.length ) {		
                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }

            return string;
        };
    }
};

// Fix date format string arriving from RM for usage in JQuery Datepicker
API.fixDateFormat = function(sFormat) {
    // Theoretical RM formats: http://msdn.microsoft.com/en-us/library/8kb3ddd4%28v=vs.110%29.aspx
    // MM or DD from RM doesn't mean month/day name, so lower-case it
    // y in JQ means 2-digit year, yy means 4-digit year
    return sFormat.toLowerCase().replace(/yy/g, 'y');
};

API.trimTrailingSlash = function(url) {
    return (url.charAt(url.length - 1) === '/' ? 
            url.substr(0, url.length - 1) : 
            url);
};

API.convertDateToAPI = function(inDate) {
    if(inDate === null)
        return null;

    var yyyy = inDate.getFullYear().toString(),
        mm = (inDate.getMonth() + 1).toString(), // getMonth() is zero-based
        dd = inDate.getDate().toString();

    return yyyy + '-' 
        + (mm.charAt(1) ? mm : "0" + mm.charAt(0)) + '-' 
        + (dd.charAt(1) ? dd : "0" + dd.charAt(0)); // 0-padding
};

// For parsing JIRA request responses
API.getResponseValue = function(response) {
    var result;
    
    if(typeof response === 'string')
        response = JSON.parse(response);
    
    if(response.value) {
        result = typeof response.value === 'string' ? JSON.parse(response.value) : response.value;
    }
    
    return result;
};