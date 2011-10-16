//-----------------------------------------------------------
//		youtubegallery jquery plugin
//		
//		based on jquery.youtubeplaylist.js by dan@geckonm.com
//
//		modified by Ben Smith
//		converted to youtubegallery by Todd Kimball
//-----------------------------------------------------------

String.prototype.startsWith = function(str){
    return (this.indexOf(str) === 0);
}


jQuery.fn.youtubegallery = function(options) {
 
  // default settings
  var options = jQuery.extend( {
    holderId: 'ytvideo',
	playerHeight: 360,
	playerWidth: 560,
	addThumbs: false,
	thumbSize: 'small',
	showInline: false,
	autoPlay: true,
	showRelated: false,
	allowFullScreen: false,
	userName: '',
	channel: '',
	playlistId: '', 
	playerOverlayDiv: ''
  },options);
 
  return this.each(function() {
							
   		var $el = $(this);
		
		var autoPlay = "";
		var showRelated = "&rel=0";
		var fullScreen = "";
		if(options.autoPlay) autoPlay = "&autoplay=1"; 
		if(options.showRelated) showRelated = "&rel=1"; 
		if(options.allowFullScreen) fullScreen = "&fs=1"; 
		
		//throw a youtube player in
		function playOld(id) {
		   var html  = '';
	
		   html += '<object height="'+options.playerHeight+'" width="'+options.playerWidth+'">';
		   html += '<param name="movie" value="http://www.youtube.com/v/'+id+autoPlay+showRelated+fullScreen+'"> </param>';
		   html += '<param name="wmode" value="transparent"> </param>';
		   if(options.allowFullScreen) { 
		   		html += '<param name="allowfullscreen" value="true"> </param>'; 
		   }
		   html += '<embed src="http://www.youtube.com/v/'+id+autoPlay+showRelated+fullScreen+'"';
		   if(options.allowFullScreen) { 
		   		html += ' allowfullscreen="true" '; 
		   	}
		   html += 'type="application/x-shockwave-flash" wmode="transparent"  height="'+options.playerHeight+'" width="'+options.playerWidth+'"></embed>';
		   html += '</object>';
			
		   return html;
		};
		
		
		function playNew (id) {
		  var html = '';
		  html += '<iframe width="'+ options.playerWidth +'" height="'+ options.playerHeight +'"';
		  html += ' src="http://www.youtube.com/embed/'+ id +'" frameborder="0"';
		  hml += ' allowfullscreen></iframe>';
		}
		
		
		//grab a youtube id from a (clean, no querystring) url (thanks to http://jquery-howto.blogspot.com/2009/05/jyoutube-jquery-youtube-thumbnail.html)
		function youtubeid(url) {
			var ytid = url.match("[\\?&]v=([^&#]*)");
			ytid = ytid[1];
			return ytid;
		};
		
		if ( options.userName && options.channel ) {
			$el.html('');
			$.ajax({
				url: "http://gdata.youtube.com/feeds/base/users/" + 
					options.userName + "/" + options.channel + "?alt=json",
				cache: true,
				dataType: 'jsonp',                    
				success: buildList
			});
		} else if (options.playlistId) {
			$el.html('');
			$.ajax({
				url: "http://gdata.youtube.com/feeds/api/playlists/"+options.playlistId+"?alt=json",
				cache: true,
				dataType: 'jsonp',                    
				success: buildList
			});
		} else {
			alert('No channel specified');
		}
		
		function buildList(data)
		{
			$("#loading").hide();
			
			$.each(data.feed.entry, function(i, e) {
				$el.append('<li class="video"><a href="'+e.link[0].href+'" class="with-overlay disable-external-handler" rel="#'+options.playerOverlayDiv+'">'+e.title.$t+'</a></li>');
			})
						
			$el.children('li').each(function() {
				$(this).find('a').each(function() {
					var thisHref = $(this).attr('href');
					
					//old-style youtube links
					if (thisHref.startsWith('http://www.youtube.com')) {
						$(this).addClass('yt-vid');
						$(this).data('yt-id', youtubeid(thisHref) );
					}
					//new style youtu.be links
					else if (thisHref.startsWith('http://youtu.be')) {
						$(this).addClass('yt-vid');
						var id = thisHref.substr(thisHref.lastIndexOf("/") + 1);
						$(this).data('yt-id', id );
					}
					else {
						//must be an image link (naive)
						$(this).addClass('img-link');
					}
					
				   // alert(thisHref);
				});
			});
		
		
			//do we want thumnbs with that?
			if(options.addThumbs) {
				
				$el.children().each(function(i){
					
					//replace first link
					var $link = $(this).find('a:first');
					var replacedText = $(this).text();
					
					if ($link.hasClass('yt-vid')) {
						
						if(options.thumbSize == 'small') {
							var thumbUrl = "http://img.youtube.com/vi/"+$link.data("yt-id")+"/2.jpg";
						}
						else {
							var thumbUrl = "http://img.youtube.com/vi/"+$link.data("yt-id")+"/0.jpg";
						}
		
						var thumbHtml = "<img src='"+thumbUrl+"' alt='"+replacedText+"' /><br />";
						$link.empty().html(thumbHtml+replacedText).attr("title", replacedText);
						
					}
					else {
						//is an image link
						var $img = $('<img/>').attr('src',$link.attr('href'));
						$link.empty().html($img).attr("title", replacedText);
					}	
					
				});	
				
			}
		}
		
		//load video on request
		$("a.yt-vid").live('click',function() {
			if(options.showInline) {
				$("li.currentvideo").removeClass("currentvideo");
				$(this).parent("li").addClass("currentvideo");
				$("#youtube-player").html(playOld($(this).data("yt-id")));
			}
			else {
				$("#youtube-player").html(playOld($(this).data("yt-id")));
				$(this).parent().parent("ul").find("li.currentvideo").removeClass("currentvideo");
				$(this).parent("li").addClass("currentvideo");
			}	
			return false;
		});

		$el.find("a.img-link").live('click',function() {
		    var $img = $('<img/>');
		    $img.attr({
		            src:$(this).attr('href') })
		        .css({
		            display: 'none',
		            position: 'absolute',
		            left: '0px',
		            top: '50%'});

		    if(options.showInline) {
		        $("li.currentvideo").removeClass("currentvideo");
		        $(this).parent("li").addClass("currentvideo").html($img);
	        }
	        else {
	            
	            $("#"+options.holderId+"").html($img);
				$(this).closest("ul").find("li.currentvideo").removeClass("currentvideo");
				$(this).parent("li").addClass("currentvideo");
				
	        }
            //wait for image to load (webkit!), then set width or height
            //based on dimensions of the image
            setTimeout(function() {
                if ( $img.height() < $img.width() ) {
                    $img.width(options.playerWidth).css('margin-top',parseInt($img.height()/-2, 10)).css({
                        height: 'auto'
                    });
                }
                else {
                    $img.css({
                        height: options.playerHeight,
                        width: 'auto',
                        top: '0px',
                        position: 'relative'
                    });
                }
                $img.fadeIn();
            }, 100);
            
            
		    return false;
	    });
		
		//load inital video
		var firstVid = $el.children("li:first-child").addClass("currentvideo").children("a").click();   
  });
 
};