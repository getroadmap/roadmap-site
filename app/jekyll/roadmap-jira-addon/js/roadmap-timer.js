/**
 *  Roadmap JIRA Connect Addon - Timer Helpers
 *
 *  Author: Anton Maslo
 *  Created: 2015-07-08
 */

var timerUpdateHandle;

// For now this is only needed to prefix static method of this file
function Timer() {
    return this;
}

Timer.updateDuration = function(timerStart) {
    var startDate = Timer.getProperDate(timerStart);
    
    if(timerUpdateHandle)
        clearInterval(timerUpdateHandle);
    
    renderTimerDuration();
    timerUpdateHandle = setInterval(renderTimerDuration, 1000);
    
    function renderTimerDuration() {
        var timeSpan = new Date(Timer.getSpanDuration(startDate));
	
		AJS.$('#timer .timer-duration').text( // Populate the ticker with updated values
                timeSpan.getUTCHours().pad2(10) + ':' +
                timeSpan.getUTCMinutes().pad2(10) + ':' +
                timeSpan.getUTCSeconds().pad2(10)
            );
    }
};

Timer.get = function(request) {
    var jiraIssueKey = API.getUrlParam('issueKey'),
        jiraUserKey = AJS.$('#jira-user-key').val(), 
        rmProjectData = AJS.$('#rm-todo-form').data('rmProjectData');
    
    // Check access to timer functions
    if(rmProjectData && !rmProjectData.CanTimeTrack) {
        AJS.$('#timer .stopped-controls, #timer .log-controls, #stop-timer').hide();
    }
    
    API.getAddonProperty(
        'timer-for-user-' + jiraUserKey,
        function(timerRecord) { 
            // Found
            AJS.$('#timer').removeClass();
        
            if(timerRecord && timerRecord.issueKey && timerRecord.started) {
                AJS.$('#timer').data('timer', timerRecord);

                if(timerRecord.issueKey === jiraIssueKey) {
                    // Timer running for current issue
                    AJS.$('#timer').addClass('timer-running');

                    Timer.updateDuration(timerRecord.started);
                } else {
                    // Timer running for another issue
                    // TODO: Display the other issue name?
                    AJS.$('#timer').addClass('timer-running-another')
                        .find('.another-issue-key').text(timerRecord.issueKey);
                }
            } else {
                AJS.$('#timer').addClass('timer-stopped');
            }
        },
        API.networkError,
        function() {
            // Property not found - there is no timer for this user
            AJS.$('#timer')
                .removeClass()
                .addClass('timer-stopped');
        });
};

Timer.create = function(jiraIssueKey, jiraUserKey, request) {
    var timerRecord = {
        issueKey: jiraIssueKey,
        started: new Date()
    };
    
    Alert.clearAll();

    request({
        url: '/rest/atlassian-connect/1/addons/roadmap/properties/timer-for-user-' + jiraUserKey,
        type: 'PUT',
        data: JSON.stringify(timerRecord),
        contentType: "application/json",
        success: function(response) {
            AJS.$('#timer')
                .removeClass()
                .addClass('timer-running');
            
            AJS.$('#timer').data('timer', timerRecord);
            Timer.updateDuration();
        },
        error: function() {
            Alert.show({
                title: 'Error' 
                    + (arguments.length > 0 && arguments[0] && arguments[0].statusText ? ': ' + arguments[0].statusText : ''),
                message: 'Error saving timer data, timer is not started.'
            });

            AJS.$('#roadmap-timer')
                .removeClass()
                .addClass('timer-stopped');
        }
    });
};

Timer.stop = function(jiraIssueKey, jiraUserKey, request) {
    var timerRecord = AJS.$('#timer').data('timer'),
        timerDuration = 0;
    
    if(timerRecord && timerRecord.started)
        timerDuration = Timer.getSpanDuration(timerRecord.started) / 3600000;

    Timer.cancel(
        jiraIssueKey, 
        jiraUserKey, 
        function() { Timer.log(jiraIssueKey, timerDuration); },
        request, 
        true);
};

