//-----SITE WIDE--------------------------------------------------------------------------------------------------------------------------
//make the itinerary widget sortable
$( function()
{
	if(String(window.location).indexOf('itinerary')>-1 && String(window.location).indexOf('prepackaged') == -1)
	{
		callFrom='page';
	}
	else
	{  
		callFrom='widget';
	}
	$( "#itinerary_container" ).sortable({
		tolerance: 'pointer',
		placeholder: "itinerary_item_placeholder",
		start: function(event, ui)
		{
			$(ui.item).addClass('itinerary_item_active');
		},

		stop: function (event, ui)
		{
			reOrderItinerary(callFrom);
			$(ui.item).removeClass('itinerary_item_active');
		}

	});
	$( "#itinerary_container" ).disableSelection();
});

//flattenArray - used to get the data from the control server and flatten it into one level for frontend use
function flattenArray(obj,callFrom,threeTabs)
{
	if(isset(obj.items))
	{
		for(var i=0; i<obj.items.length; i++)
		{

			if(callFrom=="map")
			{
				if(isset(obj.items[i].item_metadata.latitude))
				{
					if ( obj.items[i].item_metadata.latitude.item_metadata_data || obj.items[i].item_metadata.logitude.item_metadata_data )
					{
						if(threeTabs!='interets' && threeTabs!='routes' && threeTabs!='towns')
						{
							var alreadyInSet = false;
							for(var count=0;count<markerSet.length; count++)
							{
								if((obj.items[i].item_id==markerSet[count][4]))
								{
									alreadyInSet = true;
								}
							}
							if(alreadyInSet==false)
							{
								markerSet[markerSet.length] = new Array(
									obj.items[i].item_metadata.latitude.item_metadata_data,
									obj.items[i].item_metadata.logitude.item_metadata_data,
									obj.items[i].item_title,
									obj.items[i].item_short_description,
									obj.items[i].item_id);
							}
						}
						if(isset(threeTabs))
						{
							threeTabMarkerSet[threeTabs][threeTabMarkerSet[threeTabs].length] = new Array(
							obj.items[i].item_metadata.latitude.item_metadata_data,
							obj.items[i].item_metadata.logitude.item_metadata_data,
							obj.items[i].item_title,
							obj.items[i].item_short_description,
							obj.items[i].item_id);
						}

					}
				}

			}
			else if(callFrom=="category")
			{
				var img=""; //placeholder varaible
				if(isset(obj.items[i].images)) //check if there are any images
				{
					for(var k=0; k<obj.items[i].images.length; k++) //for every image attached to this attraction
					{
						if(isset(obj.items[i].images[k].image_classification_label)) //make sure the image tag exists
						{
							if(obj.items[i].images[k].image_classification_label == "logo") //give us only logos
							{
								img = obj.items[i].images[k].image_id; //temp variable that we pass into the attraction objects
							}
						}
					}
				}
                    if(!in_obj_array(attractionArr,obj.items[i].item_id))
                    {
				attractionArr[attractionArr.length] = {id: obj.items[i].item_id, title: obj.items[i].item_title, short_description: obj.items[i].item_short_description, image:img};
				}
			}
		}
	}

	if(isset(obj.categories))
	{
		if(obj.categories.length > 0)
		{
			for(var j=0; j<obj.categories.length; j++)
			{
				flattenArray(obj.categories[j],callFrom); //one level deeper
			}//for
		}//if
	}//if isset
}

//manipulateMapDelimiterConrol - turn on/off filter - used by limitCategory() and updateMapMarkers()
function manipulateMapDelimiterConrol(control, id, poly)
{
	if($(control).attr('type')!='cat' && $(control).attr('type')!='town')
	{
		hoverClass = 'md_'+$(control).attr('id')+'_on'; //style
	}
	else
	{
		hoverClass = 'md_cat_on'; //style
	}
	//manipulate the controls to show/on/off states
	if($(control).attr('on') == 'false') //control is inactive, being turned on
	{
		//manipulate the control
		$(control).attr('on', 'true');
		$(control).addClass(hoverClass);
		$(control).addClass('delimiter_filter_on');

		//manipulate the poly line
		if(isset(poly))
		{
			alterPoly(id,"on");
			ntptEventTag("ev=Map | Control Turned On | "+id);
			_gaq.push(['_trackEvent', 'Map', 'Control Turned On', id]);
		}
		else
		{
			ntptEventTag("ev=Category | Filter Turned On | "+id);
			_gaq.push(['_trackEvent', 'Category', 'Filter Turned On', id]);
		}
	}
	else //control is active, being turned off
	{
		//manipulate the control
		$(control).attr('on','false');
		$(control).removeClass(hoverClass);
		$(control).removeClass('delimiter_filter_on');

		//manipulate the poly line
		if(isset(poly))
		{
			alterPoly(id,"off");
		}
	}
}

//functionality of filter tabs
function mapDelimiter(delimiter)
{
	//change the tab classes
	if(currentMapDelimiter!=delimiter)
	{
		//hide the current delimiters, show the new delimiters
		$('#'+currentMapDelimiter+'_delimiter').fadeOut(300);
		$('#'+delimiter+'_delimiter').fadeIn(300);

		//change the tab style
		$('#'+currentMapDelimiter+'_delimiter_tab').removeClass('map_tab_delimiter_selected').addClass('map_tab_delimiter_link');
		$('#'+delimiter+'_delimiter_tab').removeClass('map_tab_delimiter_link').addClass('map_tab_delimiter_selected');

		//chnage current map delimiter for next animation
		currentMapDelimiter = delimiter;
	}
}

