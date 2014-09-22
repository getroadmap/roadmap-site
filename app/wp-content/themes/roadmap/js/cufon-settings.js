(function($) {
	$.fn.simplebox = function(options) { 
		return new Simplebox(this, options); 
	};
	
	function Simplebox(context, options) { this.init(context, options); };
	
	Simplebox.prototype = {
		options:{},
		init: function (context, options){
			this.options = $.extend({
				duration: 300,
				linkClose: 'a.close, a.btn-close',
				divFader: 'fader',
				faderColor: 'black',
				opacity: 0.7,
				wrapper: '#wrapper',
				linkPopap: '.link-submit'
			}, options || {});
			this.btn = $(context);
			this.select = $(this.options.wrapper).find('select');
			this.initFader();
			this.btnEvent(this, this.btn);
		},
		btnEvent: function($this, el){
			el.click(function(){
				if (this.hash) $this.toPrepare(this.hash);
					else $this.toPrepare($(this).attr('title'));
				return false;
			});
		},
		calcWinWidth: function(){
			this.winWidth = $('body').width();
			if ($(this.options.wrapper).width() > this.winWidth) this.winWidth = $(this.options.wrapper).width();
		},
		toPrepare: function(obj){
			// added by Anton, to re-init popups for 2nd time
			Cufon.refresh();
			
			this.popup = $(obj);
			this.btnClose = this.popup.find(this.options.linkClose);
			this.submitBtn = this.popup.find(this.options.linkPopap);
			
			if ($.browser.msie) this.select.css({visibility: 'hidden'});
			this.calcWinWidth();
			this.winHeight = $(window).height();
			this.winScroll = $(window).scrollTop();
			
			this.popupTop = this.winScroll + (this.winHeight/2) - this.popup.outerHeight(true)/2;
			if (this.popupTop < 0) this.popupTop = 0;
			this.faderHeight = $(this.options.wrapper).outerHeight();
			if ($(window).height() > this.faderHeight) this.faderHeight = $(window).height();
			
			// outerWidth changed to false by Anton for IE9 compatibility
			this.popup.css({
				top: this.popupTop,
				left: this.winWidth/2 - this.popup.outerWidth(false)/2
			}).hide();
			this.fader.css({
				width: this.winWidth,
				height: this.faderHeight
			});
			this.initAnimate(this);
			this.initCloseEvent(this, this.btnClose, true);
			this.initCloseEvent(this, this.submitBtn, false);
			this.initCloseEvent(this, this.fader, true);
		},
		initCloseEvent: function($this, el, flag){
			el.click(function(){
				$this.popup.hide(function(){
					$this.popup.html($this.popup.html());
				});
				$this.popup.css({left: '-9999px'}).show();
				if ($.browser.msie) $this.select.css({visibility: 'visible'});
				$this.submitBtn.unbind('click');
				$this.fader.unbind('click');
				$this.btnClose.unbind('click');
				$(window).unbind('resize');
				if (flag) $this.fader.fadeOut($this.options.duration);
				else {
					if ($this.submitBtn.attr('href')) $this.toPrepare($this.submitBtn.attr('href'));
					else $this.toPrepare($this.submitBtn.attr('title'));
				}
				return false;
			});
		},
		initAnimate:function ($this){
			$this.fader.fadeIn($this.options.duration);
			$this.popup.show();
			$(window).resize(function(){
				$this.calcWinWidth();
				$this.popup.animate({
					left: $this.winWidth/2 - $this.popup.outerWidth(true)/2
				}, {queue:false, duration: $this.options.duration});
				$this.fader.css({width: $this.winWidth});
			});
		},
		initFader: function(){
			if ($('div.'+this.options.divFader).length > 0) this.fader = $('div.'+this.options.divFader);
			else{
				this.fader = $('<div class="'+this.options.divFader+'"></div>');
				$('body').append(this.fader);
				this.fader.css({
					position: 'absolute',
					zIndex: 111,
					left:0,
					top:0,
					background: this.options.faderColor,
					opacity: this.options.opacity
				}).hide();
			}
		}
	}
}(jQuery));

