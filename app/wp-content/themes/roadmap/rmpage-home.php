<?php
	global $accountRegisterURL;
	global $loginURL;
	global $slides;
	global $slidesLen;
	global $newFeature1;
	global $newFeature2;
	global $featuredStory;
?>
<!-- gallery-holder -->
<div class="gallery-holder">
	<div class="circle-gallery">
		<a href="#" class="prev">prev</a>
		<a href="#" class="next">next</a>
		<div class="mask">&nbsp;</div>
		<div class="mask right">&nbsp;</div>
		<div class="slide-home">
			<ul class="slide">
				<li>
					<div class="slide-holder">
						<div class="video first">
							<a href="#popup2" class="link-popup"><img src="<?php echo get_template_directory_uri(); ?>/images/img01.jpg" alt="Image description" width="511" height="284" /></a>
						</div>
						<div class="info">
							<h1>Resource forecasting<br>Project intelligence<br>Billable rates<br>Gantt charts</h1>
							<p>- Daily agenda tools to keep your team on track<br>- Custom dashboards to keep everyone in the loop<br>- Export invoice data to Excel or Quickbooks (via Zapier)</p>
							<ul class="holder-buttons">
								<li>
									<a data-scout-event="signup, trial, 'trial homepage signup'" href="https://app.ppmroadmap.com/AccountRegistration.aspx?utm_source=Marketing+Website&utm_medium=slideshow&utm_campaign=analytics" class="txt-try">Try Roadmap for Free</a>
									<span>No credit card required</span>
								</li>
								<li><a href="#popup2" class="txt-watch link-popup">Watch a Demo</a></li>
							</ul>
						</div>
					</div>
				</li>
				<li>
					<div class="slide-holder">
						<div class="video">
							<a href="#popup3" class="link-popup"><img src="<?php echo get_template_directory_uri(); ?>/images/img02.jpg" alt="Image description" width="593" height="324" /></a>
						</div>
						<div class="info">
							<h1>Billable Rates</h1>
							<p>Combining billable rates with planned and actual time allows you to monitor projects in financial terms.  Adjust project budgets using fixed costs or discount / premium rates.</p>
							<ul class="holder-buttons">
								<li>
									<a href="https://app.ppmroadmap.com/AccountRegistration.aspx?utm_source=Marketing+Website&utm_medium=slideshow&utm_campaign=visualize" class="txt-try">Try Roadmap for Free</a>
								</li>
							</ul>
						</div>
					</div>
				</li>
				<li>
					<div class="slide-holder">
						<div class="video">
							<a href="#popup4" class="link-popup"><img src="<?php echo get_template_directory_uri(); ?>/images/img03.jpg" alt="Image description" width="593" height="324" /></a>
						</div>
						<div class="info">
							<h1>Align Strategy</h1>
							<p>Easily create custom fields and reports to map to your business.  Export reports to Excel.</p>
							<ul class="holder-buttons">
								<li>
									<a href="https://app.ppmroadmap.com/AccountRegistration.aspx?utm_source=Marketing+Website&utm_medium=slideshow&utm_campaign=align" class="txt-try">Try Roadmap for Free</a>
								</li>
							</ul>
						</div>
					</div>
				</li>
				<li>
					<div class="slide-holder">
						<div class="video">
							<a href="#popup5" class="link-popup"><img src="<?php echo get_template_directory_uri(); ?>/images/img04.jpg" alt="Image description" width="593" height="324" /></a>
						</div>
						<div class="info">
							<h1>Forecast Resources</h1>
							<p>Forecast by resource to estimate workloads.  Search by availability -- by resource or role -- when assigning new work items.</p>
							<ul class="holder-buttons">
								<li>
									<a href="https://app.ppmroadmap.com/AccountRegistration.aspx?utm_source=Marketing+Website&utm_medium=slideshow&utm_campaign=forecast" class="txt-try">Try Roadmap for Free</a>
								</li>
							</ul>
						</div>
					</div>
				</li>
				<li>
					<div class="slide-holder">
						<div class="video">
							<a href="#popup6" class="link-popup"><img src="<?php echo get_template_directory_uri(); ?>/images/img05.jpg" alt="Image description" width="593" height="324" /></a>
						</div>
						<div class="info">
							<h1>Manage Risk</h1>
							<p>Increase transparency and reduce surprises by having the project health for all projects in one place, with easy-to-read color indicators.</p>
							<ul class="holder-buttons">
								<li>
									<a href="https://app.ppmroadmap.com/AccountRegistration.aspx?utm_source=Marketing+Website&utm_medium=slideshow&utm_campaign=manage" class="txt-try">Try Roadmap for Free</a>
								</li>
							</ul>
						</div>
					</div>
				</li>
			</ul>
			<div class="switch">
				<ul>
					<li class="active"><a href="#">&bull;</a></li>
					<li><a href="#">&bull;</a></li>
					<li><a href="#">&bull;</a></li>
					<li><a href="#">&bull;</a></li>
					<li><a href="#">&bull;</a></li>
				</ul>
			</div>
		</div>
	</div>
	<!-- ad -->
	<div class="ad-container">
		<div class="ad">
			<p><strong>Simple. Flexible. Affordable.</strong> With pay-as-you-go plans starting at only $25/month:</p>
	
			<ul class="actions">
				<li><a href="plans-pricing">See plans &amp; pricing options</a></li>
			</ul>
		</div>
	</div>
	<!-- ad bg -->
	<div id="adbg1">&nbsp;</div>
