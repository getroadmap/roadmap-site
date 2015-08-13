/**
 *  Roadmap JIRA Connect Addon - Timer Helpers
 *
 *  Author: Anton Maslo
 *  Created: 2015-07-08
 */

var timerUpdateHandle;

function updateTimerDuration(timerStart) {
    var startDate = getProperDate(timerStart);
    
    if(timerUpdateHandle)
        clearInterval(timerUpdateHandle);
    
    renderTimerDuration();
    timerUpdateHandle = setInterval(renderTimerDuration, 1000);
    
    function renderTimerDuration() {
        var timeSpan = new Date(getDuration(startDate));
	
		AJS.$('#timer .timer-duration').text( // Populate the ticker with updated values
                timeSpan.getUTCHours().pad2(10) + ':' +
                timeSpan.getUTCMinutes().pad2(10) + ':' +
                timeSpan.getUTCSeconds().pad2(10)
            );
    }
}

function getTimer(jiraIssueKey, jiraUserKey, request) {
    request({
        url: '/rest/atlassian-connect/1/addons/com.roadmap/properties/timer-for-user-' + jiraUserKey,
        success: function(response) {
            var timerRecord;

            // TODO: Move response handling/type-check/parsing to a function
            if(typeof response === 'string')
                response = JSON.parse(response);

            if(response.value) {
                timerRecord = typeof response.value === 'string' ? JSON.parse(response.value) : response.value;
            }

            if(timerRecord && timerRecord.issueKey && timerRecord.started) {
                AJS.$('#timer').data('timer', timerRecord);
                
                if(timerRecord.issueKey === jiraIssueKey) {
                    // Timer running for current issue
                    AJS.$('#timer')
                        .removeClass()
                        .addClass('timer-running');
                    
                    updateTimerDuration(timerRecord.started);
                } else {
                    // Timer running for another issue
                    AJS.$('#timer')
                        .removeClass()
                        .addClass('timer-running-another')
                        .find('.another-issue-key').text(timerRecord.issueKey);
                }
            } else {
                AJS.$('#timer')
                    .removeClass()
                    .addClass('timer-stopped');
            }
        },
        error: function() {
            // There is no corresponding property - i.e. there is no timer for this user
            // TODO: Get list of properties first, to avoid error? https://developer.atlassian.com/static/connect/docs/latest/rest-apis/
            AJS.$('#timer')
                .removeClass()
                .addClass('timer-stopped');
        }
    });
}

function newTimer(jiraIssueKey, jiraUserKey, request) {
    var timerRecord = {
        issueKey: jiraIssueKey,
        started: new Date()
    };
    
    clearAlerts();

    request({
        url: '/rest/atlassian-connect/1/addons/com.roadmap/properties/timer-for-user-' + jiraUserKey,
        type: 'PUT',
        data: JSON.stringify(timerRecord),
        contentType: "application/json",
        success: function(response) {
            AJS.$('#timer')
                .removeClass()
                .addClass('timer-running');
            
            AJS.$('#timer').data('timer', timerRecord);
            updateTimerDuration();
        },
        error: function() {
            showAlert({
                title: 'Error' 
                    + (arguments.length > 0 && arguments[0] && arguments[0].statusText ? ': ' + arguments[0].statusText : ''),
                message: 'Error saving timer data, timer is not started.'
            });

            AJS.$('#roadmap-timer')
                .removeClass()
                .addClass('timer-stopped');
        }
    });
}

function stopTimer(jiraIssueKey, jiraUserKey, request) {
    var timerRecord = AJS.$('#timer').data('timer'),
        timerDuration = 0;
    
    if(timerRecord && timerRecord.started)
        timerDuration = getDuration(timerRecord.started) / 3600000;

    cancelTimer(
        jiraIssueKey, 
        jiraUserKey, 
        function() { logTime(jiraIssueKey, timerDuration); },
        request, 
        true);
}

