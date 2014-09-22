<?php

load_theme_textdomain( 'your-theme', TEMPLATEPATH . '/languages' );
$locale = get_locale();
$locale_file = TEMPLATEPATH . "/languages/$locale.php";

if ( is_readable($locale_file) )
        require_once($locale_file);

/**
 * Road Map Code
 */

//page globals
global $roadmapPages;
global $roadmapPagesLength;
global $roadmapCurrentPage;

//home page globals
global $slides;
global $slidesLen;
global $quotes;
global $quotesLen;
global $newFeature1;
global $newFeature2;

//buzz page globals
global $featuredStory;

//links (pull from wp)
global $accountRegisterURL;
global $loginURL;

//subpage globals
global $parentID;
global $children;
global $childrenLen;
global $news;
global $newsLength;

$accountRegisterURL = "http://app.ppmroadmap.com/AccountRegistration.aspx";
$loginURL = "https://app.ppmroadmap.com/secure/Login.aspx";

function gotoPage($pagId){
	$path = get_page_uri($pagId);
	header('Location: '.site_url().'/'.$path);
}

function getVideoJS($o){
	return getJSCall("openPopupVideo", $o->vimeo_id[0], $o->video_title[0], $o->video_duration[0]);
}

function getJSCall($call, $id, $title, $duration){
	$s = "javascript:".$call."(".$id.",'".$title."','".$duration."');";
	return $s;
}

function initSiteData(){
	global $roadmapPages;
	global $roadmapPagesLength;
	global $roadmapCurrentPage;
	
	$roadmapPages = get_pages(array('sort_column' => 'menu_order'));
	$roadmapPagesLength = sizeof($roadmapPages);
	
	if(!is_singular()){
		for($i = -1;++$i<$roadmapPagesLength;){
			if($roadmapPages[$i]->post_name == "home"){
				$roadmapCurrentPage = $roadmapPages[$i];
				break;
			}
		}
	} else {
		for($i = -1;++$i<$roadmapPagesLength;){
			if(is_page($roadmapPages[$i]->ID)){
				$roadmapCurrentPage = $roadmapPages[$i];
				break;
			}
		}
	}
	for($j = -1;++$j<$roadmapPagesLength;){
		addMetaData($roadmapPages[$j]);
	}
}

function addMetaData($target){
	$custom_fields = get_post_custom($target->ID);
	foreach ($custom_fields as $key => $value){
		$target->$key = $value;
	}
	return $target;
}

function getPostByRMID($roadmap_id){
	global $wpdb;
	$querystr = "
		SELECT * FROM $wpdb->posts
		LEFT JOIN $wpdb->postmeta ON($wpdb->posts.ID = $wpdb->postmeta.post_id)
		WHERE $wpdb->posts.post_status = 'publish'
		AND $wpdb->postmeta.meta_key = 'roadmap_id'
		AND $wpdb->postmeta.meta_value = '".$roadmap_id."'
	";
	$result = $wpdb->get_results($querystr, OBJECT);
	return addMetaData($result[0]);
}

function getNews($all){
	$result = get_posts('orderby=date&category_name=news'.($all?'':'&numberposts=5'));
	$resultLen = sizeof($result);
	for($i = -1;++$i<$resultLen;)
		addMetaData($result[$i]);
	return $result;
}

function getOrderedPostsByCategory($category_name){
	global $wpdb;
	$querystr = "
		SELECT * FROM $wpdb->posts
		LEFT JOIN $wpdb->postmeta ON($wpdb->posts.ID = $wpdb->postmeta.post_id)
		LEFT JOIN $wpdb->term_relationships ON($wpdb->posts.ID = $wpdb->term_relationships.object_id)
		LEFT JOIN $wpdb->term_taxonomy ON($wpdb->term_relationships.term_taxonomy_id = $wpdb->term_taxonomy.term_taxonomy_id)
		LEFT JOIN $wpdb->terms ON($wpdb->terms.term_id = $wpdb->term_taxonomy.term_id)
		WHERE $wpdb->terms.name = '".$category_name."'
		AND $wpdb->term_taxonomy.taxonomy = 'category'
		AND $wpdb->posts.post_status = 'publish'
		AND $wpdb->posts.post_type = 'post'
		AND $wpdb->postmeta.meta_key = 'order'
		ORDER BY $wpdb->postmeta.meta_value ASC
	";
	$result = $wpdb->get_results($querystr, OBJECT);
	$resultLen = sizeof($result);
	for($i = -1;++$i<$resultLen;)
		addMetaData($result[$i]);
	sortByOrder(&$result);
	return $result;
}

function initPageData(){
	global $roadmapCurrentPage;
	global $slides;
	global $slidesLen;
	global $quotes;
	global $quotesLen;
	global $newFeature1;
	global $newFeature2;
	global $featuredStory;
	global $parentID;
	global $children;
	global $childrenLen;
	
	// Anton: moved from condition below, needed on all pages
	$newFeature1 = getPostByRMID("new_feature_1");
	
	if($roadmapCurrentPage->post_name == "home"){
		//$newFeature1 = getPostByRMID("new_feature_1");
		$newFeature2 = getPostByRMID("new_feature_2");
		$slides = getOrderedPostsByCategory("slides");
		$slidesLen = sizeof($slides);
		$quotes = getOrderedPostsByCategory("quotes");
		$quotesLen = sizeof($quotes);
		$featuredStory = getPostByRMID("featured_story");
	} else {
		$parentID = $roadmapCurrentPage->post_parent;
		if($parentID == 0){
			$subpageRootID = $roadmapCurrentPage->ID;
		} else {
			$subpageRootID = $parentID;
		}
		$children = get_pages(array('sort_column' => 'menu_order', 'child_of' => $subpageRootID));
		$childrenLen = sizeof($children);
	}
	
	if($childrenLen > 0 && $parentID == 0){
		gotoPage($children[0]->ID);
		exit;
	}
	
}

function initRoadMapData(){
	initSiteData();
	initPageData();
}

add_action('pre_get_posts', 'initRoadMapData');

function initMoreData(){
	global $roadmapCurrentPage;
	global $quotes;
	global $quotesLen;
	global $news;
	global $newsLength;
	if($roadmapCurrentPage->post_name == "quotes"){
		$quotes = getOrderedPostsByCategory("quotes");
		$quotesLen = sizeof($quotes);
	}
	if($roadmapCurrentPage->post_name == "news"){
		$news = getNews(true);
		$newsLength = sizeof($news);
	}
}

function orderComparator($a, $b){
	if($a->order[0] == $b->order[0]) return 0;
	if($a->order[0] < $b->order[0]) return -1;
	else return 1;
}

function sortByOrder(&$a){
	$len = sizeof($a);
	for($i = -1;++$i<$len;){
		$a[$i]->order[0] = intval($a[$i]->order[0]);
	}
	usort($a, orderComparator);
	//error_log("usort success? ".usort($a, orderComparator));
	//for($i = -1;++$i<$len;) error_log($i.", ".$a[$i]->post_title.", ".$a[$i]->order[0].", ".(is_int($a[$i]->order[0])? "":"not")." int");
	
}


add_action('wp_head', 'initMoreData');