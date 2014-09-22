<?php
	global $accountRegisterURL;
	global $loginURL;
	global $roadmapPages;
	global $roadmapPagesLength;
	global $roadmapCurrentPage;
	global $newFeature1;
?>
<!-- header -->
<div id="header">
	<!-- area -->
	<div class="area">
		<!-- logo -->
		<strong class="logo"><a href="<?php echo get_home_url(); ?>">PPMLite&#8482;</a></strong>
		<!-- banner -->
		<a href="<?php echo getVideoJS($newFeature1); ?>" class="banner"><img src="<?php echo get_template_directory_uri(); ?>/images/banner.gif" alt="image description" width="201" height="31" /></a>
		<!-- login -->
		<div class="login">
			<a href="<?php echo $loginURL; ?>" class="sign-in-btn"><span class="l">Sign In</span><span class="r">&nbsp;</span></a>
			<span class="label">Already have an account?</span>
		</div>
		
		<div id="like-buttons" style="float:right;clear:right;margin-top:20px;width:185px;">
			<iframe src="//www.facebook.com/plugins/like.php?href=http%3A%2F%2Fwww.ppmroadmap.com%2F&amp;send=false&amp;layout=button_count&amp;width=90&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=21&amp;appId=437980759560263" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:90px; height:21px;" allowTransparency="true"></iframe>
			<g:plusone size="medium" href="http://www.ppmroadmap.com/"></g:plusone>
		</div>
	</div>
	<!-- panel -->
	<div class="panel">
		<!-- nav -->
		<ul id="nav">
			<?php
				//nav loop
				for($i = -1;++$i<$roadmapPagesLength;){
					$postID = $roadmapPages[$i]->ID;
					$postName = $roadmapPages[$i]->post_name;
					$postTitle = $roadmapPages[$i]->post_title;
					$parentID = $roadmapPages[$i]->post_parent;
					if($parentID != 0 || $postName == "about-roadmap" || $postName == "contact" || $postName == "terms-of-service" || $postName == "privacy-policy" || $roadmapPages[$i]->not_header_nav[0]) continue;
					echo "<li ";
					if(!is_singular() && $postName == "home" || is_page($postID) || ($roadmapCurrentPage->post_parent == $postID)){
						//identify active page
						echo "class='active'";
					}
					echo "><a href='".($postName == "home"?get_home_url():site_url().'/'.$postName)."'>".($postName == "home"?"Home":$postTitle)."</a></li>";
				}
			?>
		</ul>
		<!-- trial -->
		<span class="trial">Start your risk-free 30 day trial <a data-scout-event="signup, trial header, trial header signup" href="https://app.ppmroadmap.com/AccountRegistration.aspx?utm_source=Marketing+Website&utm_medium=banner&utm_campaign=site+header">Try it now</a></span>
	</div>
</div>
<!-- nav bg -->
<div id="navbg">&nbsp;</div>
<div id="wrapper" class="hfeed">
	<div class="w1">