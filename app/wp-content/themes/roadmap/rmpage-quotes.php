<?php
	global $quotes;
	global $quotesLen;
?>
<!--<ul class="list">-->
<?php
	for($i = -1;++$i < $quotesLen;){
		$item = $quotes[$i];
		//echo '<li>';
		echo '<p>"'.$item->post_content.'"<br/>';
		if($item->client != null)
			echo '- <strong>'.$item->client[0].'</strong>';
		if($item->company != null)
			echo ', <em>'.$item->company[0].'</em>';
		echo '</p>';
		//echo '</li>';
	}
?>
<!--</ul>-->