//-----ATTRACTION PAGE--------------------------------------------------------------------------------------------------------------------------
//functionality for the vertical image scroller - calculates based on strict height property
var haltVerticalScroller = false;
var activeVerticalScroller = 0;
function animateVerticalSlider(action)
{
	ntptEventTag("ev=Attraction | Image Scroll");
	_gaq.push(['_trackEvent', 'Attraction', 'Image Scroll']);

	//don't name this que, because we want to be able to click multiple times
	$.doTimeout(250, function()
	{
		if ( haltVerticalScroller==false )
		{
			haltVerticalScroller = true;

			var margin = parseInt($('#scrollableArea').css('marginTop').replace(/^,|,$|[^0-9]+,|,[^0-9]+/g,''));

			var total = $('#scrollableAreaReal > .imgHolder').length;

			if(action=="up")
			{
				activeVerticalScroller = activeVerticalScroller-1;
				var movement = 199;
			}
			else if(action=="down")
			{
				activeVerticalScroller = activeVerticalScroller+1;
				var movement = -199;
			}

			if(activeVerticalScroller == -1)
			{
				//duplicate the content
				$('#scrollableAreaTopFlood').html($('#scrollableAreaReal').html());

				//determine what the margin would be at the very last element
				margin = $('#scrollableAreaTopFlood').height()*-1;

				//set the display to be hiding all of the new elements without animation
				$('#scrollableArea').css('marginTop',margin);
			}
			else if(activeVerticalScroller == total)
			{
				//duplicate the content
				$('#scrollableAreaBottomFlood').html($('#scrollableAreaReal').html());
			}

			margin = margin + movement;

			$('#scrollableArea').animate(
			{
				marginTop: margin
			},
			500, function(data)
			{
				//viewing the last three elements or the first three elemtents in a flooded zone? go back to the real container
				if(activeVerticalScroller==total || activeVerticalScroller==-1)
				{
					if(activeVerticalScroller == total)
					{
						activeVerticalScroller = 0;
						margin = 0;
					}
					else
					{
						activeVerticalScroller = parseInt(total)-1;
						margin = activeVerticalScroller * -199;
					}

					$('#scrollableAreaTopFlood').html('');
					$('#scrollableAreaBottomFlood').html('');
					$('#scrollableArea').css('marginTop',margin);
				}

				haltVerticalScroller=false;
			});

			return false;
		}
		return true;
	});

}

function updateAttractionEvents()
{
     var oldSet = scrollSet * 5;
     scrollSet++;
     var newSet = scrollSet * 5;

     if(newSet > eventCount)
     {
          newSet = eventCount;
          $('#scroll_ajax_loader').hide();
     }

	  for(var i=oldSet+1; i<=newSet; i++)
	  {
		   $('#event_'+i).slideDown();
	  }

}

//-----HOME PAGE--------------------------------------------------------------------------------------------------------------------------
//functionality for the horizontal image scroller - calculates based on a strict width in pixels
var haltHorizontalScroller = false;
var leftHorizontalScroller = 0;
function animateHorizontalSlider(action)
{
	ntptEventTag("ev=Home Page Spotlight Scroll");

	//don't name this que, because we want to be able to click multiple times
	$.doTimeout(250, function()
	{
		if(haltHorizontalScroller==false)
		{
			haltHorizontalScroller = true;
			var margin = parseInt($('#scrollableArea').css('marginLeft').replace(/^,|,$|[^0-9]+,|,[^0-9]+/g,''));

			if(action=="left")
			{
			     var fromPosition = leftHorizontalScroller;


				leftHorizontalScroller = leftHorizontalScroller - 1;

				//the left margin will grow as we move left
				var movement = 176;
			}
			else if(action=="right")
			{
			     var fromPosition = leftHorizontalScroller;

				leftHorizontalScroller = leftHorizontalScroller+1;

				//the left margin needs to be negative when we move right
				var movement = -176;
			}

			if(leftHorizontalScroller==-1) //we're moving past the real on the left and need to add content to the left flood
			{
			     if(fromPosition==0)
			     {
     				//we have to add the content so our default margin changes
     				//determine what the margin would be at the very last element
     				margin = $('#scrollableAreaReal > .sliderImage').length*-176;

     				//duplicate the content
     				$('#scrollableAreaLeftFlood').html($('#scrollableAreaReal').html());

     				//reset the width of the scrollable area - css can't determine it automatically
     				$('#scrollableArea').css('width',$('.sliderImage').length*176);
                    }

				//set the display to be hiding all of the new elements without animation
				$('#scrollableArea').css('marginLeft',margin);
			}
			else if(leftHorizontalScroller==$('.sliderImage').length-2) //reached the furthest right
			{
				//duplicate the content
				$('#scrollableAreaRightFlood').html($('#scrollableAreaReal').html());

				//reset the width of the scrollable area - css can't determine it automatically
				$('#scrollableArea').css('width',$('.sliderImage').length*176);
			}

			margin = margin + movement;

			$('#scrollableArea').animate(
			{
				marginLeft: margin
			},
			1000, function(data)
			{
				//viewing the last three elements or the first three elemtents in a flooded zone? go back to the real container
				if(leftHorizontalScroller==$('#scrollableAreaReal > .sliderImage').length || leftHorizontalScroller==-3 || leftHorizontalScroller==0)
				{
					if(leftHorizontalScroller == $('#scrollableAreaReal > .sliderImage').length || leftHorizontalScroller==0)
					{
						leftHorizontalScroller = 0;
						margin = 0;
					}
					else
					{
						leftHorizontalScroller = parseInt($('#scrollableAreaReal > .sliderImage').length)-3;
						margin = leftHorizontalScroller * -176;
					}

					$('#scrollableAreaLeftFlood').html('');
					$('#scrollableAreaRightFlood').html('');
					$('#scrollableArea').css('width',$('.sliderImage').length*176);
					$('#scrollableArea').css('marginLeft',margin);
				}

				//it's ok for the que to continue
				haltHorizontalScroller=false;
			});

			return false;
		}

		return true;
	});

}

