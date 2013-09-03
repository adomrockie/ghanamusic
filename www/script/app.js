var content_ProgressVar = $('#contentProgress');
var content = $('#latest_tracks');
var play_content= $('#content_play');
var nowPlayingButton = $('#nowPlayingButton');
var playlistsContent =  $("#playlistsContent");

var SITE_NAME = 'http://www.galizur.com/home/mobile/';
var user = $.cookie('user_name');
$(function(){
		/*
        $.mobile.loadPage('#home', {showLoadmsg : false });
        $.mobile.loadPage("#player", { showLoadmsg: false });
        $.mobile.loadPage("#featured", { showLoadmsg: false });
        $.mobile.loadPage("#playlist", { showLoadmsg: false });
        
        $.mobile.loadPage("#songOptionsPage", { showLoadmsg: false });        */
		
        //Set the playing info to nothing
		 //$("#posSlider").slider("disable");
		setPlayingInfo(); 
		getMusic();
    //Play button was clicked
    
        $("#previousSong").click(playPreviousSong);
        $("#nextSong").click(playNextSong);
        
     $('#home').click( function () {
        getMusic();
     });

    $("#open-panel").click( function (){
        $("#nav-panel").panel('open');   
        return false;
    });
    
    $("#featured").click(function(){
         //$(this).page({ domCache : true });
         showProgress();
         $.getJSON(SITE_NAME+'get_featured', function(f_data){
              songs = [];
                $.each(f_data, function(key,data){
                   var a = $("<a href='#player'><img src="+data.visual+"><h3 class='ui-li-heading'>" + data.basename + "</h3><p>Artist: "+data.artist+"<br> plays("+ data.plays+")</p></a>");
                            $(a).click({ id: key }, function (event) {
                                playSong(event.data.id);
                            });
                             
                  $('#featuredSongList').append($("<li></li>").append(a));  
                   songs.push(data); 
                });
                $('#featuredSongList').listview('refresh');
            hideProgress();    
         });        
     });

    $('#browse').on('click', function() {
        var $ul = $('#autocomplete');
		$.getJSON(SITE_NAME+'get_music?order_by=timeupdated&limit=20', function(response){
            songs = [];
             showProgress();
                        $.each( response, function ( key, val ) {
                           // html += "<li>";
                            var a = $("<a href='#player' id='#track'><img src='"+val.visual+"'><h3 class='ui-li-heading'>" + val.basename + "</h3><p>Artist: "+val.artist+"<br> plays("+ val.plays+")</p></a>");
                            $(a).click({ id: key }, function (event) {
                                playSong(event.data.id);
                            });
                           $ul.append($("<li></li>").append(a));  
                            songs.push(val);
                        });
                       $ul.listview( "refresh" );
                       $ul.trigger( "updatelayout");
                       hideProgress();                       
        });
        
                   
    });

    $('#autocomplete, #songList').on('listviewbeforefilter', function(e, data) {

        var $ul = $( this ),
                    $input = $( data.input ),
                    value = $input.val(),
                    html = "";
                    $ul.html( "" );
        if ( value && value.length > 2 ) {
               showProgress();
                    //$ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
                    $ul.listview( "refresh" );
                    $.ajax({
                        url: SITE_NAME+"search_music",
                        dataType: "jsonp",
                        crossDomain: true,
                        data: {
                            term: $input.val()
                        }
                    })
                    .then( function ( response ) {
                        songs = [];
                        $.each( response, function ( key, val ) {
                           // html += "<li>";
                            var a = $("<a href='#player' id='#track'><img src='"+val.visual+"'><h3 class='ui-li-heading'>" + val.basename + "</h3><p>Artist: "+val.artist+"<br> plays("+ val.plays+")</p></a>");
                            $(a).click({ id: key }, function (event) {
                                playSong(event.data.id);
                            });
                             $ul.append($("<li></li>").append(a));  
                            songs.push(val);
                        });
                        $ul.listview( "refresh" );
                        $ul.trigger( "updatelayout");
                        hideProgress();
                    });
                }    
    });//end autocomplete
    
     
    /* Login process */
$('#login_form').bind('submit', function () {
    //send a post request to your web-service
    $.post(SITE_NAME+'authenticate_user', $(this).serialize(), function (response) {
        //check if the authorization was successful or not
        if (response.result.status === 'success') {
             $.cookie('username', response.result.user_name, { expires: 14 });
             $.cookie('user_id', response.result.user_id, { expires: 14 });
            $.mobile.changePage('index.html', "slide");    
           
        } else {
            alert(response.result.message);
           $('.login_messsage').html(response.result.message);
            //$.mobile.changePage('#toc', "slide");
            
            return;
        }
    }, 'JSON');
    return false;
    });
           
});
     
