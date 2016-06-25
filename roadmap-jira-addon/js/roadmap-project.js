/**
 *  Roadmap JIRA Connect Addon - Project Config panel
 *
 *  Author: Anton Maslo
 *  Created: 2015-07-06
 */

AJS.toInit(function () {
    if(!API.checkJIRAContext())
        return;
    
    // https://docs.atlassian.com/aui/latest/docs/form-validation.html
    require(['aui/form-validation']);
    
    // Make AP object available
    // https://developer.atlassian.com/static/connect/docs/latest/guides/connect-cookbook.html#all.js
    // https://developer.atlassian.com/static/connect/docs/latest/javascript/module-AP.html
    var baseUrl = API.getUrlParam('xdm_e') + API.getUrlParam('cp');
    var jiraProjectKey = API.getUrlParam('projectKey');
    var jiraProjectID = API.getUrlParam('projectID');
    
    AJS.$('#rm-integration-status')
        .find('#jira-project-key').val(jiraProjectKey).end()
        .find('#jira-project-id').val(jiraProjectID);
    
    $.getScript(baseUrl + '/atlassian-connect/all.js', function() {
        // AP object is available

        if(jiraProjectID) {
            // Check if the project is integrated with Roadmap
            getIntegrationStatus(jiraProjectID, AP);
        } else {
            Alert.show({
                title: 'Error',
                message: 'Couldn\'t retrieve project ID from JIRA.',
                fixMessage: 'Please refresh the page and try again. If the&nbsp;issue persists, ',
                fixUrl: 'https://ppmroadmap.uservoice.com/knowledgebase/topics/106350-integrations-jira',
                fixLabel: 'report it to Roadmap support',
                bodyClass: 'network-error'
            });
        }
    });
    
    return;
    
    
    
    /**
     *  Local function definitions
     */
    
    function getIntegrationStatus(jiraProjectID, AP) {
        API.callRMAPI(
            'POST', 
            '/v1.1/ext/GetIntegrationStatus',
            true,
            { 
                Host: API.getHostInfo(baseUrl),
                SourceProjectIDs: [ jiraProjectID ]
            },
            function(integrationStatus) {
                displayIntegrationStatus(integrationStatus, AP);
            }, 
            API.networkError
        );
    }
    
    function displayIntegrationStatus(integrationStatus, AP) {
        // Check if already integrated
        var rmProjectID,
            elemIntegration = AJS.$('#rm-integration-status'),
            jiraProjectID = elemIntegration.find('#jira-project-id').val(),
            jiraProjectKey = elemIntegration.find('#jira-project-key').val();
        
        if(integrationStatus.ProjectMappings) {
            for(i = 0; i < integrationStatus.ProjectMappings.length; i++) {
                if(integrationStatus.ProjectMappings[i].ExtID == jiraProjectID) {
                    rmProjectID = integrationStatus.ProjectMappings[i].RmID;
                    break;
                }
            }
        }
        
        if(rmProjectID) {
            // Project integrated
            
            // Show JIRA project name
            getJiraProjectName(
                jiraProjectKey,
                function(jiraProjectName) {
                    elemIntegration.find('.jira-project-name').html('&ldquo;' + jiraProjectName + '&rdquo;');
                },
                function() {} // No error processing needed
            );
            
            elemIntegration.removeClass().addClass('integrated');
            
            API.getAddonConfig(function(addonConfig) {
                if(addonConfig && addonConfig.appURL)
                    elemIntegration.find('.rm-project-link')
                        .prop('href', API.trimTrailingSlash(addonConfig.appURL) + '/IndProject.aspx?id=' + rmProjectID);
                
                // Display Roadmap project name
                displayRoadmapProjectName(rmProjectID);
            }, API.networkError);
        } else {
            // Not integrated - check if it can be
            var canIntegrateIndex = -1;
            
            if(integrationStatus.CanIntegrateProjects) {
                for(var i = 0; i < integrationStatus.CanIntegrateProjects.length; i++) {
                    if(integrationStatus.CanIntegrateProjects[i] == jiraProjectID) {
                        canIntegrateIndex = i;
                        break;
                    }    
                }
            }
            
            if(integrationStatus.IntegrationEnabled 
                    && integrationStatus.CanCreateProject
                    && canIntegrateIndex > -1) {
                prepareIntegrateForm(AP);
            } else {
                // Integration is not available
                elemIntegration.removeClass().addClass('integration-absent');
            }
        }
    }
    
    function displayRoadmapProjectName(rmProjectID) {
        API.callRMAPI(
            'GET', 
            '/v1.2/project/' + rmProjectID,
            true,
            null,
            function(project) {
                if(project && project.Name)
                    AJS.$('#rm-integration-status .rm-project-link').html('&ldquo;' + project.Name + '&rdquo;');
            },
            function() {}); // No need for error handling here, RM project name will simply not be shown
    }
    
    function prepareIntegrateForm(AP) {
        var elemIntegration = AJS.$('#rm-integration-status'),
            jiraProjectKey = elemIntegration.find('#jira-project-key').val();
        
        getJiraProjectName(
            jiraProjectKey,
            function(jiraProjectName) {
                elemIntegration.find('#project-name').val(jiraProjectName);
                
                elemIntegration.removeClass().addClass('not-integrated');

                AJS.$('#integrate-project-form').on('aui-valid-submit', integrateProject);
            },
            function() {
                Alert.show({
                    title: 'Warning',
                    message: 'Couldn\'t retrieve JIRA project information, ' 
                        + 'please make sure to enter the desired project name in the form below.',
                    fixMessage: ''
                });

                // Form is still useable
                elemIntegration.removeClass().addClass('not-integrated');

                AJS.$('#integrate').off('click').on('click', integrateProject);
            }
        );
    }
    
    function getJiraProjectName(jiraProjectKey, callback, errorCallback) {
        AP.require('request', function(request) {
            request({
                url: '/rest/api/2/project/' + jiraProjectKey,
                success: function(response) {
                    if(typeof response === 'string')
                        response = JSON.parse(response);
                    
                    callback(response && response.name ? response.name : '');
                },
                error: errorCallback
            });
        });
    }
    
    // Uses form data
    function integrateProject(event) {
        var elemIntegration = AJS.$('#rm-integration-status'),
            jiraProjectID = elemIntegration.find('#jira-project-id').val(),
            projectName = elemIntegration.find('#project-name').val(),
            todoListName = elemIntegration.find('#todo-list-name').val(),
            importClosedIssues = elemIntegration.find('#import-closed-issues').prop('checked');
        
        API.callRMAPI(
            'POST',
            '/v1.1/ext/JIRA/IntegrateProject/',
            true,
            {
                BaseUrl: baseUrl,
                SourceProjectID: jiraProjectID,
                ProjectName: projectName,
                ImportClosedItems: importClosedIssues,
                ToDoListName: todoListName
            },
            function(response) {
                if(!response) {
                    API.networkError();
                    return;
                }
                
                if(response.ValidationError) {
                    Alert.show({
                        type: Alert.AlertTypes.Error,
                        title: 'Validation Error',
                        message: response.ValidationError,
                        fixMessage: ''
                    });
                    
                    elemIntegration.removeClass().addClass('not-integrated');
                    
                    return;
                }
                
                if(response.Warning) {
                    Alert.show({
                        type: Alert.AlertTypes.Warning,
                        title: 'Project import warning',
                        message: response.Warning,
                        fixMessage: ''
                    });
                }
                
                elemIntegration.removeClass().addClass('integrated');

                elemIntegration.find('.rm-project-link')
                    .prop('href', API.trimTrailingSlash(addonConfig.appURL) + '/IndProject.aspx?id=' + response.ProjectID);
                
                displayRoadmapProjectName(response.ProjectID);
            },
            API.networkError);
        
        elemIntegration.find('.checking-display .message-text').html('Integration request sent, awaiting response&hellip;');
        
        elemIntegration.removeClass().addClass('checking');
        
        event.preventDefault();
    }
});