function logTime(jiraIssueKey, timerDuration) {
    AJS.$('#timer-form-duration').val((timerDuration || 0).roundTo2());
    
    getRmUser(function(userData) {
        // Configure date-picker on the first call
        if(AJS.$('#timer-date').data('aui-dp-uuid') === undefined) {
            var timerDate = AJS.$('#timer-date').datePicker({
                overrideBrowserDefault: true,
                //dateFormat: fixDateFormat(userData.DateEntryFormat) // TODO: Not practical until there is a .getDate method
            });

            // TODO: Hacky method, created https://ecosystem.atlassian.net/browse/AUI-3688, change this when/if resolved
            AJS.$('#timer-date').click();
            timerDate.setDate(new Date());
            AJS.$('.aui-datepicker-dialog .ui-datepicker-calendar .ui-state-active').click();
        }
    });
    
    // Re-set modify resources controls
    AJS.$('#modify-resource-controls').hide();
    
    AJS.$('#modify-resource-link').show().off('click').on('click', function() {
        AJS.$(this).hide();
        AJS.$('#modify-resource-controls').slideDown();
    });
    
    clearAlerts();
    
    AJS.$('#timer')
        .removeClass()
        .addClass('timer-log');
    
    AJS.$('#log-time-form input').trigger('validate');
}

function submitTime(request) {
    if(AJS.$('#timer-form-duration').val() == 0)
        return;
    
    var logEntry = {
        ProjectID: AJS.$('#rm-todo-form #rm-project-id').val(),
        TodoItemID: AJS.$('#rm-todo-form #rm-todo-id').val(),
        Time: AJS.$('#timer-form-duration').val(),
        //Date: convertDateToAPI(new Date(AJS.$('#timer-date').val())),
        Description: AJS.$('#timer-description').val(),
        ResourceID: AJS.$('#timer-resource').val(),
        RoleID: AJS.$('#timer-role').val()
    };
    
    clearAlerts();
    
    // TODO: VERY hacky, change this after .getDate is available
    var dateString = AJS.$('#timer-date').val(),
        year = dateString.substr(0, 4),
        month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(dateString.substr(5, 2)) - 1],
        day = parseInt(dateString.substr(8, 2));
    
    logEntry.Date = convertDateToAPI(new Date(month + ' ' + day + ', ' + year));
    
    AJS.$('body').addClass('loading');
    
    callRMAPI(
        'POST',
        '/v1.1/ext/timeentry/add', 
        logEntry, 
        function(todoData) {
            // Update actual time in todo display
            AJS.$('#rm-todo-form').find('#rm-todo-actual').val(todoData.Actual && todoData.Actual.Text ? todoData.Actual.Text : '0').end()
                .find('#rm-todo-estimate').val(todoData.Estimate && todoData.Estimate.Text ? todoData.Estimate.Text : '0');
            
            AJS.$('#timer')
                .removeClass()
                .addClass('timer-stopped');
            
            AJS.$('body').removeClass('loading');
        },
        function(url, jqXHR, textStatus, errorThrown) {
            AJS.$('body').removeClass('loading');
            
            showAlert({ 
                title: 'Network error', 
                url: url,
                message: 'Error saving time entry (message: ' + textStatus + ')',
                prependTo: '#timer .log-controls'
            });
        }
    );
}

// dontUpdateUI set to true if other process (e.g. stopTimer) called cancelTimer
function cancelTimer(jiraIssueKey, jiraUserKey, callback, request, dontUpdateUI) {
    clearAlerts();
    
    request({
        url: '/rest/atlassian-connect/1/addons/com.roadmap/properties/timer-for-user-' + jiraUserKey,
        type: 'DELETE',
        success: function(response) {
            if(!dontUpdateUI) {
                AJS.$('#timer')
                    .removeClass()
                    .addClass('timer-stopped');
            }
            
            clearInterval(timerUpdateHandle);
            timerUpdateHandle = null;
            
            if(typeof callback === 'function')
                callback();
        },
        error: function() {
            // Doesn't stop timer in UI either?
            showAlert({
                title: 'Error' 
                    + (arguments.length > 0 && arguments[0] && arguments[0].statusText ? ': ' + arguments[0].statusText : ''),
                message: 'Error cancelling timer. The timer is still running.'
            });
        }
    });
}

Number.prototype.pad2 = function() {
	return (this < 10 ? '0' : '') + this;
};

Number.prototype.roundTo2 = function() {
	return Math.round((this + 0.00001) * 100) / 100;
};

function getProperDate(inDate) {
    return (inDate ? 
         (typeof inDate === 'string' ? new Date(inDate) : inDate)
         : new Date())
}

// Returns timespan duration in milliseconds
function getDuration(start, end) {
    var startDate = getProperDate(start),
        endDate = getProperDate(end);
    
    return endDate.getTime() - startDate.getTime();
}