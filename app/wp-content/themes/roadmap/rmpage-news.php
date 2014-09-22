<?php
	global $news;
	global $newsLength;
?>
<!--<ul class="list">-->
<?php
	for($i = -1;++$i < $newsLength;){
		$item = $news[$i];
		list($date, $time) = explode(" ", $item->post_date);
		list($year, $month, $day) = explode("-", $date);
		$dateStr = date("M j, Y", mktime(0, 0, 0, floor($month), floor($day), floor($year)));
		//echo '<li>';
		echo '<p><strong>'.$item->post_content.'</strong><br/>';
		echo '<em class="date">'.$dateStr.'</em></p>';
		//echo '</li>';
	}
?>
<!--</ul>-->