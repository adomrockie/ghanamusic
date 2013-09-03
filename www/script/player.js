/* Player.js */

//Grab the songs

var songs = []; 

//A pointer to the currently playing song
var playingSong = null;
 
//The id into the song array
var playingSongId = null;
 
//The sound id for soundmanager
var mySound = 'mySound';
 
//Whether repeat is on
var repeat = false;
 
//Whether shuffle is on
var shuffle = false;
var coverart = $('#coverart');
var playerFooter = $("#playerFooter");
var diaLogContent = $("#playlistsSongs");

(function(){
 
    //Toggle the shuffle button
    $("#shuffleSlider").change(function () {
        shuffle = $(this).attr('value') == 'on' ? true : false;
    });
 
    //Toggle the shuffle button
    $("#repeatSlider").change(function () {
        repeat = $(this).attr('value') == 'on' ? true : false;
    });
  
	
});
      
	
     $('#posSlider').change(function(){
        var slider_value = $(this).val();
        alert(slider_value);
        soundManager.setPosition(mySound, slider_value);
    });
	
	//show songs in dialog
	$('#showSongsButton').click(function() {
		alert('clicked');
		showSongsList();
		$.mobile.changePage( "#showSongsLists", { role: "dialog" } );
		
		return false;
	});
/*
* Play a song with a specific ID
*/
function playSong(id) {
    //Stop the sound from playing
	
    soundManager.destroySound(mySound);
	
	//console.log('playing song id => '+ id);
    //If we're under, just go to the end!
    if (id < 0)
        id = songs.length - 1;
 
    //If we're over, choose what to do via the repeat flag
    if (id >= songs.length)
            id = 0;
 
    //Save some variables
    playingSongId = id;
    playingSong = songs[playingSongId];
	setCoverart(playingSong.visual);
    //Toggle the pause
        setPauseState(soundManager.togglePause(mySound).paused);
        
       var track_url = playingSong.filepath.replace('/home/galizur/public_html/', 'http://www.galizur.com/'); 
       $.post('http://www.galizur.com/home/mobile/update_play', {myid : playingSong.myid}, 'activate', 'jsonp');
    //Create the sound and begin playing whenever!
    
    soundManager.setup({
		url :'swf/',useHTML5Audio: true,
		preferFlash: true,
		onready: function() {
                // SM2 has started - now you can create and play sounds!
            soundManager.createSound({
                  id: mySound,
                  url: track_url,
                    autoPlay: true,
                    stream: true,
                    onplay: function () {
                        setPlayingInfo(playingSong.basename);
                        setPauseState(false);
                        setPlayTime();
						//playerFooter.prepend($('<div>'+playingSong.basename+'</div>')).fadeIn('Slow');
                        playerFooter.html('<div>'+playingSong.basename+'</div>').fadeIn('Slow');

                    },
                    onfinish: function() {
                        //We'll only continue if we're shuffling or repeating if we past the end...
                        if (shuffle == false && (playingSongId + 1 >= songs.length) && repeat == false) {
                            //No more songs...
                            setPlayingInfo();
                            setPauseState(false);
                            setPlayTime();
                            playingSong = null;
                            playingSongId = null;
                            return;
                        }
                        else {
                            playNextSong();
                        }
                            },
                    onload: function () {
                        playingSong.duration = this.duration / 1000;
                    },
                    whileplaying: function () {
                        setPlayTime(this.position / 1000, playingSong.duration, this.durationEstimate / 1000);
                    }
                });
	
	}
	
});
   
}
   /*
* Play the next song
*/
function playNextSong() {
    //If shuffle is on, we shall shuffle
    if (shuffle == true)
        return shuffleSong();
    playSong(playingSongId + 1);
} 
/*
* Play the previous song
*/
function playPreviousSong() {
    //If shuffle is on, we shall shuffle
    if (shuffle == true)
        return shuffleSong();
    playSong(playingSongId - 1);
}
 
/*
* Shuffle the next song
*/
function shuffleSong() {
    var i = Math.floor((Math.random() * songs.length));
 
    //I don't want to listen to the same song...
    if (playingSongId == i && songs.length > 1) {
        if (--i >= songs.length)
            i = 0;
    }
 
    //Play the song!
    playSong(i);
}
 
/*
* Set the playing information elements
*/
function setPlayingInfo(name) {
    //Passing nothing into this function results in it's visibility being
    //changed to hide the title & artist fields
    if (name == undefined) {
        $("#nowPlayingButton").hide();
    } else {
        $("#nowPlayingButton").show();
    }
 
    //Set the name and artist elements
    $("#songName").text(name == undefined ? "Unknown" : name);
 
    //We need to refresh the list view because we modified the footer and
    //it takes up more space now!
    $("#songList").listview("refresh");
}

/*
	set background coverart
*/
function setCoverart(img){
	if(img == undefined || img == ""){
			img = 'img/note.png';
	}
	 $('#coverart').attr('src' , img);
	return false;
}
 
/*
* Set the pause state of the play button
*/
function setPauseState(paused) {
    if (paused) {
        $("#playSong .ui-btn-text").text("Play");
    } else {
        $("#playSong .ui-btn-text").text("Pause");
    }
}
 
/*
* Set the Play clock
*/
function setPlayTime(current, duration, estimateDuration) {
    function pad(number, length) {
        var str = '' + number;
        while (str.length < length)
            str = '0' + str;
        return str;
    }
   
 
    //Make sure there is a current time...
    if (current < 0 || isNaN(current)) {
        $("#songCurrentpos").html(" ");
    } else {
        //Some value will always be visible.
        $("#songCurrentpos").text(pad(Math.floor(current / 60), 2) + ":" + pad(Math.floor(current % 60), 2));
        $("#posSlider").val(Math.floor(current));
    }
 
    if (duration < 0 || isNaN(duration)) {
        $("#songDuration").html(" ");
 
        //We'll take the estimate...
        if (estimateDuration !== 'undefined')
            $("#posSlider").attr('max', estimateDuration);
    } else {
        $("#songDuration").text(pad(Math.floor(duration / 60), 2) + ":" + pad(Math.floor(duration % 60), 2));
        $("#posSlider").attr('max', Math.floor(duration));
    }
 
    //$("#posSlider").slider("enable");
   $("#posSlider").slider("refresh");
    //$("#posSlider").slider("value", current);
}

/* Show playing song list in array */

function showSongsList(){
	
	  $.mobile.changePage("#showSongsLists");
	  $.each(songs, function(key, data){
		var a = $("<a href='#player'><h5 class='ui-li-heading'>" + data.basename + "</h5>\n\n\
		<p>Artist: "+data.artist+" </p><p>  <span class='ui-li-count'>plays "+ data.plays +"</span></p></a>");
                            $(a).click({ id: key }, function (event) {
                                playSong(event.data.id);
                            });
         $('#playlistsSongs').append($("<li></li>").html(a));
		
		});
		$('#playlistsSongs').listview('refresh');
		
	return false;
}


function togglePlay(){

      //Nothing playing? Start from the beginning
        if (playingSongId == null) {
            playSong(0);
            return;
        }
        //Toggle the pause
        setPauseState(soundManager.togglePause(mySound).paused);

        return false;
}
