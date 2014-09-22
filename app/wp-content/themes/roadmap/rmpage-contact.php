<?php
	global $accountRegisterURL;
	global $loginURL;
	global $slides;
	global $slidesLen;
	global $newFeature1;
	global $newFeature2;
	global $featuredStory;
	global $roadmapPages;
	global $roadmapPagesLength;
	global $roadmapCurrentPage;
	global $parentPage;
	global $parentID;
	global $children;
	global $childrenLen;
?>

<form action="#" class="register-form">
	<fieldset>
		<div class="row">
			<label for="fn">First Name</label>
			<input type="text" class="text" value="text" id="fn"/>
		</div>
		<div class="row">
			<label for="ln">Last Name</label>
			<input type="text" class="text error" value="" id="ln"/>
			<span class="note">Required</span>
		</div>
		<div class="row">
			<label for="org">Company</label>
			<input type="text" class="text" value="text" id="org"/>
		</div>
		<div class="row">
			<label for="email">Email Address</label>
			<input type="text" class="text" value="mustbe@emailformat" id="email"/>
			<span class="note">Please enter a valid email address</span>
		</div>
		<div class="row">
			<label for="pwd">Password</label>
			<input type="password" class="text" value="password123" id="pwd"/>
			<span class="note">Passwords must match</span>
		</div>
		<div class="row">
			<label for="confirm_pwd">Confirm Password</label>
			<input type="password" class="text" value="password123" id="confirm_pwd"/>
		</div>
		<div class="privacy-policy">
			<input type="checkbox" class="checkbox" id="privacy-policy" />
			<label for="privacy-policy">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</label>
		</div>
		<div class="captcha"><a href="#"><img src="images/captcha.gif" alt="image description" width="312" height="123" /></a></div>
		<span class="submit">Create My Free Account<input type="submit" value=""/></span>
	</fieldset>
</form>

<div class="wpcf7" id="wpcf7-f1-t1-o1">
	<form action="/contact#wpcf7-f1-t1-o1" method="post" class="wpcf7-form">
		<div style="display: none;">
			<input type="hidden" name="_wpcf7" value="1" />
			<input type="hidden" name="_wpcf7_version" value="2.3.1" />
			<input type="hidden" name="_wpcf7_unit_tag" value="wpcf7-f1-t1-o1" />
		</div>
		<p>Your Name (required)<br />
			<span class="wpcf7-form-control-wrap your-name"><input type="text" name="your-name" value="" class="wpcf7-text wpcf7-validates-as-required" size="40" /></span> </p>
		<p>Your Email (required)<br />
			<span class="wpcf7-form-control-wrap your-email"><input type="text" name="your-email" value="" class="wpcf7-text wpcf7-validates-as-email wpcf7-validates-as-required" size="40" /></span> </p>
		<p>Subject<br />
			<span class="wpcf7-form-control-wrap your-subject"><input type="text" name="your-subject" value="" class="wpcf7-text" size="40" /></span> </p>
		<p>Your Message<br />
			<span class="wpcf7-form-control-wrap your-message"><textarea name="your-message" cols="40" rows="10"></textarea></span> </p>
		<p>Please enter the following text in the field below: <input type="hidden" name="_wpcf7_captcha_challenge_captcha-666" value="1359272264" /><img alt="captcha" src="http://www.ppmroadmap.com/wp-content/uploads/wpcf7_captcha/1359272264.png" class="wpcf7-captcha-captcha-666" width="72" height="24" /><br />
		<span class="wpcf7-form-control-wrap captcha-666"><input type="text" name="captcha-666" value="" size="40" /></span></p>
		<p><input type="submit" value="Send" class="wpcf7-submit" /><img class="ajax-loader" style="visibility: hidden;" alt="Sending ..." src="http://www.ppmroadmap.com/wp-content/plugins/contact-form-7/images/ajax-loader.gif" /></p>
		<div class="wpcf7-response-output wpcf7-display-none"></div>
	</form>
</div>