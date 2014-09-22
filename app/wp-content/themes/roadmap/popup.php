<?php
	global $accountRegisterURL;
?>

<!-- vimeo-popup -->
<div id="vimeoPopupContainer" class="vimeo-popup-outer-container">
	<div id="vimeoPopup" class="vimeo-popup">
		<div class="vimeo-popup-t">&nbsp;</div>
		<div class="vimeo-popup-c">
			<div class="container">
				<span class="btn-close"><a href="javascript:closePopupVideo();">Close</a></span>
				<div id="videoPopupHolder" class="video-holder"><a href="#"><img src="images/video02.gif" alt="image description" width="441" height="245" /></a></div>
				<div class="holder">
					<div class="area">
						<span class="sub-title">You’re watching:</span>
						<strong id="popupVideoTitle" class="title">Basecamp+Roadmap</strong>
						<em id="popupVideoDuration" class="time">6:21</em>
					</div>
					<a href="<?php echo $accountRegisterURL; ?>" class="btn-trial"><span class="l">Start your free trial</span><span class="r">&nbsp;</span></a>
				</div>
			</div>
		</div>
		<div class="vimeo-popup-b">&nbsp;</div>
	</div>
</div>

<div id="vimeoPopupBG" class="vimeo-popup-bg"/>