/*----ITINERARY WIDGET-------------------------------------------------------*/
//reOrderItinerary - update the order of the attractions after a user sorts
function reOrderItinerary(callFrom)
{
	DeleteCookie('itinerary_items');
	_gaq.push(['_trackEvent', 'Itinerary', 'Reorder']);
	ntptEventTag("ev=Itinerary | Reorder Itinerary Items");

	$('.itinerary_item').each( function(index)
	{
		switchOddEven($(this),index,0);
		id = $(this).attr('id');//v1.0: .substr(13);
		addAttraction(id);
	});

	if(callFrom=="page")
	{
		updateDirections();
	}
}

//switchOddEven - change the styles of the itinerary list
function switchOddEven(control, index, startCounter)
{
	//1.2.1 strip it of whatever colors it currently has
	if($(control).hasClass('even'))
	{
		$(control).removeClass('even');
	}
	if($(control).hasClass('odd'))
	{
		$(control).removeClass('odd');
	}

	//1.2.2 give it the new colors it should have
	if(index % 2 == 0)
	{
		$(control).addClass('even');
	}
	else
	{
		$(control).addClass('odd');
	}

	//1.2.3 change its number in the direction list
	updateItemCount();
}

function updateItemCount() {
	var index = 1;
	
	if(typeof startAdd != "undefined") {
		if(startAdd!=null) {
			index += 1;
		}
	}
	
	$('.itinerary_item').each(function() {
		
		$(this).find('.item_count').removeClass().addClass('item_count item_count_'+index);
		
		index += 1;
		
	});
	
}

//addAttractionToItinerary - adds an attraction to a user's itinerary
function addAttraction(id, title, control,type, titleURL)
{
	if(!isset(type)) {
		type = '';
	}
	
	if(isset(title)) {
		title = title.replace('``','"').replace("`","'");
	}
	
	//get the current value of the itinerary cookie
	var oldCookie = ReadCookie('itinerary_items');
	var oldCookieArr = explode(',', oldCookie);
	if(oldCookie == "")
	{
	    $('#clear_itinerary_button').show();
		$('#viewEditItinierary').slideDown();
		$('#customItineraryAddedDesc').slideDown();
	}
	if(explode(',', oldCookie).length <= 8) //we can only have 9 itinerary items and you can't add the some one twice
	{
		if(!in_array(oldCookieArr,id))
		{
			if(oldCookie!="")
			{
				str = oldCookie+',';
			}
			else
			{
				str = '';
			}
			//add the new id to the end of the cookie
			var newCookie = str+id;

			//reset the cookie with the new value added
			SetCookie('itinerary_items', newCookie, 30);

			if(isset(control) && control!=null) //the control is only set when adding a new attraction from a link - this acts as our callFrom delimiter
			{
				//hide the link (we don't want them to be able to add it again
				$(control).hide();

				//update the widget
				updateItineraryWidget(type+id, title ,type, titleURL);
			}
			_gaq.push(['_trackEvent', 'Itinerary', 'Add Item', title]);
			ntptEventTag( "ev=Itinerary | Add Item | "+decodeURI(title));
		}
		else
		{
			alert(decodeURI(title)+' is already in your itinerary.');
		}
	}
	else //they're trying to add too many items
	{
		alert('At this time up to nine attractions or events can be added to the itinerary. For more, please print or email this itinerary, clear it, then create a new one.');
		_gaq.push(['_trackEvent', 'Itinerary', 'Add too many warning']);
		ntptEventTag( "ev=Itinerary | Add too many warning");
	}
	
	ntptAddPair( "rta", id + ";;");
	ntptEventTag( "pv=0");
}

