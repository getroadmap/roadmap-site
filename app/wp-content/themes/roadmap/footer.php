	</div>
</div><!-- close wrapper -->
<!-- footer -->
<div id="footer">
	<div class="footer-holder">
		<!-- nav -->
		<ul class="nav">
			<?php
				//nav loop
				global $roadmapPages;
				global $roadmapPagesLength;
				global $roadmapCurrentPage;
				for($i = -1;++$i<$roadmapPagesLength;){
					$postID = $roadmapPages[$i]->ID;
					$postName = $roadmapPages[$i]->post_name;
					$postTitle = $roadmapPages[$i]->post_title;
					$parentID = $roadmapPages[$i]->post_parent;
					if($parentID != 0 || $postName == "terms-of-service" || $postName == "privacy-policy" || $roadmapPages[$i]->not_footer_nav[0]) continue;
					echo "<li ";
					if(!is_singular() && $postName == "home" || is_page($postID) || ($roadmapCurrentPage->post_parent == $postID)){
						//identify active page
						echo "class='active'";
					}
					echo "><a href='".($postName == "home"?get_home_url():site_url().'/'.$postName)."'>".($postTitle)."</a></li>";
				}
			?>
		</ul>
		<!-- copyright -->
		<div class="copyright">
			<p>&copy; Copyright 2014 PPMLite, LLC. All rights reserved.</p>
			<ul class="privacy-policy">
				<li><a href="<?php echo site_url().'/'; ?>terms-of-service">Terms of Service</a></li>
				<li><a href="<?php echo site_url().'/'; ?>privacy-policy">Privacy Policy</a></li>
			</ul>
		</div>
	</div>
</div>

<!-- Google +1 button rendering -->
<script type="text/javascript">
  (function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
  })();
</script>
<script src="//raw.github.com/benplum/Scout/master/jquery.bp.scout.min.js"></script>
<script>$.scout()</script>