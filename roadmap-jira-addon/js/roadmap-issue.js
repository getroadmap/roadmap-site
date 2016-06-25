/**
 *  Roadmap JIRA Connect Addon - Timer logic
 *
 *  Author: Anton Maslo
 *  Created: 2015-07-02
 */

AJS.toInit(function () {
    if(!API.checkJIRAContext())
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
    var baseUrl = API.getUrlParam('xdm_e') + API.getUrlParam('cp');
    
    AJS.$.getScript(baseUrl + '/atlassian-connect/all.js', function() {
        // AP object is available
        
        AP.getLocation(function(pageLocation) {
            // Get issue key
            var jiraIssueKey = API.getUrlParam('issueKey');
            
            AP.require('request', function(request) {
                // TODO: Test checking user permissions / JIRA Configuration
                /*
                request({
                    url: '/rest/api/2/mypermissions',
                    success: function(response) {
                        if(typeof response === 'string')
                            response = JSON.parse(response);

                        console.log('--- /rest/api/2/mypermissions');
                        console.log(response);
                    }
                });
                
                request({
                    url: '/rest/api/2/configuration',
                    success: function(response) {
                        if(typeof response === 'string')
                            response = JSON.parse(response);

                        console.log('--- /rest/api/2/configuration');
                        console.log(response);
                    }
                });*/
                
                
                AJS.$('#config-btn').on('click', function(event) {
                    toggleClassBetweenOriginalAnd('config');
                    event.preventDefault();
                });
                
                // Update account link for user config
                API.getAddonConfig(function(addonConfig) {
                    if(addonConfig.appURL) {
                        AJS.$('#rm-account-link').prop('href', API.trimTrailingSlash(addonConfig.appURL) +
                            '/Account.aspx');
                    }
                });
                
                AJS.$('#addon-user-config input.text').on('click', function() { 
                    this.select(); // Select full text when clicking inside input
                });
                
                // request object is available
                AP.getUser(function(user) {
                    AJS.$('#jira-user-key').val(user.key);
                    
                    // Check user configuration
                    API.getUserConfig(
                        user.key,
                        function(userConfig) {
                            AJS.$('#rm-token').val(userConfig.rmToken);
                            
                            getRmTodoMapping(request);
                        }, 
                        function() {
                            Alert.show({ 
                                title: 'Additional configuration',
                                message: 'Please specify your Roadmap identity token to see Roadmap data in JIRA.',
                                fixMessage: null
                            });
                            
                            AJS.$('#rm-addon-actions, #cancel-user-config').hide(); // TODO: Use a class instead?
                            
                            AJS.$('body').removeClass().addClass('config');
                        }
                    );
                    
                    AJS.$('#addon-user-config').on('aui-valid-submit', function(event) {
                        API.saveUserConfig(user.key, request, getRmTodoMapping);
                        event.preventDefault();
                    });
                    
                    AJS.$('#cancel-user-config').on('click', function(event) {
                        AJS.$('body').removeClass().addClass('loaded');
                        event.preventDefault();
                    });
                    
                    AJS.$('#start-timer').off('click').on('click', function() {
                        Timer.create(jiraIssueKey, user.key, request);
                    });
                    
                    AJS.$('#cancel-timer').off('click').on('click', function() {
                        // No further action so passing null as callback
                        Timer.cancel(jiraIssueKey, user.key, null, request);
                    });
                    
                    AJS.$('#stop-timer').off('click').on('click', function() {
                        Timer.stop(jiraIssueKey, user.key, request);
                    });
                    
                    AJS.$('#go-to-another-issue').off('click').on('click', function() {
                        var issueKey = $(this).closest('.running-another-controls').find('.another-issue-key').text();
                        
                        window.open(baseUrl + '/browse/' + issueKey, '_blank');
                    });
                    
                    AJS.$('#log-time').off('click').on('click', function() {
                        Timer.log(jiraIssueKey);
                        AJS.$('#log-time-form input').trigger('validate');
                    });
                    
                    // Called when validation passes
                    AJS.$('#log-time-form').on('aui-valid-submit', function(event) {
                        Timer.submit(request, function(todoData) {
                            updateProgressTracker(todoData.Actual, todoData.Estimate);
                        });
                        event.preventDefault();
                    });
                    
                    AJS.$('#cancel-submit-time').off('click').on('click', function(event) {
                        AJS.$('#timer').removeClass().addClass('timer-stopped');
                        event.preventDefault();
                    });
                });
            });
        });
    });
    
    /**
     *  Local function definitions
     */
    
    function getRmTodoMapping(request) {
        var jiraIssueID = API.getUrlParam('issueID');
        
        AJS.$('body').addClass('loading');
        
        if(jiraIssueID) {
            API.callRMAPI(
                'POST', 
                '/v1.1/ext/mappingsext',
                false,
                {
                    Host: API.getHostInfo(baseUrl),
                    Todos: [ {
                        ProjectID: API.getUrlParam('projectID'),
                        ItemID: API.getUrlParam('issueID')
                    } ]
                },
                function(response) {
                    var rmTodoID,
                        rmProjectData;

                    if(response && response.TodoMappings) {
                        for(var i = 0; i < response.TodoMappings.length; i++) {
                            if(response.TodoMappings[i].ExtID == jiraIssueID) {
                                rmTodoID = response.TodoMappings[i].RmID;
                                break;
                            }
                        }
                    }
                    
                    if(rmTodoID) {
                        // Get project info
                        if(response.ProjectMappings && response.ProjectMappings.length > 0) {
                            // Store project for later use (it has permissions)
                            AJS.$('#rm-todo-form').data('rmProjectData', response.ProjectMappings[0]); // Single project is passed in
                        }
                        
                        getRMInfo(rmTodoID, rmProjectData, request);
                    } else {
                        AJS.$('body').removeClass().addClass('integration-absent');
                    }
                },
                API.networkError
            );
        }
    }
    
    function getRMInfo(rmTodoID, request) {
        API.callRMAPI(
            'GET', 
            '/v1.1/ext/todo/' + rmTodoID,
            false,
            null,
            function(response) { 
                populateRMInfo(response, request); 
            },
            API.networkError
        );
    }
    
    function populateRMInfo(todoData, request) {
        if(!todoData)
            return;
        
        var todoForm = AJS.$('#rm-todo-form'),
            todoProgress = 0;
        
        // Used by time entry (at least)
        todoForm.find('#rm-project-id').val(todoData.ProjectID);
        todoForm.find('#rm-todo-id').val(todoData.ID);
        
        // Link to issue in Roadmap
        API.getAddonConfig(linkToRMTodo, API.networkError);
        
        updateProgressTracker(todoData.Actual, todoData.Estimate);
        
        populateResources(todoData);
        
        // Check if there is a running timer record
        Timer.get(request);
        
        return;
        
        
        /**
         *  Helper functions
         */
        
        function linkToRMTodo(addonConfig) {
            if(addonConfig.appURL) {
                todoForm.find('#rm-todo-link').prop('href', API.trimTrailingSlash(addonConfig.appURL) +
                    '/IndProject.aspx?id=' + todoData.ProjectID +
                    '&wi=' + todoData.ID + '&wiType=3');
            }
        }
        
        function populateResources(todoData) {
            // Cleanup
            AJS.$('#timer-resource option, #timer-role option').remove();
            
            API.getRmUser(function(userData) {
                // Add current user to Timer drop-down (as a default)
                AJS.$('#timer-resource').append('<option value="' + userData.ID 
                    + '" data-role="' + userData.PrimaryRoleID + '" selected>' 
                    + userData.FirstName + ' ' + userData.LastName + '</option>');
                
                API.getRmRoles(function(roles) {
                    var html = '',
                        isCurrentUserAssigned = false,
                        elemResourceSelect = AJS.$('#timer-resource');
                    
                    // Populate roles
                    if(roles) {
                        roles.forEach(function(role) {
                            if(!role.IsArchived)
                                AJS.$('#timer-role').append('<option value="' + role.ID + '">' 
                                    + role.Name + '</option>');
                        });
                    }
                    
                    // Now ready to parse todo assigned resouces
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
                                + '<img width="24" height="24" title="' + resource.ResourceName
                                + '" src="images/default-avatar-small.png">' // Initially show default avatar
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
                    
                    if(todoData.Resources && todoData.Resources.length > 1) {
                        todoForm.find('#rm-assignments').find('ul').html(html);
                        populateAvatars(todoData.ResourceMappings);
                    }
                    
                    addGrantedResources(todoData.ProjectID);
                    
                    // If current user (default selection) is not assigned - pre-select their primary role
                    if(!isCurrentUserAssigned) {
                        AJS.$('#timer-role').val(userData.PrimaryRoleID);
                    }
                    
                    // On resource change select their role from the assignment
                    elemResourceSelect.off('change').on('change', function() {
                        var roleSelect = AJS.$('#timer-role'),
                            roleID = $(this).find('option:selected').data('role'),
                            availableRoles;
                        
                        availableRoles = roleSelect.find('option')
                            .map(function() { return AJS.$(this).attr('value'); }).toArray();
                        
                        if(roleID && availableRoles.indexOf(roleID.toString()) !== -1)
                            roleSelect.val(roleID);
                    });

                    // Display assigned resources if > 1
                    todoForm.find('#rm-assignments')
                        .toggle(todoData.Resources && todoData.Resources.length > 1);
                    
                    AJS.$('body').removeClass().addClass('loaded');
                });
            });
        }
        
        // Add granted resources for project (to display as alternatives in Log Time form)
        function addGrantedResources(rmProjectID) {
            var elemResourceSelect = AJS.$('#timer-resource');
            
            API.getRmResources(rmProjectID, function(rmGrantedResources) {
                if(rmGrantedResources && rmGrantedResources.length > 0) {
                    var assignedResources,
                        resourceName,
                        html = '';

                    // Get list of currently displayed resources
                    assignedResources = elemResourceSelect.find('option').map(function() {
                        return AJS.$(this).attr('value');
                    }).toArray();

                    // Don't sort - it's already done on the server

                    for(var i = 0; i < rmGrantedResources.length; i++) {
                        // Except for already shown resources (current + assigned)
                        if(assignedResources.indexOf(rmGrantedResources[i].ID.toString()) === -1) {
                            if(!html)
                                html = '<option disabled>──────────</option>'; // separator

                            // Empty first/last means Company resource
                            resourceName = (!rmGrantedResources[i].FirstName && !rmGrantedResources[i].LastName ?
                                rmGrantedResources[i].CompanyName :
                                rmGrantedResources[i].FirstName + ' ' + rmGrantedResources[i].LastName);

                            html += '<option value="' + rmGrantedResources[i].ID + '"' + 
                                (rmGrantedResources[i].PrimaryRoleID ? 
                                    ' data-role="' + rmGrantedResources[i].PrimaryRoleID + '"' : '') 
                                + '>' + resourceName + '</option>';
                        }
                    }

                    elemResourceSelect.append(html);
                }
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
    
    function updateProgressTracker(actual, estimate) {
        var html = '',
            states = {
                Unknown: 'Unknown',
                NotStarted: 'NotStarted',
                InProgress: 'InProgress',
                Done: 'Done',
                Overtime: 'Overtime'
            },
            state = states.Unknown;

        // TODO: Testing of different cases, remove when done
        /*actual = {
            Time: 24,
            Text: '24 hours'
        };*/

        if(!estimate)
            estimate = {
                Time: 0,
                Text: '0 hrs'
            };

        // Determine todo state
        if(!actual || actual.Time == 0) {
            state = states.NotStarted;
            actual = {
                Time: 0,
                Text: '0 hrs'
            }
        } else if(actual.Time > 0 && (estimate.Time === 0 || actual.Time < estimate.Time)) {
            state = states.InProgress;
        } else if(actual.Time > 0 && actual.Time == estimate.Time) {
            state = states.Done;
        } else if(actual.Time > 0 && actual.Time > estimate.Time) {
            state = states.Overtime;
        }

        // Show estimate if defined
        if(estimate.Time > 0) {
            html += '<div class="estimate-display state-' + state + '"><span class="estimate-label">Estimate</span>' 
                + '<span class="estimate-value">' + estimate.Text + '</span></div>';
        }

        html += '<ol class="aui-progress-tracker state-' + state + '">'

        // 1st step
        html += '<li class="aui-progress-tracker-step' 
            + (state === states.NotStarted ? ' aui-progress-tracker-step-current' : '')
            + '" style="width:33%"><span>'
            + (state === states.NotStarted ? 'Not started' : 'Progress')
            + '</span></li>';

        // In progress step (optional)
        if(state === states.InProgress) {
            html += '<li class="aui-progress-tracker-step aui-progress-tracker-step-current" style="width:33%"><span>' 
                 + actual.Text
                 + '</span></li>';
        }

        // Done step
        html += '<li class="aui-progress-tracker-step'
            + (state === states.Done || state === states.Overtime ? ' aui-progress-tracker-step-current' : '')
            + '" style="width:33%"><span>' 
            + (state === states.Done || state === states.Overtime ? actual.Text : '&nbsp;')
            + '</span></li>';

        html += '</ol>';

        AJS.$('#rm-todo-progress').html(html);
    }
    
    // Toggles between current and provided class
    function toggleClassBetweenOriginalAnd(newClass) {
        var prevClass;

        if($('body').hasClass(newClass)) {
            AJS.$('body').removeClass();

            prevClass = AJS.$('body').data('prev-class');

            if(prevClass) {
                AJS.$('body').addClass(prevClass);
                AJS.$('body').removeData('prev-class');
            }
        } else {
            AJS.$('body').data('prev-class', $('body').attr('class'));

            AJS.$('body').removeClass().addClass(newClass);
        }
    }
});