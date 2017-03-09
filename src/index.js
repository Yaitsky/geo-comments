// require('./index.css');
//
// window.initMap = function() {
//     // MAP STYLES
//     var styles = [
//         {
//             stylers: [
//                 { hue: "#ff8663" },
//                 { saturation: -20 }
//             ]
//         },{
//             featureType: "road",
//             elementType: "geometry",
//             stylers: [
//                 { lightness: 100 },
//                 { visibility: "simplified" }
//             ]
//         },{
//             featureType: "road",
//             elementType: "labels",
//             stylers: [
//                 { visibility: "off" }
//             ]
//         }
//     ];
//     var styledMap = new google.maps.StyledMapType(styles,
//         {name: "Styled Map"});
//
//     var mapOptions = {
//         zoom: 16,
//         center: {lat: 55.752484, lng: 37.614513},
//         disableDefaultUI: true,
//         mapTypeControlOptions: {
//             mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
//         }
//     }
//     var map = new google.maps.Map(document.getElementById('map'), mapOptions);
//
//     map.mapTypes.set('map_style', styledMap);
//     map.setMapTypeId('map_style');
//
//     //VARIABLES
//     var modal = document.querySelector('.modal'),
//         locationTitleComments = document.querySelector('.modal__title'),
//         userNameInput = document.querySelector('.userName'),
//         locationTitleInput = document.querySelector('.locationName'),
//         commentTextInput = document.querySelector('.add-comment__text'),
//         userNameComments = document.querySelector('.comments__name'),
//         locationAndDateInfo = document.querySelector('.comments__info');
//
//     // CREATE MARKER AND COMMENTS
//     map.addListener('click', function (e) {
//         var x = e.pixel.x;
//         var y = e.pixel.y;
//         var lat = e.latLng.lat();
//         var lng = e.latLng.lng();
//
//         modal.style.display = 'block';
//         modal.style.top = y + 'px';
//         modal.style.left = x + 'px';
//
//         modal.addEventListener('click',function (e) {
//             var closeButton = modal.querySelector('.close-button');
//             if (e.target != closeButton) {
//                 return;
//             }
//             modal.style.display = 'none';
//         })
//
//         modal.addEventListener('click', function (e) {
//             var addButton = modal.querySelector('.add-button');
//             if (e.target != addButton) {
//                 return;
//             }
//             var userName = userNameInput.value,
//                 locationTitle = locationTitleInput.value,
//                 commentText = commentTextInput.value;
//
//             var marker2 = new google.maps.Marker({
//                 position: {lat: lat, lng: lng},
//                 map: map,
//                 comments: []
//             })
//
//             marker2.comments.push({
//                 locationTitle: locationTitle,
//                 userName: userName,
//                 commentText: commentText
//             })
//
//             console.log(marker2.comments);
//
//             userNameInput.value = '';
//             locationTitleInput.value = '';
//             commentTextInput.value = '';
//         })
//
//     })
//
//     function renderComments() {
//
//     }
// }

require('./index.css');
var myMap;
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
    myMap = map;
    mapWorker.initListeners();
}

var mapWorker = {
    initListeners: function() {
        console.log(myMap, google)
        //VARIABLES
        this.modal = document.querySelector('.modal');
        this.locationTitleComments = document.querySelector('.modal__title');
        this.userNameInput = document.querySelector('.userName');
        this.locationTitleInput = document.querySelector('.locationName');
        this.commentTextInput = document.querySelector('.add-comment__text');
        this.userNameComments = document.querySelector('.comments__name');
        this.locationAndDateInfo = document.querySelector('.comments__info');
        this.markers = [];
        // CREATE MARKER AND COMMENTS
        var self = this;
        this.modal.addEventListener('click', this.checkClick.bind(this))

        myMap.addListener('click', function (e) {
            this.isCreated = false;
            console.log('catch!!!I am MAP', this.isCreated);
            var x = e.pixel.x;
            var y = e.pixel.y;
            self.lat = e.latLng.lat();
            self.lng = e.latLng.lng();

            self.modal.style.display = 'block';
            self.modal.style.top = y + 'px';
            self.modal.style.left = x + 'px';
        })
    },
    checkClick: function (e) {
        console.log(this.isCreated);
        var closeButton = this.modal.querySelector('.close-button');
        var addButton = this.modal.querySelector('.add-button');
        var userName = this.userNameInput.value,
            locationTitle = this.locationTitleInput.value,
            commentText = this.commentTextInput.value;
        if (e.target === closeButton) {
            this.modal.style.display = 'none';
        }
        if (e.target === addButton && !this.isCreated) {
            console.log(this.lat, this.lng);
            var marker2 = new google.maps.Marker({
                position: {lat: this.lat, lng: this.lng},
                map: myMap,
                comments: []
            })

            marker2.comments.push({
                locationTitle: locationTitle,
                userName: userName,
                commentText: commentText
            })
            marker2.addListener('click', function (e) {console.log('catch!!!I am MARKER')})
            this.userNameInput.value = '';
            this.locationTitleInput.value = '';
            this.commentTextInput.value = '';
            console.log('here ADD MARKER')

            this.markers.push(marker2);
            console.log(this.markers);
            this.isCreated = true;
        } else if (e.target === addButton) {
            console.log('here ADD CLUSTER')
            console.log(this.markers);
            this.markers[this.markers.length - 1].comments.push({
                locationTitle: locationTitle,
                userName: userName,
                commentText: commentText
            })
            this.userNameInput.value = '';
            this.locationTitleInput.value = '';
            this.commentTextInput.value = '';
            console.log(mapWorker.markers);
            this.isCreated = false;
        }
    }
}



