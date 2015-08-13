/**
 *  Roadmap JIRA Connect Addon
 *
 *  Author: Anton Maslo
 *  Created: 2015-06-29
 */

AJS.toInit(function () {
    if(!checkJIRAContext())
        return;
    
    // Enhance page
    AJS.inlineHelp();
    
    // https://docs.atlassian.com/aui/latest/docs/form-validation.html
    require(['aui/form-validation']);
    
    // Make AP object available
    // https://developer.atlassian.com/static/connect/docs/latest/guides/connect-cookbook.html#all.js
    // https://developer.atlassian.com/static/connect/docs/latest/javascript/module-AP.html
    var baseUrl = getUrlParam('xdm_e') + getUrlParam('cp');
    
    $('#manage-plugins-link').prop('href', baseUrl + '/plugins/servlet/upm#manage');
    
    $.getScript(baseUrl + '/atlassian-connect/all.js', function() {
        // AP object is available
        
        // Make 'request' available
        AP.require('request', function(request) {
            // Custom field handling (loadConfig is called when dropdown is populated)
            manageCustomFields(request, baseUrl, loadConfig);
            
            AJS.$('#addon-config').off('aui-valid-submit').on('aui-valid-submit', function(e) {
                saveConfig(request);
                e.preventDefault();
            });
        });
    });
    
    /**
     *  Local function definitions
     */
    
    function loadConfig(request) {
        var submitBtn = AJS.$('#addon-config #update-config');
        
        request({
            url: '/rest/atlassian-connect/1/addons/com.roadmap/properties/config',
            success: function(response) {
                var respValue;
                
                if(typeof response === 'string')
                    response = JSON.parse(response);
                
                if(response.value) {
                    respValue = response.value;
                    
                    if(typeof respValue === 'string')
                        respValue = JSON.parse(respValue);
                    
                    displayConfig(respValue);
                } else {
                    displayConfig();
                }
            },
            error: function() {
                // No configuration yet
                displayConfig();
            }
        });
	}
    
    function displayConfig(configData) {
        if(configData) {
            if(configData.apiURL)
                AJS.$('#api-url').val(configData.apiURL);
            
            AJS.$('#custom-field-start-date').val(configData.startDateFieldKey).change();

            if(configData.appURL) {
                AJS.$('#app-url').val(configData.appURL);
                AJS.$('#rm-account-link').prop('href', configData.appURL + '/Account.aspx');
            }
            
            if(configData.rmAdminToken) {
                AJS.$('#rm-admin-token').val(configData.rmAdminToken);
                checkRMToken();
            }
        }

        AJS.$('body').removeClass();
    }

    function saveConfig(request) {
        var submitBtn = AJS.$('#addon-config #update-config'),
            rmAdminToken = AJS.$('#rm-admin-token').val(),
            appURL = AJS.$('#app-url').val(),
            apiURL = AJS.$('#api-url').val(),
            startDateFieldKey = AJS.$('#custom-field-start-date').val();
		
        AJS.$('<span class="aui-icon aui-icon-wait"></span>').prependTo(submitBtn);
        submitBtn.prop('disabled', true);
        
        clearAlerts();
        
        request({
            url: '/rest/atlassian-connect/1/addons/com.roadmap/properties/config',
            type: 'PUT',
            data: '{ "rmAdminToken": "' + rmAdminToken + '", ' 
                + '"appURL": "' + appURL + '", ' 
                + '"apiURL": "' + apiURL + '", ' 
                + '"startDateFieldKey": "' + startDateFieldKey + '" }',
            contentType: "application/json",
            success: function(response) {
                // https://docs.atlassian.com/aui/latest/docs/messages.html
				AJS.messages.success({
					body: 'Saving JIRA addon settings is successful',
					fadeout: true,
                    delay: 2000
				});
                
                submitBtn.find('.aui-icon-wait').remove();
                submitBtn.prop('disabled', false);
                
                unsetAddonConfig(); // Not to use old data
				
                checkRMToken();
                
                saveStartDateField(startDateFieldKey);
            },
            error: function() {
                AJS.$('body').removeClass();
                
                showAlert({ 
                    title: 'Error: ' + arguments[0].statusText,
                    message: 'Error saving addon congiguration.',
                    prependTo: '#main-page-content',
                });
                
                submitBtn.find('.aui-icon-wait').remove();
                submitBtn.prop('disabled', false);
                
                unsetAddonConfig();
            }
        });
	}
	
	function checkRMToken() {
        var configForm = AJS.$('#addon-config');
        
        callRMAPI(
            'GET', 
            '/v1.2/resource/me',
            null,
            tokenCheckOK, 
            tokenCheckErr
        );
		
		function tokenCheckOK(data) {
			configForm.find('.buttons-container .buttons')
				.find('.aui-lozenge').remove().end()
				.append('<span class="aui-lozenge aui-lozenge-subtle aui-lozenge-success">' 
					+ 'Welcome, ' + data.FirstName + ' ' + data.LastName 
					+ '</span>');
		}
		
		function tokenCheckErr(jqXHR, textStatus, errorThrown) {
			configForm.find('.buttons-container .buttons')
				.find('.aui-lozenge').remove().end()
				.append('<span class="aui-lozenge aui-lozenge-subtle aui-lozenge-error" '
					+ 'title="Error: ' + errorThrown + '"'
					+ '>' 
					+ 'Token verification failed' 
					+ '</span>');
		}
	}
    
    // Callback is called after dropdown is populated, to get current config, passing in "request"
    function manageCustomFields(request, baseUrl, callback) {
        AJS.$('#custom-field-start-date').off('change').on('change', function() {
            var fieldId = AJS.$(this).val(),
                elemFieldReminder = AJS.$('#start-date-config-reminder'),
                elemAutoSelect = AJS.$('#start-date-auto-select');

            elemFieldReminder.toggle(fieldId !== '');
            elemAutoSelect.hide();

            if(fieldId) {
                elemFieldReminder.prop('href', 
                    baseUrl + '/secure/admin/AssociateFieldToScreens!default.jspa?fieldId=' 
                    + fieldId 
                    + '&returnUrl=ViewCustomFields.jspa');
            } else {
                // Hint user if field named "Start Date" is already present
                
                // Get list of fields
                var control = AJS.$(this),
                    fields = control.find('option')
                    .map(function() { 
                        var option = AJS.$(this);
                        
                        return { 
                            name: option.text(), 
                            key: option.attr('value') 
                        }; 
                    }).toArray();
                
                fields.forEach(function(field) {
                    if(field.name === 'Start Date') {
                        var autoFieldKey = field.key;
                        elemAutoSelect.show().off('click').on('click', function(e) {
                            control.val(autoFieldKey).change();
                            e.preventDefault();
                        });
                    }
                });
            }
        });

        request({
            url: '/rest/api/2/field',
            success: function(response) {
                // convert the string response to JSON
                if(typeof response === 'string')
                    response = JSON.parse(response);

                // Add custom fields to dropdown
                response.forEach(function(field) {
                    if(field.custom) {
                        AJS.$('#custom-field-start-date').append('<option value="' + field.id + '">' + field.name + '</option>');
                    }
                });
                
                callback(request);
            },
            error: function() {
                AJS.$('body').removeClass();
                
                showAlert({ 
                    title: 'Error: ' + arguments[0].statusText,
                    message: 'Error retrieving JIRA custom fields, please try again later.',
                    prependTo: '#main-page-content',
                    bodyClass: 'network-error'
                });
            }
        });

        AJS.$('#create-start-date-field').off('click').on('click', function(event) {
            // Create new Start Date field
            
            request({
                url: '/rest/api/latest/field',
                type: 'POST',
                data: '{ "name": "Start Date", '
                    + '"description": "This field is mapped to Start Date in Roadmap", ' 
                    + '"type": "com.atlassian.jira.plugin.system.customfieldtypes:datepicker", ' 
                    + '"searcherKey": "com.atlassian.jira.plugin.system.customfieldtypes:daterange" }',
                contentType: "application/json",
                success: function(response) {
                    // Add to the dropdown and select it
                    if(typeof response === 'string')
                        response = JSON.parse(response);

                    AJS.$('#custom-field-start-date')
                        .find('option[selected="selected"]').removeAttr('selected').end()
                        .append('<option value="' + response.id + '" selected="selected">' + response.name + '</option>')
                        .change();
                },
                error: function() {
                    showAlert({ 
                        title: 'Error: ' + arguments[0].statusText,
                        message: 'Error adding a JIRA custom field, please try again later.',
                        prependTo: '#main-page-content'
                    });
                }
            });

            event.preventDefault();
        });
    }
    
    // Save StartDate field to Roadmap to be used for mapping (null key - unset)
    function saveStartDateField(startDateFieldKey) {
        callRMAPI(
            'POST',
            '/v1.1/ext/JIRA/SetStartDateField/',
            {
                BaseUrl: baseUrl,
                FieldKey: startDateFieldKey !== '' ? startDateFieldKey : null
            },
            function(response) {
                // TODO: No further actions?
                console.log('--- SetStartDateField API call success');
            },
            function(url, jqXHR, textStatus, errorThrown) {
                var appURL = AJS.$('#app-url').val();
                
                showAlert({ 
                    title: 'Network error', 
                    url: url,
                    message: 'Error storing custom field configuration in Roadmap (message: ' + textStatus + ')',
                    fixMessage: 'Please make sure JIRA integration is correctly ',
                    fixUrl: appURL + '/ThirdPartyConnections.aspx',
                    fixLabel: 'configured in Roadmap',
                    prependTo: '#main-page-content'
                });
                
                // TODO: Clear custom field selection in addon config on this error?
            });
    }
});