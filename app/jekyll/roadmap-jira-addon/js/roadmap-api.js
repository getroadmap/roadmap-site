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

function checkJIRAContext() {    
    if(!window.location.search.match('xdm_e') || !window.location.search.match('cp')) {
        $('body > *').remove();
        $('body').append('<h3>Roadmap JIRA Addon</h3>' 
            + '<p><strong>Error:</strong> Attempt to access Roadmap JIRA addon outside of proper context.</p>');
        return false;
    }
    
    return true;
}

function getUrlParam(param) {
    var codedParam = '',
        matchResult = (new RegExp(param + '=([^&]+)')).exec(window.location.search);
    
    if(matchResult && matchResult.length > 1)
        codedParam = matchResult[1];
    
    return decodeURIComponent(codedParam);
};

function getHostInfo(baseUrl) {
    return {
        Type: 4,
        ID: baseUrl 
    };
}

function networkError(url, jqXHR, textStatus, errorThrown) {
    showAlert({ 
        title: 'Network error', 
        url: url,
        message: textStatus,
        bodyClass: 'network-error'
    });
}

function unsetAddonConfig() {
    addonConfig = null;
}

function getAddonConfig(callback, errorCallback) {
    if(addonConfig) {
        callback(addonConfig);
    } else {
        var url = '/rest/atlassian-connect/1/addons/com.roadmap/properties/config';
        
        AP.require('request', function(request){
            request({
                url: url,
                success: function(response) {
                    var respValue;

                    if(typeof response === 'string')
                        response = JSON.parse(response);

                    if(response.value) {
                        respValue = response.value;

                        if(typeof respValue === 'string')
                            respValue = JSON.parse(respValue);
                        
                        addonConfig = respValue;

                        callback(addonConfig);
                    }
                },
                error: function() {
                    if(typeof errorCallback === 'function')
                        errorCallback('[JIRA]' + url, arguments[0], arguments[1], arguments[2]);
                }
            });
        });
    }
}

function getUserConfig(userKey, callback, errorCallback) {
    if(userConfig) {
        callback(userConfig);
    } else {
        var url = '/rest/atlassian-connect/1/addons/com.roadmap/properties/user-config-' + userKey;
        
        AP.require('request', function(request){
            request({
                url: url,
                success: function(response) {
                    var respValue;

                    if(typeof response === 'string')
                        response = JSON.parse(response);

                    if(response.value) {
                        respValue = response.value;

                        if(typeof respValue === 'string')
                            respValue = JSON.parse(respValue);
                        
                        userConfig = respValue;

                        if(typeof callback === 'function')
                            callback(userConfig);
                    }
                },
                error: function() {
                    if(typeof errorCallback === 'function')
                        errorCallback();
                }
            });
        });
    }
}

function getRmUser(callback) {
    if(rmUser) {
        callback(rmUser);
    } else {
        callRMAPI(
            'GET', 
            '/v1.1/ext/getme',
            null,
            callback,
            networkError
        );
    }
}

function getRmRoles(callback) {
    if(rmRoles) {
        callback(rmRoles);
    } else {
        callRMAPI(
            'GET', 
            '/v1.1/ext/role',
            null,
            callback,
            networkError
        );
    }
}

function callRMAPI(method, url, data, successCallback, errorCallback) {
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
            
            makeAPICall(method, url, data, successCallback, errorCallback);
        } else {
            // Another page - request JIRA for connection values
            getAddonConfig(function() {
                makeAPICall(method, url, data, successCallback, errorCallback);
            }, errorCallback);
        }
    } else {
        // Connection info is ready, make the call
        makeAPICall(method, url, data, successCallback, errorCallback);
    }
    
    return;
    
    
    
    /**
     *  Helper functions
     */
    
    function makeAPICall(method, url, data, successCallback, errorCallback) {
        var base64 = new Base64(),
            callUrl = trimTrailingSlash(addonConfig.apiURL) + url;

        $.ajax({
            url: callUrl,
            method: method,
            headers: {
                'Authorization': 'Basic ' + base64.encode(addonConfig.rmAdminToken + ':anypassword'),
                //'User-Agent-Ext': 'Roadmap JIRA Extension'
            },
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                if(response && (response.IsException || response.Warning)) {
                    errorCallback(
                        addonConfig.apiURL + url, 
                        null, 
                        response.IsException ? response.Message : response.Warning, 
                        response.IsException ? response.Message : response.Warning);
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
}

// Fix date format string arriving from RM for usage in JQuery Datepicker
function fixDateFormat(sFormat) {
    // Theoretical RM formats: http://msdn.microsoft.com/en-us/library/8kb3ddd4%28v=vs.110%29.aspx
    // MM or DD from RM doesn't mean month/day name, so lower-case it
    // y in JQ means 2-digit year, yy means 4-digit year
    return sFormat.toLowerCase().replace(/yy/g, 'y');
}

function trimTrailingSlash(url) {
    return (url.charAt(url.length - 1) === '/' ? 
            url.substr(0, url.length - 1) : 
            url);
}

function convertDateToAPI(inDate) {
    if(inDate === null)
        return null;

    var yyyy = inDate.getFullYear().toString(),
        mm = (inDate.getMonth() + 1).toString(), // getMonth() is zero-based
        dd = inDate.getDate().toString();

    return yyyy + '-' 
        + (mm.charAt(1) ? mm : "0" + mm.charAt(0)) + '-' 
        + (dd.charAt(1) ? dd : "0" + dd.charAt(0)); // 0-padding
}