function initCufon() {
	Cufon.replace('.promo .aside h2, .promo .heading h1, #content h1, .webinars-block h4,.inner-road .popup h5, .info h1', { fontFamily: 'AvenirLTStd-Book'});
	Cufon.replace('.promo .heading h1 strong', { fontFamily: 'AvenirLTStd-Medium'});
	Cufon.replace('.promo .box .title,.inner-road .container #sidebar .box .heading h4, .promo .box .title-hov, .featured h3, .plans-block h1', { fontFamily: 'AvenirLTStd-Roman'});
	Cufon.replace('.plans h2', { fontFamily: 'AvenirLTStd-Black'});
	Cufon.replace('.plans .price', { fontFamily: 'AvenirLTStd-Light'});
	Cufon.replace('.about .article h3, .holder-buttons li a, .popup .txt-try', { fontFamily: 'AvenirLTStd-Heavy'});
}
// gallery init
function initCycleGallery() {
	// settings
	var _autoSlide = false;
	var _activeClass = 'active';
	var _switchTime = 5000;
	var _speed = 650;

	$('div.circle-gallery').each(function(){
		// gallery options
		var _holder = $(this);
		var _btnPrev = _holder.find('a.prev');
		var _btnNext = _holder.find('a.next');
		var _slidesHolder = _holder.find('div.slide-home');
		var _slider = _slidesHolder.find('ul.slide');
		var _slides = _slider.children();
		var _slidesCount = _slides.length;
		var _slideWidth = _slides.eq(0).outerWidth(true);
		var _visibleCount = Math.round(_slidesHolder.width() / _slideWidth);
		var _currentIndex = 0;
		var _sumWidth = _slidesCount*_slideWidth;
		var switcher=_holder.find('div.switch');
		var _animating = false;
		var _timer;

		// gallery init
		var winW=$(window).width();
		_holder.css({marginLeft:(winW-_slideWidth)/2});
		$(window).resize(function(){
			winW=$('body').width();
			_holder.css({marginLeft:(winW-_slideWidth)/2});
		})
		_slider.append(_slides.clone()).append(_slides.clone());
		_slider.css({marginLeft:-_sumWidth});

		//gallery control
		_btnPrev.click(function(){
			prevSlide();
			return false;
		});
		_btnNext.click(function(){
			nextSlide();
			return false;
		});
		// gallery animation
		function prevSlide() {
			if(_animating) return;
			_currentIndex--;
			switchSlide();
		}
		function nextSlide() {
			if(_animating) return;
			_currentIndex++;
			switchSlide();
		}
		// Switcher
		function elNum(){
			if (switcher) {
				var switcherEl='';
				var num=1;
				var difference=1;
				while (difference <= _slides.length){
					switcherEl+='<li><a href="">'+ num + '</a></li>';
					num++;
					difference++;
				}
				switcher.html('<ul>'+ switcherEl+'</ul>');
				if(_currentIndex!=-1) {
					switcher.find('a').eq(_currentIndex).addClass('active')
				}
			}
			var link=switcher.find('a');
			link.click(function(){
				if(_currentIndex != link.index(jQuery(this))) {
					_currentIndex=link.index(jQuery(this));
					switchSlide();
				}
				if( _timer!=-1 ) clearTimeout(_timer)
				return false;
			});
			switcher.hover(
				function(){
					if( _timer!=-1 ) clearTimeout(_timer)
				},
				function(){
					clearTimeout(_timer);
					autoSlide()
				}
			)
		}
		elNum();
		function switchSlide() {
			_animating = true;
			_slider.animate({marginLeft:-_sumWidth-_currentIndex*_slideWidth},{duration:_speed, queue:false,complete:function(){
				if(_currentIndex == _slidesCount || _currentIndex == -_slidesCount ) {
					_currentIndex = 0;
					_slider.css({marginLeft:-_sumWidth});
				}
				if(_currentIndex == -1  ) {
					_currentIndex=_slidesCount+_currentIndex;
					_slider.css({marginLeft:-_sumWidth-_currentIndex*_slideWidth});
				}
				_animating = false;
				switcher.find('a').removeClass('active').eq(_currentIndex).addClass('active');
			}});
			autoSlide();
		}
		function autoSlide() {
			if(!_autoSlide) return;
			if(_timer) clearTimeout(_timer);
			_timer = setTimeout(prevSlide,_switchTime);
		}
		autoSlide();
	});
}
$(document).ready(function(){
	initCufon();
	initCycleGallery();
	$('a.link-popup').simplebox({
	
		linkClose: 'span.btn-close'
	});
});


$(function(){

	var hoverClass = 'active';
	$('div.plans').each(function(){
		var _holder = $(this);
		var _items = _holder.find('div.block');
		var _origBox = _items.filter('.'+hoverClass);
		_items.mouseenter(function(){
			_items.removeClass(hoverClass);
			$(this).addClass(hoverClass);
		})
	});
});