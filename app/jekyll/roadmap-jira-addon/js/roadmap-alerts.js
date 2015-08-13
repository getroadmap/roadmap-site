/**
 *  Roadmap JIRA Connect Addon - Alerts (Error handling / reporting
 *
 *  Author: Anton Maslo
 *  Created: 2015-07-24
 */

function clearAlerts() {
    AJS.$('#rm-alert, .aui-message').remove();
}

function showAlert(options) {
    var html = '',
        alert;
    
	// Defaults
	options = $.extend({
            title: 'Error',
			message: '',
            url: '',
			fixMessage: 'Please try again later. If the&nbsp;issue persists, ',
			fixUrl: 'https://ppmroadmap.uservoice.com/knowledgebase/articles/454134', // TODO: Get proper support link
			fixLabel: 'report it to Roadmap support',
            bodyClass: '',
            prependTo: 'body'
		}, options);
    
    if(options.message === 'error')
        options.message = '';
    
    html = '<div id="rm-alert" class="aui-message aui-message-error">' 
        + '<p class="title"><strong>' + options.title + '</strong></p>' 
        + (options.url ? '<small>' + options.url + '</small>' : '')
        + (options.message ? '<p>' + capitalizeFirstLetter(options.message) + '</p>' : '')
        + (options.fixMessage && options.fixUrl && options.fixLabel ? 
           '<p>' + options.fixMessage + '<a href="' + options.fixUrl + '" target="_blank">' + options.fixLabel + '</a>.</p>' : '')
        + '</div>';
    
    clearAlerts();
    AJS.$('body').removeClass('loading').addClass(options.bodyClass);
    
    alert = AJS.$(html).prependTo(options.prependTo);
}

// Taken from http://stackoverflow.com/a/1026087
function capitalizeFirstLetter(string) {
    if(string.length === 0)
        return string;
    else
        return string.charAt(0).toUpperCase() + string.slice(1);
}