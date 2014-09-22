<?php
	global $accountRegisterURL;
	global $loginURL;
	global $roadmapPages;
	global $roadmapPagesLength;
	global $roadmapCurrentPage;
	global $parentID;
	global $children;
	global $childrenLen;
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<!-- Needed for proper snippets: html itemscope itemtype="http://schema.org/Product"-->
<html xmlns="http://www.w3.org/1999/xhtml" <?php language_attributes(); ?> itemscope itemtype="http://schema.org/Product">
<head>
	<meta http-equiv="content-type" content="<?php bloginfo('html_type'); ?>; charset=<?php bloginfo('charset'); ?>" />
	
	<!-- +Snippet config -->
	<meta itemprop="name" content="Roadmap - Project Portfolio Management">
	<meta itemprop="description" content="Organize &amp; report on your project portfolio, managing resource allocations. Grid and gantt view, project drill-down, milestones, to-dos, notes, roadblocks, attachments. Try for free!">
	<meta itemprop="image" content="http://www.ppmroadmap.com/wp-content/themes/roadmap/images/logo.jpg">
	<!-- End of +Snippet -->

	<!-- FB snippet -->
	<meta property="og:title" content="Roadmap - Project Portfolio Management" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="http://www.ppmroadmap.com/" />
	<meta property="og:image" content="http://www.ppmroadmap.com/wp-content/themes/roadmap/images/logo.jpg" />
	<meta property="og:description" content="Organize &amp; report on your project portfolio, manage resource allocations. Grid and gantt view, project drill-down, milestones, to-dos, notes, roadblocks, attachments. Try for free!" />
	<!-- End of FB snippet -->

	<title><?php
		if(!(is_home() || is_front_page())) {
			echo "Roadmap - ";
		
			if($parentID != 0){
				$parentPost = get_post($parentID);
				echo $parentPost->post_title." - ";
			}
		}
		echo $roadmapCurrentPage->post_title;
	?></title>

	<link rel="stylesheet" type="text/css" href="<?php bloginfo('stylesheet_url'); ?>" />
	<?php
		wp_deregister_script('jquery');
		wp_register_script('jquery', 'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', array(), '1.7.2');
		wp_enqueue_script('jquery');
	?>
	<?php wp_head(); ?>

    <link type="text/css" rel="stylesheet" href="<?php echo get_template_directory_uri(); ?>/css/all.css" />
	<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/js/cufon.js"></script>
	<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/js/cufon-fonts.js"></script>
	<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/js/cufon-settings.js"></script>
	<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/js/main.js"></script>
    <!--[if lt IE 8]><link type="text/css" rel="stylesheet" href="<?php echo get_template_directory_uri(); ?>/css/ie.css" /><![endif]-->

	<!-- Shadow Box -->
	<link rel="stylesheet" type="text/css" href="<?php echo get_template_directory_uri(); ?>/shadowbox/shadowbox.css">
	<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/shadowbox/shadowbox.js"></script>
	<script type="text/javascript">
	Shadowbox.init({
		modal: true
	});
	</script>

	<script type="text/javascript">

	<?php
		if($roadmapCurrentPage->post_name == "home"){
			echo 'com.roadmap.promoIds=[';
			for($i = 0;++$i<$slidesLen;){
				$slide = $slides[$i];
				echo $slide->vimeo_id[0];
				if($i != $slidesLen-1) echo ",";
			}
			echo '];';
		}
	?>

	<?php
		if($roadmapCurrentPage->post_name == "home"){
			global $quotes;
			global $quotesLen;
			echo 'com.roadmap.testimonials.content=[';
			for($i = -1;++$i<$quotesLen;){
				$quote = $quotes[$i];
				echo '{quote:"'.$quote->post_content.'"';
				if($quote->client != null)
					echo ', client:"'.$quote->client[0].'"';
				if($quote->company != null)
					echo ', company:"'.$quote->company[0].'"';
				echo '}';
				if($i != $quotesLen-1) echo ",";
			}
			echo '];';
		}
	?>

	$(document).ready(function(){
	<?php
		if($roadmapCurrentPage->post_name == "home"){
			echo "initTestimonials();";
		}
	?>
	});

	</script>
	<?php
		if(strpos(site_url(), "localhost") == false){
		echo "<script type='text/javascript'>";
		echo "var _gaq = _gaq || [];";
		echo "_gaq.push(['_setAccount', 'UA-18204526-1']);";
		echo "_gaq.push(['_trackPageview']);";

		echo "(function() {";
		echo "var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;";
		echo "ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';";
		echo "var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);";
		echo "})();";
		echo "</script>";
		};
	?>
</head>
<script type="text/javascript">
  var uvOptions = {};
  (function() {
    var uv = document.createElement('script'); uv.type = 'text/javascript'; uv.async = true;
    uv.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'widget.uservoice.com/FDdeP01ip0d7BdWFABYZWw.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(uv, s);
  })();
</script>
<body class="inner-road">

<?php
	get_header();
	//echo $childrenLen.', '.$parentID;
	global $roadmapCurrentPage;
	if($roadmapCurrentPage->post_name == "home"){
		get_template_part("rmpage", $roadmapCurrentPage->post_name);
	} elseif($roadmapCurrentPage->post_name == "plans-pricing") {
		get_template_part("rmpage", "subpageWide");
	} else {
		get_template_part("rmpage", "subpage");
	}
	get_footer();
	get_template_part("home","popup");
	get_template_part("popup");
?>

</body>
</html>