//removeAttraction - deletes an attraction from a user's itinerary
function removeAttraction(id, type, callFrom, override)
{
	if(!isset(override))
	{
		var question = confirm('Are you sure you want to remove this attraction from your itinerary?');
	}
	if(question || override)
	{
		//remove the item from the list
		$('#'+type+id).remove();

		//get the current value of the itinerary cookie
		var oldCookie = ReadCookie('itinerary_items');

		//get an array of the cookie values
		var newCookie = explode(',',oldCookie);
		
		//delete the item - using array utility
		removeItem(newCookie, type+id);
		if(newCookie.length>0)
		{
			//reset the cookie
			SetCookie('itinerary_items', newCookie, 30);

			//renumber and style
			reOrderItinerary();
		}
		else
		{
			//delete cookie
			DeleteCookie('itinerary_items');

			//show the itienrary default copy			
			$('.showWhenNoItemsAreAdded').slideDown();
			$('.showWhenItemsAreAdded').slideUp();
		}

		//get the directions
		if(callFrom=='page')
		{
			updateDirections();
		}

		//if there is an add to itinerary button for this attraction on the page, reshow it.
		if($('#addAttraction'+id).length > 0)
		{
		    $('#addAttraction'+id).show();
		}

		_gaq.push(['_trackEvent', 'Itinerary', 'Remove Item', id]);
		ntptAddPair( "rtr", id + ";;");
		ntptEventTag( "pv=0");
	}
}

//updateItineraryWidget- after an attraction is added to the itinerary, we append it to the list in the widget
function updateItineraryWidget(idP, titleP, type, titleURL)
{
	$('.showWhenNoItemsAreAdded').slideUp();
	$('.showWhenItemsAreAdded').slideDown();

	id = idP.substr(1);
	
	if(type=='a') {
		
		typeURL = 'attraction';
		
		titleURL = encodeURI(titleP);
		
	}
	else if(type=='e') {
		
		typeURL = 'event';
		
		titleURL = id;
	
	}

	ntptEventTag("ev=Itinerary | Add Item | " + unescape(titleP));
	_gaq.push(['_trackEvent', 'Itinerary', 'Add Item', unescape(titleP)]);
	var item = new Object({id:String(id), title:String(unescape(titleP)), titleURL:String(titleURL), type:String(type), typeURL:String(typeURL) });

	sendToTemplate('itinerary_item_template',item,'itinerary_container');

	//renumber and style
	reOrderItinerary();
}

//deleteItinerary - clears everything in the user's itinerary
function deleteItinerary(control,override)
{
     if(!override)
     {
          var question = confirm("Are you sure you want to clear your itinerary?");
     }
	if(question || override)
	{
		_gaq.push(['_trackEvent', 'Itinerary', 'Delete Itinerary']);
		ntptEventTag("ev=Itinerary | Delete Itinerary");
		//flush the cookie
		DeleteCookie('itinerary_items');

		//empty the ul
		$('#itinerary_container > li').each( function(index)
		{
			$(this).remove();
		});

		if(!override)
		{
			$('.showWhenNoItemsAreAdded').slideDown();
			$('.showWhenItemsAreAdded').slideUp();
		    //hide the button (you can't delete an empty itinerary)
		    $(control).hide();
		}
	}
}


function loadPrepackagedItinerary(prepackaged)
{
	_gaq.push(['_trackEvent', 'Itinerary', 'Load Prepackaged', prepackaged]);
	ntptEventTag("ev=Itinerary | Load Prepackaged | "+ prepackaged);
    var cont = false;
     var currentItinerary = ReadCookie('itinerary_items');
     if(currentItinerary.length>0)
     {
          if(confirm('Are you sure you want to load this itinerary and replace the previous one?'))
          {
				ntptEventTag("ev=Itinerary | Replaced Itinerary with prepagkaged | "+prepackaged);
				_gaq.push(['_trackEvent', 'Itinerary', 'Replaced Itinerary with prepagkaged', prepackaged]);
				cont = true;
          }
     }
     else
     {
	 cont = true;
     }
     if(cont==true)
     {
		 deleteItinerary($('#clear_itinerary_button'),true);

		//get an array of the cookie values
		var attractions = prepackaged.attractions;
		var cookie = "";
	
		for(var i in attractions)
		{
			if(attractions[i].on) {
				addAttraction('a'+attractions[i].id, decodeURI(attractions[i].title));
			}
		}

	    window.location = "/itinerary";
     }



}


