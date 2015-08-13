/**
 *  Roadmap JIRA Connect Addon - Timer logic
 *
 *  Author: Anton Maslo
 *  Created: 2015-07-02
 */

AJS.toInit(function () {
    if(!checkJIRAContext())
        return;
    
    // Enhance page
    AJS.inlineHelp();
    
    // https://docs.atlassian.com/aui/latest/docs/form-validation.html
    require(['aui/form-validation']);
    
    //Register an above zero plugin validator for inputs
    require(['aui/form-validation/validator-register'], function(validator) {
        validator.register(['positive'], function(field) {
            var val = field.$el.val();
            if (isNaN(val) || val <= 0){
                field.invalidate('Positive number');
            } else {
                field.validate();
            }
        });
    });
    
    // Make AP object available
    // https://developer.atlassian.com/static/connect/docs/latest/guides/connect-cookbook.html#all.js
    // https://developer.atlassian.com/static/connect/docs/latest/javascript/module-AP.html
    var baseUrl = getUrlParam('xdm_e') + getUrlParam('cp');
    
    AJS.$.getScript(baseUrl + '/atlassian-connect/all.js', function() {
        // AP object is available
        
        AP.getLocation(function(pageLocation) {
            // Get issue key
            var jiraIssueKey = getUrlParam('issueKey');
            
            AP.require('request', function(request) {
                AJS.$('#config-btn').on('click', function(event) {
                    // TODO: Move class toggling to a function?
                    var prevClass;
                    
                    if($('body').hasClass('config')) {
                        AJS.$('body').removeClass();
                        
                        prevClass = AJS.$('body').data('prev-class');
                        
                        if(prevClass) {
                            AJS.$('body').addClass(prevClass);
                            AJS.$('body').removeData('prev-class');
                        }
                    } else {
                        AJS.$('body').data('prev-class', $('body').attr('class'));
                        
                        AJS.$('body').removeClass().addClass('config');
                    }
                    
                    event.preventDefault();
                });
                
                // request object is available
                AP.getUser(function(user) {
                    // Check user configuration
                    getUserConfig(
                        user.key,
                        function(userConfig) {
                            AJS.$('#rm-token').val(userConfig.rmToken);
                            
                            // TODO: Now use it for API requests!
                            
                            getRmTodoMapping(request);
                        }, 
                        function() {
                            showAlert({ 
                                title: 'Additional configuration', 
                                message: 'Please specify your Roadmap identity token, so that we can display Roadmap data in your JIRA screens',
                                fixMessage: null
                            });
                            
                            AJS.$('#rm-addon-actions').hide();
                            
                            AJS.$('body').removeClass().addClass('config');
                        }
                    );
                    
                    AJS.$('#addon-user-config').on('submit', function(event) {
                        saveUserConfig(user.key, request);
                        event.preventDefault();
                    });
                    
                    
                    // Timer handling calls functions from roadmap-timer.js
                    
                    // Check if there is a running timer record
                    getTimer(jiraIssueKey, user.key, request);
                    
                    AJS.$('#start-timer').off('click').on('click', function() {
                        newTimer(jiraIssueKey, user.key, request);
                    });
                    
                    AJS.$('#cancel-timer').off('click').on('click', function() {
                        // No further action so passing null as callback
                        cancelTimer(jiraIssueKey, user.key, null, request);
                    });
                    
                    AJS.$('#stop-timer').off('click').on('click', function() {
                        stopTimer(jiraIssueKey, user.key, request);
                    });
                    
                    AJS.$('#go-to-another-issue').off('click').on('click', function() {
                        var issueKey = $(this).closest('.running-another-controls').find('.another-issue-key').text();
                        
                        window.open(baseUrl + '/browse/' + issueKey, '_blank');
                    });
                    
                    AJS.$('#log-time').off('click').on('click', function() {
                        logTime(jiraIssueKey);
                        AJS.$('#log-time-form input').trigger('validate');
                    });
                    
                    // Called when validation passes
                    AJS.$('#log-time-form').on('aui-valid-submit', function(event) {
                        submitTime(request);
                        event.preventDefault();
                    });
                    
                    AJS.$('#cancel-submit-time').off('click').on('click', function(event) {
                        AJS.$('#timer')
                            .removeClass()
                            .addClass('timer-stopped');
                        event.preventDefault();
                    });
                });
            });
        });
    });
    
    /**
     *  Local function definitions
     */
    
    function saveUserConfig(userKey, request) {
        var submitBtn = AJS.$('#addon-user-config #update-config'),
            rmToken = AJS.$('#rm-token').val();
		
        AJS.$('<span class="aui-icon aui-icon-wait"></span>').prependTo(submitBtn);
        submitBtn.prop('disabled', true);
        
        clearAlerts();
        
        request({
            url: '/rest/atlassian-connect/1/addons/com.roadmap/properties/user-config-' + userKey,
            type: 'PUT',
            data: '{ "rmToken": "' + rmToken + '" }',
            contentType: "application/json",
            success: function(response) {
                // TODO: Is there a better way than refresh?
                AJS.messages.success({
                    body: 'User settings saved',
                    fadeout: true,
                    delay: 1000
				});
                
                AJS.$('body').removeClass()
                    .addClass('loading');
                
                getRmTodoMapping(request);
            },
            error: function() {
                showAlert({ 
                    title: 'Error: ' + arguments[0].statusText,
                    message: 'Error saving user congiguration.'
                });
                
                submitBtn.find('.aui-icon-wait').remove();
                submitBtn.prop('disabled', false);
            }
        });
	}
    
    function getRmTodoMapping(request) {
        var jiraIssueID = getUrlParam('issueID');
        
        AJS.$('body').addClass('loading');
        
        if(jiraIssueID) {
            callRMAPI(
                'POST', 
                '/v1.1/ext/mappingsext',
                {
                    Host: getHostInfo(baseUrl),
                    Todos: [ {
                        ProjectID: getUrlParam('projectID'),
                        ItemID: getUrlParam('issueID')
                    } ]
                },
                function(response) {
                    var rmTodoID;

                    if(response && response.TodoMappings) {
                        for(var i = 0; i < response.TodoMappings.length; i++) {
                            if(response.TodoMappings[i].ExtID == jiraIssueID) {
                                rmTodoID = response.TodoMappings[i].RmID;
                                break;
                            }
                        }
                    }
                    
                    // TODO: Remove when mapping works
                    console.log('--- returned rmTodoID = ' + rmTodoID + ', replacing with 1405457');
                    if(!rmTodoID)
                        rmTodoID = 1276515;

                    if(rmTodoID) {
                        getRMInfo(rmTodoID, request);
                    } else {
                        AJS.$('body').removeClass().addClass('integration-absent');
                    }
                },
                networkError
            );
        }
    }
    
    function getRMInfo(rmTodoID, request) {
        callRMAPI(
            'GET', 
            '/v1.1/ext/todo/' + rmTodoID,
            null,
            function(response) { 
                populateRMInfo(response, request); 
            },
            networkError
        );
    }
    
    function populateRMInfo(todoData, request) {
        if(!todoData)
            return;
        
        var todoForm = AJS.$('#rm-todo-form');
        
        // Used by time entry (at least)
        todoForm.find('#rm-project-id').val(todoData.ProjectID);
        todoForm.find('#rm-todo-id').val(todoData.ID);
        
        // Link to issue in Roadmap
        if(!addonConfig || !addonConfig.appURL) {
            getAddonConfig(linkToRMTodo, networkError);
        } else {
            linkToRMTodo();
        }
        
        todoForm.find('#rm-todo-actual').val(todoData.Actual && todoData.Actual.Text ? todoData.Actual.Text : '0');
        todoForm.find('#rm-todo-estimate').val(todoData.Estimate && todoData.Estimate.Text ? todoData.Estimate.Text : '0');
        
        populateResources(todoData);
        
        function linkToRMTodo() {
            todoForm.find('#rm-todo-link').prop('href', 
                trimTrailingSlash(addonConfig.appURL) + '/IndProject.aspx?id=' + todoData.ProjectID + '&wi=' + todoData.ID + '&wiType=3');
        }
        
        function populateResources(todoData) {
            // Cleanup
            AJS.$('#timer-resource option, #timer-role option').remove();
            
            getRmUser(function(userData) {
                // Add current user to Timer drop-down (as a default)
                AJS.$('#timer-resource').append('<option value="' + userData.ID 
                    + '" data-role="' + userData.PrimaryRoleID + '" selected>' 
                    + userData.FirstName + ' ' + userData.LastName + '</option>');
                
                getRmRoles(function(roles) {
                    var html = '',
                        isCurrentUserAssigned = false,
                        elemResourceSelect = AJS.$('#timer-resource');
                    
                    // Populate roles;
                    if(roles) {
                        roles.forEach(function(role) {
                            AJS.$('#timer-role').append('<option value="' + role.ID + '">' 
                                + role.Name + '</option>');
                        });
                    }
                    
                    // Now we're ready to parse todo assigned resouces
                    todoData.Resources.forEach(function(resource) {
                        var utilDataArr,
                            utilArr = [];

                        // null ResourceID is returned for 'Anyone', skip it
                        if(resource.ResourceID) {
                            if(todoData.ResourceUtilization) {
                                utilDataArr = todoData.ResourceUtilization.filter(function(obj) { 
                                    return obj.ResourceID == resource.ResourceID;
                                });

                                if(utilDataArr.length > 0) {
                                    utilArr = utilDataArr[0].Utilization.map(function(obj) {
                                        return obj.Utilization;
                                    });
                                }
                            }

                            html += '<li title="' + resource.ResourceName + '"'
                                + ' data-roadmap-id="' + resource.ResourceID + '"><span class="user-icon">'
                                + '<img alt="' + resource.ResourceName + '" title="' + resource.ResourceName
                                + '" src="/images/default-avatar-small.png">' // Initially show default avatar
                                + '</span>'
                                + resource.ResourceName + '<br>' + getUtilizationChart(utilArr) + '</li>';

                            // Also add resource to Time Log form
                            if(resource.ResourceID !== userData.ID) {
                                elemResourceSelect.append('<option value="' + resource.ResourceID 
                                    + '" data-role="' + resource.RoleID + '">' 
                                    + resource.ResourceName + '</option>');
                            } else {
                                // If current user assigned - pre-select the assignment role
                                isCurrentUserAssigned = true;
                                AJS.$('#timer-role').val(resource.RoleID);
                                elemResourceSelect.find('option[value=""]').data('role', resource.RoleID);
                            }
                        }
                    });
                    
                    todoForm.find('#rm-assignments').find('ul').html(html);

                    populateAvatars(todoData.ResourceMappings);
                    
                    // If current user not assigned - pre-select their primary role
                    if(!isCurrentUserAssigned) {
                        AJS.$('#timer-role').val(userData.PrimaryRoleID);
                    }
                    
                    // On resource change select their role from the assignment
                    elemResourceSelect.off('change').on('change', function() {
                        AJS.$('#timer-role').val($(this).find('option:selected').data('role'));
                    });

                    // Display assigned resources if there are > 1
                    todoForm.find('#rm-assignments')
                        .toggle(todoData.Resources && todoData.Resources.length > 1);
                    
                    AJS.$('body').removeClass().addClass('loaded');
                });
            });
        }
        
        // After resources are rendered, fills correct avatar URLs for each
        function populateAvatars(resourceMappings) {
            $('#rm-assignments li').each(function() {
                var element = $(this),
                    userRmID = element.data('roadmap-id'),
                    userJiraID,
                    avatarSrc;

                // Determine JIRA user id from RM id
                if(resourceMappings) {
                    for(var i = 0; i < resourceMappings.length; i++) {
                        if(resourceMappings[i].RmID == userRmID)
                            userJiraID = resourceMappings[i].ExtID;
                    }
                }

                if(userJiraID) {
                    //userJiraID = 'admin';
                    populateUserAvatar(userJiraID, element, request);
                }
            });
        }
        
        function populateUserAvatar(userJiraID, element, request) {
            request({
                url: '/rest/api/2/user?key=' + userJiraID,
                success: function(response) {
                    if(typeof response === 'string')
                        response = JSON.parse(response);
                    
                    if(response && response.avatarUrls && response.avatarUrls['24x24']) {
                        element.find('.user-icon img').attr('src', response.avatarUrls['24x24']);
                    }
                }
            });
        }
        
        function getUtilizationChart(utilArr) {
            var barHtml = '',
                totalUtil = 0,
                chartWidth = 80;

            totalUtil = utilArr.reduce(function(prev, curr) { return prev + curr; }, 0);

            barHtml += '<div class="util-chart" title="' +
                (totalUtil > 0 ? 
                    totalUtil + '% Utilization across ' + utilArr.length + ' project' + (utilArr.length > 1 ? 's' : '') 
                    : 'No project utilization') +
                '">' +
                utilArr.map(function(curr, ind) {
                        return '<span style="width:' + 
                            curr * chartWidth / (totalUtil > 100 ? totalUtil : 100) +
                            'px;background-color:hsla(' + (255 * ind / utilArr.length) + ', 50%, 80%, 1);"></span>';
                    }).join('') +
                '</div>';

            return barHtml;
        }
    }
});