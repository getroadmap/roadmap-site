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
<!-- main -->
<div id="main">
	<div class="main-wide-holder">
		<!-- breadcrumbs -->
		<ul class="breadcrumbs">
			<?php
				echo '<li><a href="'.get_home_url().'">Home</a>/</li>';
				if($parentID != 0){
					$parentPage = get_page($parentID);
					$parentName = $parentPage->post_name;
					$parentTitle = $parentPage->post_title;
					echo '<li><a href="'.site_url().'/'.$parentName.'">'.$parentTitle.'</a>/</li>';
				}
				echo '<li>'.$roadmapCurrentPage->post_title.'</li>';
			?>
		</ul>
		<?php
			if($roadmapCurrentPage->suppress_title[0]!="true"){
				echo '<h1>'.$roadmapCurrentPage->post_title.'</h1><br/>';
			}
			
			if($roadmapCurrentPage->post_name == "quotes"){
				get_template_part("rmpage", "quotes");
			} else if($roadmapCurrentPage->post_name == "news"){
				get_template_part("rmpage", "news");
			} else if($roadmapCurrentPage->post_name == "contact"){
				//get_template_part("rmpage", "contact");
				$filtered_content = apply_filters('the_content', $roadmapCurrentPage->post_content);
				echo $filtered_content;
			} else {
				echo $roadmapCurrentPage->post_content;
			}
		?>
	</div>
</div>