Timer.log = function(jiraIssueKey, timerDuration) {
    AJS.$('#timer-form-duration').val((timerDuration || 0).roundTo2());
    
    API.getRmUser(function(userData) {
        // Configure date-picker on the first call
        if(AJS.$('#timer-date').data('aui-dp-uuid') === undefined) {
            var timerDate = AJS.$('#timer-date').datePicker({
                overrideBrowserDefault: true,
                //dateFormat: API.fixDateFormat(userData.DateEntryFormat) // TODO: Not practical until there is a .getDate method
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
    
    Alert.clearAll();
    
    AJS.$('#timer')
        .removeClass()
        .addClass('timer-log');
    
    AJS.$('#log-time-form input').trigger('validate');
};

Timer.submit = function(request, callback) {
    if(AJS.$('#timer-form-duration').val() == 0)
        return;
    
    var logEntry = {
        ProjectID: AJS.$('#rm-todo-form #rm-project-id').val(),
        TodoItemID: AJS.$('#rm-todo-form #rm-todo-id').val(),
        Time: AJS.$('#timer-form-duration').val(),
        //Date: API.convertDateToAPI(new Date(AJS.$('#timer-date').val())),
        Description: AJS.$('#timer-description').val(),
        ResourceID: AJS.$('#timer-resource').val(),
        RoleID: AJS.$('#timer-role').val()
    };
    
    Alert.clearAll();
    
    // TODO: VERY hacky, change this after .getDate is available
    var dateString = AJS.$('#timer-date').val(),
        year = dateString.substr(0, 4),
        month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(dateString.substr(5, 2)) - 1],
        day = parseInt(dateString.substr(8, 2));
    
    logEntry.Date = API.convertDateToAPI(new Date(month + ' ' + day + ', ' + year));
    
    AJS.$('body').addClass('loading');
    
    API.callRMAPI(
        'POST',
        '/v1.1/ext/timeentry/add',
        false,
        logEntry, 
        function(todoData) {
            if(todoData)
                callback(todoData);
            
            AJS.$('#timer')
                .removeClass()
                .addClass('timer-stopped');
            
            AJS.$('body').removeClass('loading');
        },
        function(url, jqXHR, textStatus, errorThrown) {
            AJS.$('body').removeClass('loading');
            
            Alert.show({ 
                title: 'Network error', 
                url: url,
                message: 'Error saving time entry (message: ' + textStatus + ')',
                prependTo: '#timer .log-controls'
            });
        }
    );
};

// dontUpdateUI set to true if other process (e.g. Timer.stop) called Timer.cancel
Timer.cancel = function(jiraIssueKey, jiraUserKey, callback, request, dontUpdateUI) {
    Alert.clearAll();
    
    request({
        url: '/rest/atlassian-connect/1/addons/roadmap/properties/timer-for-user-' + jiraUserKey,
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
            Alert.show({
                title: 'Error' 
                    + (arguments.length > 0 && arguments[0] && arguments[0].statusText ? ': ' + arguments[0].statusText : ''),
                message: 'Error cancelling timer. The timer is still running.'
            });
        }
    });
};

Number.prototype.pad2 = function() {
	return (this < 10 ? '0' : '') + this;
};

Number.prototype.roundTo2 = function() {
	return Math.round((this + 0.00001) * 100) / 100;
};

Timer.getProperDate = function(inDate) {
    return (inDate ? 
         (typeof inDate === 'string' ? new Date(inDate) : inDate)
         : new Date())
}

// Returns timespan duration in milliseconds
Timer.getSpanDuration = function(start, end) {
    var startDate = Timer.getProperDate(start),
        endDate = Timer.getProperDate(end);
    
    return endDate.getTime() - startDate.getTime();
}