/*
	Featured js

var playlistsContent =  $("#playlistsContent");
var SITENAME = 'http://www.galizur.com/home/mobile/';
var songs = [];
*/

$(function(){
	
	/*
		$.mobile.loadPage("#player", { showLoadmsg: false });
        $.mobile.loadPage("#songOptionsPage", { showLoadmsg: false });
        
        //Set the playing info to nothing
		 //$("#posSlider").slider("disable");
		setPlayingInfo(); 
		getPlaylists();
   
		$("#previousSong").click(playPreviousSong);
		$("#nextSong").click(playNextSong);*/
	$('#playlist').on('click', function(){
		getPlaylists();
	});


});

 //Play button was clicked
    $("#playPlaylist").click(function () {
        //Nothing playing? Start from the beginning
        if (playingSongId == null) {
            playSong(0);
            return;
        }
        //Toggle the pause
        setPauseState(soundManager.togglePause(mySound).paused);
    });

function getPlaylists(){
	
	var url = SITE_NAME+'get_playlists';
	showLoading();
	$.getJSON(url, function(data){
		$.each(data, function(key,data){
			//songList = songs.push(data);
			//console.log(data);
			if(data.mydata == ""){
				return;
			}
			
			var pl_name = data.myname;
			var created_date = data.date;
			var coverart = data.coverart;
			if(coverart == null || coverart == ""){
				coverart = 'http://www.ghanaplaylist.com/home/assets/coverart/playlist_coverart_unknown.png';
			}else{
				coverart = 'http://www.ghanaplaylist.com/home/assets/coverart/'+ coverart;
			}
			
			var desc = data.description;
			var created_by = data.username;
			
			 var a = $("<a href='#player'><img src="+coverart+" style=''><h3 class='ui-li-heading'>" + pl_name + "</h3><p>User: "+created_by+"<br> plays("+ data.views+")</p>\n\n\
			 <p class='ui-li-aside'>"+data.number_of_tracks+" songs</p></a>");
				 $(a).click({ id: data.myid }, function (event) {
                                play_playlist(event.data.id);
                            });
                             
				
                 $("#playlistsContent").append($("<li></li>").append(a));  
				 $("#playlistsContent").listview('refresh');
		});
		hideLoading() ;
	});
	return false;
}

function showLoading(){
	$.mobile.loading( 'show', {
	text: 'loading playlists',
	textVisible: true,
	theme: 'a',
	html: ""
	});
	return false;
}

function hideLoading() {
	$.mobile.loading( 'hide');
	return false;
}

// function playSinglePlaylists
function play_playlist(pl_id){
	//get all tracks from playlist
		
		$.getJSON(SITE_NAME+'get_playlist_tracks?playlist_id='+pl_id, function(data){

			 songs = [];
				$.each(data, function(key, value){
					songs.push(value);
				});
				playSong(songs[0].myid); //play first track in array object
			});
			
 return false;
}