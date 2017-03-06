require('./index.css');

window.initMap = function() {
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

    var marker = new google.maps.Marker({
        position: {lat: 55.747267, lng: 37.625242},
        map: map
    })

    map.addListener('click', function (e) {
        console.log(e);
        var modal = document.querySelector('.modal');
        var x = e.pixel.x;
        var y = e.pixel.y;
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
        var marker2 = new google.maps.Marker({
            position: {lat: e.latLng.lat(), lng: e.latLng.lng()},
            map:map
        })
    })
}


