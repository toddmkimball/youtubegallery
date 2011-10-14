$(document).ready(function(){
	
	// This creates instantiates an overlay for the edit form and gives 
	// us a handle for it to display and hide as needed
	var videoOverlay = $("#youtube-player-container").overlay({
		fixed: false,
		mask: {
			color: '#000',
			opacity: 0.5,
			loadSpeed: 1500
		},
		api: true
	});
	
	
	$("#video-list").delegate("a.with-overlay", "click", function (e) {
	    e.preventDefault(); //prevent default link action
	
	    videoOverlay.load();
	});
	
	
	$('ul#video-list').youtubeinator({
		addThumbs:        true, 
		autoPlay:         false,
		thumbSize:        'large',
		playlistId:       'DDF174085EADD719',
		playerOverlayDiv: 'youtube-player-container',
		autoPlay:         true
	});
});