$('#posSlider').change(function(){
        var slider_value = $(this).val();
        //alert(slider_value);
        soundManager.setPosition(mySound, slider_value);
 });
/* Browse and search **/
function getMusic(){
	showProgress();
	var data_link = SITE_NAME+'get_music?callback=?';
	//var data_link = 'music_data.json'
	$.ajax({
		url: data_link,
		type: 'GET',
		success: function(datas){
				var list_data = "";
                 var songList = $("#songList");
                 songs = [];
                 songList.html(''); 
            $.each(datas, function(key,data){
                       
			if(key){
                             var a = $("<a href='#player'><img src='"+data.visual+"'>\n\n\
                                <h3 class='ui-li-heading'>" + data.basename + "</h3>\n\n\
                                <p>Artist: "+data.artist+"<br> plays("+ data.plays+")</p></a>");
                            $(a).click({ id: key }, function (event) {
                                playSong(event.data.id);
                            });
                            songList.append($("<li></li>").append(a));
                            songs.push(data);
                        }
						
			});
			
			songList.append(list_data).listview('refresh');
			hideProgress();
		},
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("Error... " + textStatus + "        " + errorThrown);
                },complete: function(jqXHR, textStatus) {
                    window.console.log('JSONP was retrieved successfully' + textStatus);
                },
                dataType : 'json'
		
	});
	return false;
}

function showProgress(){
  $.mobile.loading( 'show', {
	text: 'Loading, wait..',
	textVisible: true,
	theme: 'z',
	html: ""
   });
 }
   
function hideProgress(){
	 $.mobile.loading( 'hide');
   }   
          
//authenticate for all user activity
function authenticate(){
        if($.cookie('user_name') == ''){
              //show login page
               $.mobile.changePage('#login', 'slide');
               return false;
        }else{
        return true;
        }
}

function update_playlist_views(val){
    if(authenticate){
    $.mobile.changePage('#playlists', 'slide');    
    }
    
    return false;
}
function show_live_listing(){
    $.mobile.changePage('#browse');
    return false;
}
function update_views(by) {  
    if(by === 'mysongs'){
        authenticate();
        by = 'add_date';
    
    }
    var user_id = $.cookie('user_id');
        var $ul = $('#songList');
         $ul.html('');
          $.getJSON(SITE_NAME+'get_music?order_by='+by+'&user_id='+user_id+'&limit=20', function(response){
            showProgress();
            songs = [];
                     $.each( response, function ( key, val ) {
                           // html += "<li>";
                            var a = $("<a href='#player' id='#track'><img src='"+val.visual+"'><h3 class='ui-li-heading'>" + val.basename + "</h3><p>Artist: "+val.artist+"<br> plays("+ val.plays+")</p></a>");
                            $(a).click({ id: key }, function (event) {
                                playSong(event.data.id);
                            });
                           $ul.append($("<li></li>").append(a));  
                            songs.push(val);
                        });
                       $ul.listview( "refresh" );
                       $ul.trigger( "updatelayout");
                       hideProgress();                  
        });
   
   return false;
}