require('./index.css');

window.initMap = function() {
    // MAP STYLES
    var styles = [
        {
            stylers: [
                { hue: "#ff8663" },
                { saturation: -20 }
            ]
        },{
            featureType: "road",
            elementType: "geometry",
            stylers: [
                { lightness: 100 },
                { visibility: "simplified" }
            ]
        },{
            featureType: "road",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }
    ];
    var styledMap = new google.maps.StyledMapType(styles,
        {name: "Styled Map"});

    var mapOptions = {
        zoom: 16,
        center: {lat: 55.752484, lng: 37.614513},
        disableDefaultUI: true,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }
    }
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    map.mapTypes.set('map_style', styledMap);
    map.setMapTypeId('map_style');

    //VARIABLES
    var modal = document.querySelector('.modal'),
        locationTitleComments = document.querySelector('.modal__title'),
        userNameInput = document.querySelector('.userName'),
        locationTitleInput = document.querySelector('.locationName'),
        commentTextInput = document.querySelector('.add-comment__text'),
        userNameComments = document.querySelector('.comments__name'),
        locationAndDateInfo = document.querySelector('.comments__info');

    // CREATE MARKER AND COMMENTS
    map.addListener('click', function (e) {
        var x = e.pixel.x;
        var y = e.pixel.y;
        var lat = e.latLng.lat();
        var lng = e.latLng.lng();

        modal.style.display = 'block';
        modal.style.top = y + 'px';
        modal.style.left = x + 'px';

        modal.addEventListener('click',function (e) {
            var closeButton = modal.querySelector('.close-button');
            if (e.target != closeButton) {
                return;
            }
            modal.style.display = 'none';
        })

        modal.addEventListener('click', function (e) {
            var addButton = modal.querySelector('.add-button');
            if (e.target != addButton) {
                return;
            }
            var userName = userNameInput.value,
                locationTitle = locationTitleInput.value,
                commentText = commentTextInput.value;

            var marker2 = new google.maps.Marker({
                position: {lat: lat, lng: lng},
                map: map,
                comments: []
            })

            marker2.comments.push({
                locationTitle: locationTitle,
                userName: userName,
                commentText: commentText
            })

            console.log(marker2.comments);

            userNameInput.value = '';
            locationTitleInput.value = '';
            commentTextInput.value = '';
        })

    })

    function renderComments() {

    }
}


