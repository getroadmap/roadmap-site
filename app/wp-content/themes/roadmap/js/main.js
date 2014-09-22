com = {roadmap:{
	promoIndex: 0
}};

/**
 * Video Popup Functions
 */

function embedVimeo(element, id, width, height){
	var str = "<object width='"+width+"' height='"+height+"'>" +
		"<param name='allowfullscreen' value='true' />" +
		"<param name='allowscriptaccess' value='always' />" +
		"<param name='movie' value='http://vimeo.com/moogaloop.swf?clip_id="+id+"&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=1&amp;color=&amp;fullscreen=1&amp;autoplay=0&amp;loop=0' />" +
		"<embed src='http://vimeo.com/moogaloop.swf?clip_id="+id+"&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=1&amp;color=&amp;fullscreen=1&amp;autoplay=0&amp;loop=0' type='application/x-shockwave-flash' allowfullscreen='true' allowscriptaccess='always' width='"+width+"' height='"+height+"'/>" +
		"</object>";
	document.getElementById(element).innerHTML = str;
}

function setPopupTitleAndTime(title, duration){
	document.getElementById("popupVideoTitle").innerHTML = title;
	document.getElementById("popupVideoDuration").innerHTML = duration;
}

function closePopupVideo(){
	document.getElementById("videoPopupHolder").innerHTML = "";
	document.getElementById("vimeoPopupContainer").style.display = "none";
	document.getElementById("vimeoPopupBG").style.display = "none";
}

//openPopupVideo(6045312, "something", 3:30");
function openPopupVideo(id, title, duration){
	if(com.roadmap.promoIndex > 0){
		setPromoSlide(0);
	}
	document.getElementById("vimeoPopupContainer").style.display = "block";
	document.getElementById("vimeoPopupBG").style.display = "block";
	embedVimeo("videoPopupHolder", id, 450, 250);
	setPopupTitleAndTime(title, duration);
}

/**
 * Promo functions
 */

function getPromoSlide(promoIndex){
	return document.getElementById("promoSlide0"+promoIndex);
}

function getPromoSlideVideoHolder(promoIndex){
	return document.getElementById("promoSlideVideoHolder0"+promoIndex);
}

function hideAll(exceptPromoIndex){
	for(var i = -1;++i<5;){
		if(exceptPromoIndex != i){
			getPromoSlide(i).style.display = "none";
		}
	}
}

function show(slideIndex){
	getPromoSlide(slideIndex).style.display = "block";
}

function setPromoVideo(promoIndex, vimeoID){
	embedVimeo("promoSlideVideoHolder0"+promoIndex, vimeoID, 450, 250);
}

function clearPromoVideo(promoIndex){
	getPromoSlideVideoHolder(promoIndex).innerHTML = "";
}

function setPromoSlide(promoIndex){
	hideAll(promoIndex);
	show(promoIndex);
	
	document.getElementById("promoSwitchItem"+com.roadmap.promoIndex).className = "";
	document.getElementById("promoSwitchItem"+promoIndex).className = "active";
	
	if(com.roadmap.promoIndex != 0){
		clearPromoVideo(com.roadmap.promoIndex);
	}
	if(promoIndex != 0){
		setPromoVideo(promoIndex, com.roadmap.promoIds[promoIndex-1]);
	}
	com.roadmap.promoIndex = promoIndex;
}

function nextPromoSlide(){
	if(com.roadmap.promoIndex == 4){
		setPromoSlide(1);
	} else {
		setPromoSlide(com.roadmap.promoIndex+1);
	}
}

function previousPromoSlide(){
	if(com.roadmap.promoIndex == 1 || com.roadmap.promoIndex == 0){
		setPromoSlide(4);
	} else {
		setPromoSlide(com.roadmap.promoIndex-1);
	}
}

/**
 * Testimonials
 */
com.roadmap.testimonials = {
	intervalID: -1
	, rotateSpeed: 5000
	, index: 0
	, content: [{quote:"Some sample quote.", client:"Jessica", company:"ABC Company"}]
};

function initTestimonials(){
	resetInterval();
	loadTestimonial(0);
}

function resetInterval(){
	if(com.roadmap.testimonials.intervalID != -1){
		window.clearInterval(com.roadmap.testimonials.intervalID);
		com.roadmap.testimonials.intervalID = -1;
	}
	com.roadmap.testimonials.intervalID = window.setInterval("rotateTestimonials()", com.roadmap.testimonials.rotateSpeed);
}

function rotateTestimonials(){
	nextTestimonial(false);
}

function nextTestimonial(reset){
	if(com.roadmap.testimonials.index == com.roadmap.testimonials.content.length-1){
		loadTestimonial(0);
	} else {
		loadTestimonial(com.roadmap.testimonials.index+1);
	}
	if(reset)
		resetInterval();
}

function previousTestimonial(){
	if(com.roadmap.testimonials.index == 0){
		loadTestimonial(com.roadmap.testimonials.content.length-1);
	} else {
		loadTestimonial(com.roadmap.testimonials.index-1);
	}
	resetInterval();
}

