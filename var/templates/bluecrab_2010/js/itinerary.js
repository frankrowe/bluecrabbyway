var startLatLng = null;
var startAdd = null;
var locationHolder = new Array();
var itinerary = true;
var ItineraryMarkers = [];
var de = new Array();
var temp;

function codeAddress(address,print)
{
	ntptEventTag("ev=Custom_Starting_Address;address="+address);

     if(trim(address).length>0)
     {
	if (startAdd != address)
	{
		if (startLatLng != null) //reset the original starting point marker but only if it exists
		{
			startLatLng = null;
		}
		startAdd = address; //we don't want to relook up addressess so store what's been passed in
		if(!isset(print))
		{
		     $('#startlocation > #address').html(startAdd);
		     $('#startlocation').slideDown();
          }

		geocoder.geocode({
			'address': address
		}, function (results, status)
		{
			if (status == google.maps.GeocoderStatus.OK)
			{
				//set the startLatLng up
				startLatLng = results[0].geometry.location; //store this location, because in the future we will not relook it up
				updateItemCount();
				//update the locationAr and put the directions on the map
				updateDirections();

			}
			else
			{
				alert("Geocode was not successful for the following reason: " + status);
			}
		});
	}
	}
}

var directions = new Array();
var directionsLength = 0
var waitToEncodeDirections = false;
var waitToGetDirections = true;
var GeoCodeQuePause = false;
var control = new Array();

function updateDirections()
{
	//flush the arrays
	directions.length=0;
	directionsLength= -1;
	locationHolder.length = 0;
	//if a start location exists, build it
	if (startAdd != null)
	{
		locationHolder[0] = new Array('Your starting location', startAdd, startLatLng);
		var startCounter = 1;
	}
	else
	{
		var startCounter = 0;
	}
	//1 loop through our attractions
	$('.itinerary_item').each( function (index)
	{
		control[index] = $(this);

		$.doTimeout(100,function(){
		if(GeoCodeQuePause==false)
		{
			directionsLength++;
			directions[directionsLength] = new Object();
			directions[directionsLength].latlng = null;
			directions[directionsLength].title = $(control[directionsLength]).find('.title_text').html();
			directions[directionsLength].address = $(control[directionsLength]).find('.address').text();
			directions[directionsLength].id = $(control[directionsLength]).attr('id').substr(12);


			if($(control[directionsLength]).attr('lat')!="" && $(control[directionsLength]).attr('lng')!="")
			{
				//if we don’t have to geocode
				var templat = $(control[directionsLength]).attr('lat');
				var templng = $(control[directionsLength]).attr('lng');

				directions[directionsLength].latlng = new google.maps.LatLng(templat, templng);
			}
			else
			{
				GeoCodeQuePause = true;

				waitToEncodeDirections = true;

				geocoder.geocode({
				'address': directions[directionsLength].address
				}, function (results, status)
				{
					if (status == google.maps.GeocoderStatus.OK)
					{
						$(control[directionsLength]).attr('lat',results[0].geometry.location.xa);

						$(control[directionsLength]).attr('lng',results[0].geometry.location.za);

						directions[directionsLength].latlng = results[0].geometry.location;

						waitToEncodeDirections = false;

						GeoCodeQuePause = false;
					}
					else
					{
						removeAttraction(directions[directionsLength].id, 'page', true);
						alert(status+"We had trouble finding the address for "+directions[directionsLength].title+". We appologize for the inconvenience and have removed it from your itinerary.");
						waitToEncodeDirections = false;
					}
				});

			}

			return false;
		}
		return true;
		});
	});

	$.doTimeout('geocode',100,function(){
		if(waitToEncodeDirections == false) {
			for(var i=0; i<directions.length; i++)
			{
				locationHolder[locationHolder.length] = new Array(directions[i].title, directions[i].address, directions[i].latlng)
			}
			//2) clear the map and directions, no matter what we will do it next
			//a) wipe the directions off the map
			directionsDisplay.setMap(null);
			//b) clear our custom markers
			if (ItineraryMarkers.length > 0)
			{
				clearItineraryMarkers();
			}
			//c)clear the directions holder
			$('#directions_container').html('');

			//3) if there is at least two points, get directions
			if (locationHolder.length > 0)
			{
				calcRoute();
			}
			return false;
		}
		return true;
	});
}

function calcRoute()
{
	var start = locationHolder[0][2];
	var end = locationHolder[locationHolder.length - 1][2];
	var waypts = [];

	for (var i = 1; i < locationHolder.length - 1; i++)
	{
		waypts.push({
			location: locationHolder[i][2],
			stopover: true
		});
	}

	if (locationHolder.length > 1)
	{
		var request = {
			origin: start,
			destination: end,
			waypoints: waypts,
			travelMode: google.maps.DirectionsTravelMode.DRIVING
		};

		directionsService.route(request, function (result, status)
		{
			if (status == google.maps.DirectionsStatus.OK)
			{

				parseDirections(result);

				directionsDisplay.setMap(map);
				directionsDisplay.setDirections(result);
			}
		});

	}

	for (var i = 0; i < locationHolder.length; i++)
	{
		horizontalPos = 25 * i;
		var icon = new google.maps.MarkerImage(window.base_href+"images/itinerary/item_count_sprite.png", new google.maps.Size(25, 25), new google.maps.Point(horizontalPos, 0));

		var marker = new google.maps.Marker({
			'position': locationHolder[i][2],
			//'map': map,
			'icon': icon,
			'title': locationHolder[i][0]
		});
		ItineraryMarkers.push(marker);
	}
	showItineraryMarkers();

}