//-----CATEGORY PAGE--------------------------------------------------------------------------------------------------------------------------
var limitCategoryPause = false;
var alreadyOnCategoryPage  = new Array();
//change category and route delimiters
function limitCategory(catID, control)
{
	ntptEventTag("ev=Category | Filter Category Page | "+ catID);
	_gaq.push(['_trackEvent', 'Category', 'Filter Category Page', catID]);
	
          //manipulate the controls to show/on/off states
     manipulateMapDelimiterConrol(control);

     $.doTimeout('limitCategory');
     $.doTimeout('limitCategory', 100, function() {
          if(limitCategoryPause == false)
          {
               limitCategoryPause = true;

	if(!$('#category_ajax_loader').is(':visible'))
	{
		$('#category_ajax_loader').show();
	}

	attractionArr.length=0;
     alreadyOnCategoryPage.length = 0;
	$('#attractions_list_container').html('');


	var url = new Array(window.resource_server+'/json/items/'+catID+'?site_id=1'); //prepopulate with the default for the category
	var categories = new Array();
	var urlStr = "";
	$('.delimiter_filter_on').each( function(index)
	{
		if($(this).attr('type')=='cat')
		{
			categories[categories.length] = $(this).attr('id');
		}
		else
		{
			urlStr += "&category[]="+$(this).attr('id');
		}
	});

	if(categories.length>0)
	{
		for(i=0;i<categories.length;i++)
		{
			url[i] = window.resource_server+'/json/items/'+categories[i]+'?site_id=1'+urlStr;
		}
	}
	else
	{
		url[0] = window.resource_server+'/json/items/'+catID+'?site_id=1'+urlStr;
	}

	for(var i=0; i<url.length; i++)
	{
		attractionCount = i;
		$.getJSON(url[i]+'&callback=?', function(data)
		{
			for(var j=0,jj=data.categories.length;j<jj;j++)
			{
				flattenArray(data.categories[j],"category");
			}

			//wait to sort the list until it is the last iteration
			if(attractionCount==url.length-1)
			{
				//this is no longer raw page for scrolling
				scrollCall = 'cooked';
				//sort the attractions
				attractionArr.sort(sortByTitle);
				//display the attractions
				$('#attractions_list_container').html('');
				var max   = 20;
				scrollKill=false;
				if(max>attractionArr.length)
				{
					max = attractionArr.length;
					scrollKill = true;
					$('#category_ajax_loader').hide();
				}
				for(var j=0; j<max; j++)
				{
					attractionArr[j].url = urlencode(attractionArr[j].title);// decodeURI(attractionArr[j].title).replace(/ /gi,'+').replace(/%26/gi,'%26amp;').toLowerCase();
				     sendToTemplate('attraction_template',attractionArr[j],'attractions_list_container');
				}
				if(attractionArr.length==0)
				{
					scrollKill = true;
					$('#attractions_list_container').html('<p style="padding:10px;">No attractions found</p>');
					$('#category_ajax_loader').hide();
				}
			}
			limitCategoryPause = false;
               return false;
		});

	}
	         limitCategoryPause = false;
              return false;
          }
          return true;
     });
}

function updateNextSetOfElements()
{
	//there are 20 elements displayed at a time but the array begins at 0!
	var count = (scrollSet*20);
	var max   = count+20;
	if(max>attractionArr.length)
	{
		max = attractionArr.length;
		scrollKill = true;
		$('#category_ajax_loader').hide();
	}

	//append the attractions to the list
	for(var i=count; i<max; i++)
	{
		sendToTemplate('attraction_template',attractionArr[i],'attractions_list_container');
	}

	//we have to increase the scroll set now that we've loaded our new elements
	scrollSet++;

	//what is the new location of the bottom?
	scrollListen = $('#footer').offset().top-50;
}


/*---CALENDAR PAGE---------------------------------------------*/
function calendarFlyout(method,control)
{
	if(method=="open")
	{
		//close any other open popups
		$('.event_popup_active').each(function()
		{
			$(this).removeClass('event_popup_active');
			$(this).addClass('event_popup_inactive');
		});
		//open the popup
		$(control).parent().find('.event_popup_inactive').removeClass('event_popup_inactive').addClass('event_popup_active');
		
		//prevent the popup from flying right off the page
		var x = $('.event_popup_active').offset().left + $('.event_popup_active').width();
		var y = $('#maincontent_top').offset().left + $('#maincontent_top').width();
		if(x>y){
			var c = ($('.event_popup_active').width() - (y - $('.event_popup_active').offset().left))*-1;
			$('.event_popup_active').css('marginLeft',c+'px');
		}
	}
	else if(method=="close")
	{
		//close all popups (slightly redundant since all but one should be closed)
		$('.event_popup_active').each(function()
		{
			 $(this).removeClass('event_popup_active');
			 $(this).addClass('event_popup_inactive');
		});
	}
	return false;
}

/*---CONTACT US-----------------------------*/
function expandForm(v,control)
{
    $(control).parent().parent().find('#'+v).slideToggle();
}

/* --------------------------------------------------------------------------------------------------------------------------------------------------------------------------
* ----------------------------------UTILITIES-------------------------------------------------------------------------------------------------------------------------------
* --------------------------------------------------------------------------------------------------------------------------------------------------------------------------
*/

//-----LANGUAGE--------------------------------------------------------------------------------------------------------------------------
//helpful for the PHP developers
//isset (true/false)
function isset(variable)
{
	if(typeof(variable) != "undefined")
	{
		return true;
	}
	else
	{
		return false;
	}
}

//explode an array
function explode(d, str)
{
	var exploded = str.split(d);
	return exploded;
}
//trim white space
function trim(stringToTrim) {
     return stringToTrim.replace(/^\s+|\s+$/g,"");
}

function urlencode(url) {
	return decodeURI(url).replace(/ /gi,'+').replace('/','').replace(/%26/gi,'%26amp;').toLowerCase();
}

//-----ARRAYS---------------------------------------------------------------------------------------------------------------------------
//remove item (string or number) from an array
function removeItem(originalArray, itemToRemove)
{
	var j = 0;
	while (j < originalArray.length)
	{
		//	alert(originalArray[j]);
		if (originalArray[j] == itemToRemove)
		{
			originalArray.splice(j, 1);
		}
		else
		{
			j++;
		}
	}

	return originalArray;
}