</div>


<div id="home-main-wrapper">
	<!-- main -->
	<div id="main">
		<!-- container -->
		<div class="container">
			<!-- content -->
			<div id="content">
				<!-- featured -->
				<div class="featured">
					<div class="featured-holder">
						<div class="featured-frame">
						
							<!-- block -->
							<div class="block">
								<div class="image"><!-- <a href="<?php echo getVideoJS($newFeature1); ?>"><img src="<?php echo $newFeature1->image_url[0] ?>" alt="image description" width="65" height="72" /></a> --></div>
								<div class="text-holder">
									<span class="new">Take Basecamp Further</span>
									<a href="<?php echo getVideoJS($newFeature1); ?>"><h3><?php echo $newFeature1->post_title ?></h3></a>
									<p><?php echo $newFeature1->post_content ?></p>
									<!-- <div class="btn-holder">
										<a href="<?php echo getVideoJS($newFeature1); ?>" class="button"><span class="l">Watch a Demo</span><span class="r">&nbsp;</span></a>
										<em class="time"><?php echo $newFeature1->video_duration[0] ?></em>
									</div> -->
								</div>
							</div>
							
							<!-- block -->
							<div class="block">
								<div class="image"><!-- <a href="<?php echo getVideoJS($newFeature2); ?>"><img src="<?php echo $newFeature2->image_url[0] ?>" alt="image description" width="64" height="65" /></a> --></div>
								<div class="text-holder">
									<span class="new">New Feature</span>
									<a href="<?php echo getVideoJS($newFeature2); ?>"><h3><?php echo $newFeature2->post_title ?></h3></a>
									<p><?php echo $newFeature2->post_content ?></p>
									<!-- <div class="btn-holder">
										<a href="<?php echo getVideoJS($newFeature2); ?>" class="button"><span class="l">Watch a Demo</span><span class="r">&nbsp;</span></a>
										<em class="time"><?php echo $newFeature2->video_duration[0] ?></em>
									</div> -->
								</div>
							</div>
							
						</div>
					</div>
				</div>
				
				<!-- testimonials -->
				<div class="testimonials">
					<blockquote cite="">
						<div>
							<q id="testimonialQuote">Every time I meet with my Board of Directors or potential investors, <strong>I bring only one handout — the PPMLite Gantt chart."</strong></q>
							<cite id="testimonialInfo">– <strong>Regina Flanagan</strong>, Executive Director, <em>The Fit For Life Fund</em></cite>
						</div>
					</blockquote>
					<ul class="buttons">
						<li class="btn-prev"><a href="javascript:previousTestimonial();">Prev</a></li>
						<li class="btn-next"><a href="javascript:nextTestimonial(true);">Next</a></li>
					</ul>
				</div>
				
				<!-- post -->
				<div class="post">
					<div class="image"><a href="<?php echo site_url().'/'.get_page_uri($featuredStory->ID); ?>"><img src="<?php echo $featuredStory->image_url[0]; ?>" alt="image description" /></a></div>
					<div class="text-holder">
						<h3>Featured Success Story</h3>
						<p><?php echo $featuredStory->content_excerpt[0]; ?></p>
						<div class="btn-holder">
							<a href="<?php echo site_url().'/'.get_page_uri($featuredStory->ID); ?>" class="button"><span class="l">See the solution</span><span class="r">&nbsp;</span></a>
							<span class="note">or <a href="<?php echo $accountRegisterURL; ?>">Sign up for the 30 day free trial</a></span>
						</div>
					</div>
				</div>
			</div>
			
			<!-- sidebar -->
			<div id="sidebar">
				
				<!-- box -->
				<div class="box">
					<div class="box-holder">
						<div class="heading">
							<h4>What’s New?</h4>
							<a href="<?php echo get_category_feed_link(get_cat_ID("news")); ?>" class="rss"><span>rss</span></a>
						</div>
						<!-- news -->
						<ul class="news">
						<?php
							$news = getNews(false);
							$newsLength = sizeof($news);
							for($i = -1;++$i < $newsLength;){
								$item = $news[$i];
								list($date, $time) = explode(" ", $item->post_date);
								list($year, $month, $day) = explode("-", $date);
								$dateStr = date("M j, Y", mktime(0, 0, 0, floor($month), floor($day), floor($year)));
								echo '<li>';
								echo '<p>'.$item->post_content.'</p>';
								echo '<em class="date">'.$dateStr.'</em>';
								echo '</li>';
							}
						?>
						</ul>
						<span class="more"><a href="<?php echo site_url().'/'; ?>buzz">Show more</a></span>
					</div>
				</div>
				
			</div>
		</div>
	</div>
</div>