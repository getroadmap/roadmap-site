/**
 *  Roadmap JIRA Connect Addon - Alerts (Error handling / reporting
 *
 *  Author: Anton Maslo
 *  Created: 2015-07-24
 */

// Needed as a wrapper for static methods
function Alert() {
    return this;
}

Alert.AlertTypes = {
    Error: 'Error',
    Warning: 'Warning',
    Info: 'Information'
};

Alert.clearAll = function() {
    AJS.$('#rm-alert, #aui-message-bar .aui-message').remove();
};

Alert.show = function(options) {
    var html = '',
        alert;
    
	// Defaults
	options = $.extend({
            type: Alert.AlertTypes.Error,
            title: 'Error',
			message: '',
            url: '',
			fixMessage: 'Please try again later. If the&nbsp;issue persists, ',
			fixUrl: 'https://ppmroadmap.uservoice.com/knowledgebase/topics/106350-integrations-jira',
			fixLabel: 'report it to Roadmap support',
            bodyClass: '',
            prependTo: '#content'
		}, options);
    
    if(options.message === 'error')
        options.message = '';
    
    html = '<div id="rm-alert" class="aui-message' 
        + (options.type === Alert.AlertTypes.Error ? 
           ' aui-message-error' : (options.type === Alert.AlertTypes.Warning ? ' aui-message-warning' : '')) 
        + '">' 
        + '<p class="title"><strong>' + options.title + '</strong></p>' 
        + (options.url ? '<small>' + options.url + '</small>' : '')
        + (options.message ? '<p>' + Alert.capitalizeFirstLetter(options.message) + '</p>' : '')
        + (options.fixMessage && options.fixUrl && options.fixLabel ? 
           '<p>' + options.fixMessage + '<a href="' + options.fixUrl + '" target="_blank">' + options.fixLabel + '</a>.</p>' : '')
        + '</div>';
    
    Alert.clearAll();
    AJS.$('body').removeClass('loading').addClass(options.bodyClass);
    
    alert = AJS.$(html).prependTo(options.prependTo);
};

// Taken from http://stackoverflow.com/a/1026087
Alert.capitalizeFirstLetter = function(string) {
    if(string.length === 0)
        return string;
    else
        return string.charAt(0).toUpperCase() + string.slice(1);
}