function clearItineraryMarkers()
{
	if (ItineraryMarkers)
	{
		for (i in ItineraryMarkers)
		{
			ItineraryMarkers[i].setMap(null);
		}
	}
	ItineraryMarkers.length = 0;
}

function showItineraryMarkers()
{
	for (i in ItineraryMarkers)
	{
		ItineraryMarkers[i].setMap(map);
	}
}

function parseDirections(obj)
{
	obj = obj.routes[0];
	//loop through each leg (from start>each waypoint>finish)
	for (var i = 0; i <= obj.legs.length; i++)
	{
		if (i != obj.legs.length)
		{
			var tempDistance = obj.legs[i].distance.text;
			var tempDuration = obj.legs[i].duration.text;
		}
		else
		{
			var tempDistance = "";
			var tempDuration = "";
		}
		//get the attraction the directions are beggining from
		var directions_title = ({
				count: i + 1,
				title: locationHolder[i][0],
				address: locationHolder[i][1],
				distance: tempDistance,
				duration: tempDuration
			});
		de[i] = directions_title;
		de[i]['legs'] = new Array();
		sendToTemplate('directions_title_template', directions_title, 'directions_container');

		directionsPrint = obj;

		//loop through all the steps from this location to the next
		if (i < obj.legs.length)
		{
			for (var j = 0; j < obj.legs[i].steps.length; j++)
			{
				var directions_content = ({
						count: j + 1,
						instruction: obj.legs[i].steps[j].instructions,
						distance: obj.legs[i].steps[j].distance.text
					});
				de[i]['legs'][j] = directions_content;
				sendToTemplate('directions_content_template', directions_content, 'directions_container');
			}
		}
	}
}

function EmailMe(form)
{

     $(form).find('#hdnBody').val(encodeURIComponent(JSON.stringify(de)));

    $.post('/contacts/email', $(form).serialize(), function (data)
    {
	 data = $.parseJSON(data);

	    if(data.response.emailResponse)
	    {
	    	ntptEventTag("ev=Email_Itinerary");
		    updateModal($('#email_thankyou').html());
	    }
	    else
	    {
	    	ntptEventTag("ev=Email_Itinerary:Validation_Error");
		    //display send errors
		    $(form).find('#fnameErrors').html(data.error.fname);
		    $(form).find('#lnameErrors').html(data.error.fname);
		    $(form).find('#emailErrors').html(data.error.email);
		    $(form).find('#noitemsErrors').html(data.error.noitems);
		    $(form).find('#streetErrors').html(data.error.street);
		    $(form).find('#cityErrors').html(data.error.city);
		    $(form).find('#stateErrors').html(data.error.state);
		    $(form).find('#zipErrors').html(data.error.zip);
		    $(form).find('#commentsErrors').html(data.error.comments);

	    }
    });

    return false;
}

function PrintMe()
{
	 ntptEventTag("ev=Print_Itinerary");
     openPopupWindow('/itinerary/print?address='+$('#address').html(), 'Print Itinerary', 700, 600);
}

var myPopupWindow = '';
function openPopupWindow(url, name, width, height)
{
    //Remove special characters from name
    name = name.replace(/\/|\-|\./gi, "");

    //Remove whitespaces from name
    var whitespace = new RegExp("\\s","g");
    name = name.replace(whitespace,"");

    //If it is already open
    if (!myPopupWindow.closed && myPopupWindow.location)
    {
        myPopupWindow.location.href = encodeUrl(url);
    }
    else
    {
        myPopupWindow= window.open(encodeUrl(url),name, "scrollbars=yes, resizable=yes, width=" + width + ", height=" + height );
        if (!myPopupWindow.opener) myPopupWindow.opener = self;
    }

     //If my main window has focus - set it to the popup
    if (window.focus) {myPopupWindow.focus()}
}
function encodeUrl(url)
{
     if (url.indexOf("?")>0)
     {
          encodedParams = "?";
          parts = url.split("?");
          params = parts[1].split("&");
          for(i = 0; i < params.length; i++)
          {
               if (i > 0)
               {
                    encodedParams += "&";
               }
               if (params[i].indexOf("=")>0) //Avoid null values
               {
                    p = params[i].split("=");
                    encodedParams += (p[0] + "=" + escape(encodeURI(p[1])));
               }
               else
               {
                    encodedParams += params[i];
               }
          }
          url = parts[0] + encodedParams;
     }
     return url;
}
