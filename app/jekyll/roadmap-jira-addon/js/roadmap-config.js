/**
 *  Roadmap JIRA Connect Addon
 *
 *  Author: Anton Maslo
 *  Created: 2015-06-29
 */

AJS.toInit(function () {
    if(!API.checkJIRAContext())
        return;
    
    // Enhance page
    AJS.inlineHelp();
    
    // https://docs.atlassian.com/aui/latest/docs/form-validation.html
    require(['aui/form-validation']);
    
    // Make AP object available
    // https://developer.atlassian.com/static/connect/docs/latest/guides/connect-cookbook.html#all.js
    // https://developer.atlassian.com/static/connect/docs/latest/javascript/module-AP.html
    var baseUrl = API.getUrlParam('xdm_e') + API.getUrlParam('cp');
    
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
        
        // TODO: Check network error handling
        API.getAddonProperty('config', displayConfig, API.networkError, displayConfig);
	}
    
    function displayConfig(configData) {
        if(configData) {
            if(configData.apiURL)
                AJS.$('#api-url').val(configData.apiURL);
            
            AJS.$('#custom-field-start-date').val(configData.startDateFieldKey).change();

            if(configData.appURL) {
                AJS.$('#app-url').val(configData.appURL);
                AJS.$('#rm-account-link').prop('href', API.trimTrailingSlash(configData.appURL) + '/Account.aspx');
            }
            
            if(configData.rmAdminToken) {
                AJS.$('#rm-admin-token').val(configData.rmAdminToken);
                checkRMToken();
            }
        }
        
        AJS.$('#addon-config input.text').on('click', function() { 
			this.select(); // Select full text when clicking inside input
		});

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
        
        Alert.clearAll();
        
        request({
            url: '/rest/atlassian-connect/1/addons/roadmap/properties/config',
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
                
                API.unsetAddonConfig(); // Not to use old data
				
                checkRMToken();
                
                saveStartDateField(startDateFieldKey);
            },
            error: function() {
                AJS.$('body').removeClass();
                
                Alert.show({ 
                    title: 'Error: ' + arguments[0].statusText,
                    message: 'Error saving addon congiguration.',
                    prependTo: '#main-page-content',
                });
                
                submitBtn.find('.aui-icon-wait').remove();
                submitBtn.prop('disabled', false);
                
                API.unsetAddonConfig();
            }
        });
	}
	
	function checkRMToken() {
        var configForm = AJS.$('#addon-config');
        
        API.callRMAPI(
            'GET', 
            '/v1.2/resource/me',
            true,
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
            
            listIntegratedProjects();
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
                if(typeof response === 'string')
                    response = JSON.parse(response);
                
                // Add custom fields to dropdown
                response.forEach(function(field) {
                    if(field.custom && field.schema && (field.schema.type === 'date' || field.schema.type === 'datetime')) {
                        AJS.$('#custom-field-start-date').append('<option value="' + field.id + '">' + field.name + '</option>');
                    }
                });
                
                callback(request);
            },
            error: function() {
                AJS.$('body').removeClass();
                
                Alert.show({ 
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
                    Alert.show({ 
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
        API.callRMAPI(
            'POST',
            '/v1.1/ext/JIRA/SetStartDateField/',
            true,
            {
                BaseUrl: baseUrl,
                FieldKey: startDateFieldKey !== '' ? startDateFieldKey : null
            },
            function() {},
            function(url, jqXHR, textStatus, errorThrown) {
                var appURL = AJS.$('#app-url').val();
                
                Alert.show({ 
                    title: 'Network error', 
                    url: url,
                    message: 'Error storing custom field configuration in Roadmap (message: ' + textStatus + ')',
                    fixMessage: 'Please make sure JIRA integration is correctly ',
                    fixUrl: appURL + '/ThirdPartyConnections.aspx',
                    fixLabel: 'configured in Roadmap',
                    prependTo: '#main-page-content'
                });
            }
        );
    }
    
    function listIntegratedProjects() {
        AJS.$('#integrated-projects')
            .html('<span class="aui-icon aui-icon-wait"></span>&nbsp;Retrieving project integration status&hellip;');
        
        AP.require('request', function(request) {
            request({
                url: '/rest/api/2/project',
                success: function(jiraProjects) {
                    if(typeof jiraProjects === 'string')
                        jiraProjects = JSON.parse(jiraProjects);
                    
                    var jiraProjectIDs = jiraProjects.map(function(project) { return project.id; });
                    
                    if(jiraProjectIDs && jiraProjectIDs.length > 0) {                    
                        API.callRMAPI(
                            'POST', 
                            '/v1.1/ext/GetIntegrationStatus',
                            true,
                            { 
                                Host: API.getHostInfo(baseUrl),
                                SourceProjectIDs: jiraProjectIDs
                            },
                            function(integrationStatus) {
                                AJS.$('#integrated-projects').html(getProjectsTable(jiraProjects, integrationStatus));
                            }, 
                            projectRetrievalError
                        );
                    } else {
                        AJS.$('#integrated-projects').html('<p>Failed to retrieve projects from JIRA.' 
                            + ' You can still view it on individual project\'s administration page.</p>');
                    }
                },
                error: projectRetrievalError
            });
        });
    }
    
    function getProjectsTable(jiraProjects, integrationStatus) {
        var html;
        
        html = '<table class="aui"><thead><tr>'
            + '<th>Project</th><th>Status</th><th>Administrate</th></tr></thead><tbody>';
        
        jiraProjects.forEach(function(jiraProject) {
            var integrated = false;
            
            if(integrationStatus && integrationStatus.ProjectMappings) {
                for(var i = 0; i < integrationStatus.ProjectMappings.length; i++) {
                    if(jiraProject.id == integrationStatus.ProjectMappings[i].ExtID)
                        integrated = integrationStatus.ProjectMappings[i].RmID != null;
                }
            }
            
            html += '<tr class="' + (integrated ? 'integrated' : 'not-integrated') + '"><td>' 
                + '<a href="' + baseUrl + '/projects/' + jiraProject.key + '" target="_blank" title="Go to project">' 
                + jiraProject.name + '</a></td>' 
                + '<td>' + (integrated ? '<span class="aui-icon aui-icon-small aui-iconfont-approve"></span>Integrated' 
                    : '<span class="aui-icon aui-icon-small aui-iconfont-remove"></span>Not integrated') 
                + '</td>' 
                + '<td><a href="' + baseUrl + '/plugins/servlet/project-config/' + jiraProject.key + '" target="_blank" ' 
                + 'title="Administrate project"><span class="aui-icon aui-icon-small aui-iconfont-configure"></span>' 
                + '</a></td>' 
                + '</tr>';
        });
        
        html += '</tbody></table>';
        
        return html;
    }
    
    function projectRetrievalError() {
        AJS.$('#integrated-projects').html('<p>Failed to retrieve project integration status.' 
            + ' You can still view it on individual project\'s administration page.</p>');
    }
});