//sort an object/array by title
function sortByTitle(a, b)
{
	var x = a.title.toLowerCase();
	var y = b.title.toLowerCase();
	return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

function in_obj_array(a,v)
{
     for(var i=0; i<a.length; i++)
     {
          if(a[i].id==v)
          {
               return true;
          }
     }
     return false;
}

function in_map_array(a,v)
{
     for(var i=0; i<a.length; i++)
     {
          if(a[i][4]==v)
          {
               return true;
          }
     }
     return false;
}

function in_array(a,v)
{

	for(var i=0; i<a.length; i++)
	{
		if(a[i].indexOf("Array") == -1)
		{
			if(a[i]==v)
			{
			   return true;
			}
			else
			{
				return false;
			}
		}
		else
		{
			return in_array(a[i],v);
		}
	}
}


//-----COOKIES--------------------------------------------------------------------------------------------------------------------------
//set cookies
function SetCookie(name,value,days)
{
	if (days)
	{
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else
		var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

//read cookies
function ReadCookie(n)
{
	var cookiecontent = new String();
	if(document.cookie.length > 0)
	{
		var cookiename = n+ '=';
		var cookiebegin = document.cookie.indexOf(cookiename);
		var cookieend = 0;
		if(cookiebegin > -1)
		{
			cookiebegin += cookiename.length;
			cookieend = document.cookie.indexOf(";",cookiebegin);
			if(cookieend < cookiebegin)
			{
				cookieend = document.cookie.length;
			}
			cookiecontent = document.cookie.substring(cookiebegin,cookieend);
		}
	}
	return unescape(cookiecontent);
} // function ReadCookie()

//delete cookies
function DeleteCookie(name)
{
	SetCookie(name,'',-1);
}

//-----Validation--------------------------------------------------------------------------------------------------------------------------
function validateEmail(address) {
	if(address.length > 5)
	{
		var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
		if(reg.test(address) == false)
		{
		  return 'Invalid Email Address';
		}
		else
		{
			return '';
		}
	}
}

//-----TEMPLATES--------------------------------------------------------------------------------------------------------------------------
/* jQuery Templates Plugin 1.0.0pre
 * /web/20130902064039/http://github.com/jquery/jquery-tmpl
 * Requires jQuery 1.4.2
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * /web/20130902064039/http://jquery.org/license
 */
(function (a)
{
	var r = a.fn.domManip, d = "_tmplitem", q = /^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /, b = {}, f = {}, e, p = {key: 0, data: {}}, i = 0, c = 0, l = [];
	function g(e, d, g, h)
	{
		var c = {data: h || (d ? d.data : {}), _wrap: d ? d._wrap : null, tmpl: null, parent: d || null, nodes: [], calls: u, nest: w, wrap: x, html: v, update: t};
		e && a.extend(c, e, {nodes: [], parent: d});
		if (g)
		{
			c.tmpl = g;
			c._ctnt = c._ctnt || c.tmpl(a, c);
			c.key = ++i;
			(l.length ? f : b)[i] = c
		}
		return c
	}

	a.each({appendTo: "append", prependTo: "prepend", insertBefore: "before", insertAfter: "after", replaceAll: "replaceWith"}, function (f, d)
	{
		a.fn[f] = function (n)
		{
			var g = [], i = a(n), k, h, m, l, j = this.length === 1 && this[0].parentNode;
			e = b || {};
			if (j && j.nodeType === 11 && j.childNodes.length === 1 && i.length === 1)
			{
				i[d](this[0]);
				g = this
			}
			else
			{
				for (h = 0, m = i.length; h < m; h++)
				{
					c = h;
					k = (h > 0 ? this.clone(true) : this).get();
					a(i[h])[d](k);
					g = g.concat(k)
				}
				c = 0;
				g = this.pushStack(g, f, i.selector)
			}
			l = e;
			e = null;
			a.tmpl.complete(l);
			return g
		}

	});

	a.fn.extend({tmpl: function (d, c, b)
		{
			return a.tmpl(this[0], d, c, b)
		}, tmplItem: function ()

		{
			return a.tmplItem(this[0])
		}, template: function (b)

		{
			return a.template(b, this[0])
		}, domManip: function (d, m, k)

		{
			if (d[0] && a.isArray(d[0]))
			{
				var g = a.makeArray(arguments), h = d[0], j = h.length, i = 0, f;
				while (i < j && !(f = a.data(h[i++], "tmplItem")));
				if (f && c)
					g[2] = function (b)
					{
						a.tmpl.afterManip(this, b, k)
					};

				r.apply(this, g)
			}
			else
				r.apply(this, arguments);
			c = 0;
			!e && a.tmpl.complete(b);
			return this
		}});

	a.extend({tmpl: function (d, h, e, c)
		{
			var i, k = !c;
			if (k)
			{
				c = p;
				d = a.template[d] || a.template(null, d);
				f = {}
			}
			else if (!d)
			{
				d = c.tmpl;
				b[c.key] = c;
				c.nodes = [];
				c.wrapped && n(c, c.wrapped);
				return a(j(c, null, c.tmpl(a, c)))
			}
			if (!d)
				return [];
			if (typeof h === "function")
				h = h.call(c || {});
			e && e.wrapped && n(e, e.wrapped);
			i = a.isArray(h) ? a.map(h, function (a)
			{
				return a ? g(e, c, d, a) : null
			}) : [g(e, c, d, h)];

			return k ? a(j(c, null, i)) : i
		}, tmplItem: function (b)

		{
			var c;
			if (b instanceof a)
				b = b[0];
			while (b && b.nodeType === 1 && !(c = a.data(b, "tmplItem")) && (b = b.parentNode));
			return c || p
		}, template: function (c, b)

		{
			if (b)
			{
				if (typeof b === "string")
					b = o(b);
				else if (b instanceof a)
					b = b[0] || {};
				if (b.nodeType)
					b = a.data(b, "tmpl") || a.data(b, "tmpl", o(b.innerHTML));
				return typeof c === "string" ? (a.template[c] = b) : b
			}
			return c ? typeof c !== "string" ? a.template(null, c) : a.template[c] || a.template(null, q.test(c) ? c : a(c)) : null
		}, encode: function (a)

		{
			return ("" + a).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;")
		}});

	a.extend(a.tmpl, {tag: {tmpl: {_default: {$2: "null"}, open: "if($notnull_1){_=_.concat($item.nest($1,$2));}"}, wrap: {_default: {$2: "null"}, open: "$item.calls(_,$1,$2);_=[];", close: "call=$item.calls();_=call._.concat($item.wrap(call,_));"}, each: {_default: {$2: "$index, $value"}, open: "if($notnull_1){$.each($1a,function($2){with(this){", close: "}});}"}, "if": {open: "if(($notnull_1) && $1a){", close: "}"}, "else": {_default: {$1: "true"}, open: "}else if(($notnull_1) && $1a){"}, html: {open: "if($notnull_1){_.push($1a);}"}, "=": {_default: {$1: "$data"}, open: "if($notnull_1){_.push($.encode($1a));}"}, "!": {open: ""}}, complete: function ()
		{
			b = {}
		}, afterManip: function (f, b, d)

		{
			var e = b.nodeType === 11 ? a.makeArray(b.childNodes) : b.nodeType === 1 ? [b] : [];
			d.call(f, b);
			m(e);
			c++
		}});

	function j(e, g, f)
	{
		var b, c = f ? a.map(f, function (a)
		{
			return typeof a === "string" ? e.key ? a.replace(/(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g, "$1 " + d + '="' + e.key + '" $2') : a : j(a, e, a._ctnt)
		}) : e;

		if (g)
			return c;
		c = c.join("");
		c.replace(/^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/, function (f, c, e, d)
		{
			b = a(e).get();
			m(b);
			if (c)
				b = k(c).concat(b);
			if (d)
				b = b.concat(k(d))
		});

		return b ? b : k(c)
	}

	function k(c)
	{
		var b = document.createElement("div");
		b.innerHTML = c;
		return a.makeArray(b.childNodes)
	}

	function o(b)
	{
		return new Function("jQuery", "$item", "var $=jQuery,call,_=[],$data=$item.data;with($data){_.push('" + a.trim(b).replace(/([\\'])/g, "\\$1").replace(/[\r\t\n]/g, " ").replace(/\$\{([^\}]*)\}/g, "{{= $1}}").replace(/\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g, function (m, l, k, d, b, c, e)
		{
			var j = a.tmpl.tag[k], i, f, g;
			if (!j) throw "Template command not found: " + k;
			i = j._default || [];
			if (c && !/\w$/.test(b))
			{
				b += c;
				c = ""
			}
			if (b)
			{
				b = h(b);
				e = e ? "," + h(e) + ")" : c ? ")" : "";
				f = c ? b.indexOf(".") > -1 ? b + h(c) : "(" + b + ").call($item" + e : b;
				g = c ? f : "(typeof(" + b + ")==='function'?(" + b + ").call($item):(" + b + "))"
			}
			else
				g = f = i.$1 || "null";
			d = h(d);
			return "');" + j[l ? "close" : "open"].split("$notnull_1").join(b ? "typeof(" + b + ")!=='undefined' && (" + b + ")!=null" : "true").split("$1a").join(g).split("$1").join(f).split("$2").join(d ? d.replace(/\s*([^\(]+)\s*(\((.*?)\))?/g, function (d, c, b, a)
			{
				a = a ? "," + a + ")" : b ? ")" : "";
				return a ? "(" + c + ").call($item" + a : d
			}) : i.$2 || "") + "_.push('"

		}) + "');}return _;")

	}

	function n(c, b)
	{
		c._wrap = j(c, true, a.isArray(b) ? b : [q.test(b) ? b : a(b).html()]).join("")
	}

	function h(a)
	{
		return a ? a.replace(/\\'/g, "'").replace(/\\\\/g, "\\") : null
	}

	function s(b)
	{
		var a = document.createElement("div");
		a.appendChild(b.cloneNode(true));
		return a.innerHTML
	}

	function m(o)
	{
		var n = "_" + c, k, j, l = {}, e, p, h;
		for (e = 0, p = o.length; e < p; e++)
		{
			if ((k = o[e]).nodeType !== 1)
				continue;
			j = k.getElementsByTagName("*");
			for (h = j.length - 1; h >= 0; h--)
				m(j[h]);
			m(k)
		}
		function m(j)
		{
			var p, h = j, k, e, m;
			if (m = j.getAttribute(d))
			{
				while (h.parentNode && (h = h.parentNode).nodeType === 1 && !(p = h.getAttribute(d)));
				if (p !== m)
				{
					h = h.parentNode ? h.nodeType === 11 ? 0 : h.getAttribute(d) || 0 : 0;
					if (!(e = b[m]))
					{
						e = f[m];
						e = g(e, b[h] || f[h]);
						e.key = ++i;
						b[i] = e
					}
					c && o(m)
				}
				j.removeAttribute(d)
			}
			else if (c && (e = a.data(j, "tmplItem")))
			{
				o(e.key);
				b[e.key] = e;
				h = a.data(j.parentNode, "tmplItem");
				h = h ? h.key : 0
			}
			if (e)
			{
				k = e;
				while (k && k.key != h)
				{
					k.nodes.push(j);
					k = k.parent
				}
				delete e._ctnt;
				delete e._wrap;
				a.data(j, "tmplItem", e)
			}
			function o(a)
			{
				a = a + n;
				e = l[a] = l[a] || g(e, b[e.parent.key + n] || e.parent)
			}

		}

	}

	function u(a, d, c, b)
	{
		if (!a)
			return l.pop();
		l.push({_: a, tmpl: d, item: this, data: c, options: b})
	}

	function w(d, c, b)
	{
		return a.tmpl(a.template(d), c, b, this)
	}

	function x(b, d)
	{
		var c = b.options || {};
		c.wrapped = d;
		return a.tmpl(a.template(b.tmpl), b.data, c, b.item)
	}

	function v(d, c)
	{
		var b = this._wrap;
		return a.map(a(a.isArray(b) ? b.join("") : b).filter(d || "*"), function (a)
		{
			return c ? a.innerText || a.textContent : a.outerHTML || s(a)
		})

	}

	function t()
	{
		var b = this.nodes;
		a.tmpl(null, null, null, this).insertBefore(b[0]);
		a(b).remove()
	}

})(jQuery)

//create template
function sendToTemplate(templateID,variable,container)
{

	$( "#"+templateID ).tmpl( variable, {
		getLanguages: function( separator )
		{
			return this.data.Languages.join( separator );
		}

	}).appendTo( "#"+container );

}

//-----DO TIMEOUT--------------------------------------------------------------------------------------------------------------------------
/* used to compensate for the scroll
 * jQuery doTimeout: Like setTimeout, but better! - v1.0 - 3/3/2010
 * /web/20130902064039/http://benalman.com/projects/jquery-dotimeout-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * /web/20130902064039/http://benalman.com/about/license/
 */
(function($)
{
	var a={},c="doTimeout",d=Array.prototype.slice;
	$[c]= function()
	{
		return b.apply(window,[0].concat(d.call(arguments)))
	};

	$.fn[c]= function()
	{
		var f=d.call(arguments),e=b.apply(this,[c+f[0]].concat(f));
		return typeof f[0]==="number"||typeof f[1]==="number"?this:e
	};

	function b(l)
	{
		var m=this,h,k={},g=l?$.fn:$,n=arguments,i=4,f=n[1],j=n[2],p=n[3];
		if(typeof f!=="string")
		{
			i--;
			f=l=0;
			j=n[1];
			p=n[2]
		}
		if(l)
		{
			h=m.eq(0);
			h.data(l,k=h.data(l)||{})
		}
		else
		{
			if(f)
			{
				k=a[f]||(a[f]={})
			}
		}
		k.id&&clearTimeout(k.id);
		delete k.id;
		function e()
		{
			if(l)
			{
				h.removeData(l)
			}
			else
			{
				if(f)
				{
					delete a[f]
				}
			}
		}

		function o()
		{
			k.id=setTimeout( function()
			{
				k.fn()
			},j)

		}

		if(p)
		{
			k.fn= function(q)
			{
				if(typeof p==="string")
				{
					p=g[p]
				}p.apply(m,d.call(n,i))===true&&!q?o():e()
			};

			o()
		}
		else
		{
			if(k.fn)
			{
				j===undefined?e():k.fn(j===false);
				return true
			}
			else
			{
				e()
			}
		}
	}

})(jQuery);

/*Popup Window*/
function popUp(URL,title)
{
	if(!isset(title))
	{
		title = document.title;
	}

	newwindow = window.open(URL, title, 'toolbar=0','scrollbars=1','location=0','statusbar=0','menubar=0','resizable=0','width=600','height=500');

	if(window.focus)
	{
		newwindow.focus();
	}
}

/* MODAL WINDOW v1.2 */
function openModal(data)
{
	$('#modalData').html('<img src="images/common/ajax-loader.gif" alt="loading content" title="loading..." align="center" />');
	$('#modalWindow').fadeIn('fast');
	$('#modalBK').fadeTo('slow',.4);
	if(isset(data))
	{
		$('#modalData').html(data);
	}
}

function closeModal()
{
	$('#modalWindow').fadeOut();
	$('#modalBK').fadeOut('fast', function()
	{
		$('#modalData').html('');
	});

}

function updateModal(data)
{
	$('#modalData').html(data);
}