function loadTestimonial(index){
	var content = com.roadmap.testimonials.content[index];
	var info = "- <strong>"+content.client+"</strong>";
	if(content.company != null)
		info += ", <em>"+content.company+"</em>";
	
	document.getElementById("testimonialQuote").innerHTML = content.quote+'"';
	document.getElementById("testimonialInfo").innerHTML = info; //� <strong>Regina Flanagan</strong>, Executive Director, <em>The Fit For Life Fund</em>
	com.roadmap.testimonials.index = index;
}


/**
 * Compatibility
 */
 
/* ie hover */
eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('9 u=k(){9 g=/^([^#.>`]*)(#|\\.|\\>|\\`)(.+)$/;k u(a,b){9 c=a.J(/\\s*\\,\\s*/);9 d=[];n(9 i=0;i<c.l;i++){d=d.v(o(c[i],b))};6 d};k o(a,b,c){a=a.z(" ","`");9 d=a.r(g);9 e,5,m,7,i,h;9 f=[];4(d==8){d=[a,a]};4(d[1]==""){d[1]="*"};4(c==8){c="`"};4(b==8){b=E};K(d[2]){w"#":7=d[3].r(g);4(7==8){7=[8,d[3]]};e=E.L(7[1]);4(e==8||(d[1]!="*"&&!x(e,d[1]))){6 f};4(7.l==2){f.A(e);6 f};6 o(7[3],e,7[2]);w".":4(c!=">"){5=p(b,d[1])}y{5=b.B};n(i=0,h=5.l;i<h;i++){e=5[i];4(e.C!=1){q};7=d[3].r(g);4(7!=8){4(e.j==8||e.j.r("(\\\\s|^)"+7[1]+"(\\\\s|$)")==8){q};m=o(7[3],e,7[2]);f=f.v(m)}y 4(e.j!=8&&e.j.r("(\\\\s|^)"+d[3]+"(\\\\s|$)")!=8){f.A(e)}};6 f;w">":4(c!=">"){5=p(b,d[1])}y{5=b.B};n(i=0,h=5.l;i<h;i++){e=5[i];4(e.C!=1){q};4(!x(e,d[1])){q};m=o(d[3],e,">");f=f.v(m)};6 f;w"`":5=p(b,d[1]);n(i=0,h=5.l;i<h;i++){e=5[i];m=o(d[3],e,"`");f=f.v(m)};6 f;M:4(c!=">"){5=p(b,d[1])}y{5=b.B};n(i=0,h=5.l;i<h;i++){e=5[i];4(e.C!=1){q};4(!x(e,d[1])){q};f.A(e)};6 f}};k p(a,b){4(b=="*"&&a.F!=8){6 a.F};6 a.p(b)};k x(a,b){4(b=="*"){6 N};6 a.O.G().z("P:","")==b.G()};6 u}();k Q(a,b){9 c=u(a);n(9 i=0;i<c.l;i++){c[i].R=k(){4(t.j.H(b)==-1){t.j+=" "+b}};c[i].S=k(){4(t.j.H(b)!=-1){t.j=t.j.z(b,"")}}}}4(D.I&&!D.T){D.I("U",V)}',58,58,'||||if|listNodes|return|subselector|null|var||||||||limit||className|function|length|listSubNodes|for|doParse|getElementsByTagName|continue|match||this|parseSelector|concat|case|matchNodeNames|else|replace|push|childNodes|nodeType|window|document|all|toLowerCase|indexOf|attachEvent|split|switch|getElementById|default|true|nodeName|html|hoverForIE6|onmouseover|onmouseout|opera|onload|ieHover'.split('|'),0,{}))
/*parametrs [selector, hover_class]*/
function ieHover() {
	hoverForIE6(".promo .section .box, .newsletter .submit, .plans .block", "hover");
}
/* hide form text */
function hideFormText() {
	var _inputs = document.getElementsByTagName('input');
	var _txt = document.getElementsByTagName('textarea');
	var _value = [];
	
	if (_inputs) {
		for(var i=0; i<_inputs.length; i++) {
			if (_inputs[i].type == 'text' || _inputs[i].type == 'password') {
				
				_inputs[i].index = i;
				_value[i] = _inputs[i].value;
				
				_inputs[i].onfocus = function(){
					if (this.value == _value[this.index])
						this.value = '';
				}
				_inputs[i].onblur = function(){
					if (this.value == '')
						this.value = _value[this.index];
				}
			}
		}
	}
	if (_txt) {
		for(var i=0; i<_txt.length; i++) {
			_txt[i].index = i;
			_value['txt'+i] = _txt[i].value;
			
			_txt[i].onfocus = function(){
				if (this.value == _value['txt'+this.index])
					this.value = '';
			}
			_txt[i].onblur = function(){
				if (this.value == '')
					this.value = _value['txt'+this.index];
			}
		}
	}
}

if (window.addEventListener)
	window.addEventListener("load", hideFormText, false);
else if (window.attachEvent)
	window.attachEvent("onload", hideFormText);
