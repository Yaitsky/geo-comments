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
    markersArray: [],
    markersCounter: 0,
    lats: [],
    lngs: [],
    clickOnMarkerFlag: false,
    currentIndex: 0,
    initListeners: function() {
        //VARIABLES
        this.modal = document.querySelector('.modal');
        this.closeButton = this.modal.querySelector('.close-button');
        this.addButton = this.modal.querySelector('.add-button');

        this.locationTitleComments = document.querySelector('.modal__title-text');

        this.commentsList = document.querySelector('.comments__list');
        this.userNameInput = document.querySelector('.userName');
        this.locationTitleInput = document.querySelector('.locationName');
        this.commentTextInput = document.querySelector('.add-comment__text');

        var self = this;
        // CREATE MARKER AND COMMENTS
        this.closeButton.addEventListener('click', this.closeModal.bind(this));
        this.addButton.addEventListener('click', this.addMarkerAndComment.bind(this));

        var markerCluster = new MarkerClusterer(myMap, this.markersArray,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m1.png'});

        myMap.addListener('zoom_changed', function () {
            self.refreshCluster();
        })

        myMap.addListener('click', function (e) {
            var x = window.event.pageX;
            var y = window.event.pageY;
            self.lat = e.latLng.lat();
            self.lng = e.latLng.lng();
            this.clickOnMarkerFlag = false;

            //reverse  geocoding to get address
            var latlng = {lat: self.lat, lng: self.lng};
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'location': latlng}, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    mapWorker.locationAddress = results[0].formatted_address;
                    mapWorker.locationTitleComments.innerText = mapWorker.locationAddress;
                }
            })

            // show modal window
            self.commentsList.innerHTML = '';
            self.modal.style.display = 'block';
            self.modal.style.top = y + 'px';
            self.modal.style.left = x + 'px';

        });
    },
    closeModal: function () {
        this.modal.style.display = 'none';
    },
    addMarkerAndComment: function () {
        var userName = this.userNameInput.value,
            locationTitle = this.locationTitleInput.value,
            commentText = this.commentTextInput.value;

        if (this.lats.indexOf(this.lat) < 0 && this.lngs.indexOf(this.lng) < 0) {

            this.markersArray[this.markersCounter] = new google.maps.Marker({
                position: {lat: this.lat, lng: this.lng},
                map: myMap,
                comments: []
            });

            this.markersArray[this.markersCounter].location = this.locationAddress;

            this.markersArray[this.markersCounter].comments.push({
                locationTitle: locationTitle,
                userName: userName,
                commentText: commentText,
                commentDate: this.getCommentDate()
            });

            this.userNameInput.value = '';
            this.locationTitleInput.value = '';
            this.commentTextInput.value = '';

            this.commentsList.innerHTML = this.createComments(this.markersArray[this.markersCounter].comments);

            this.markersArray[this.markersCounter].addListener('click', this.clickOnMarkerAndShowModal);

            this.markersCounter++;

            this.lats = [];
            this.lngs = [];
            for (var i = 0; i < this.markersArray.length; i++) {
                this.lats.push(this.markersArray[i].position.lat());
                this.lngs.push(this.markersArray[i].position.lng());
            }

            //marker clustering

            this.refreshCluster();

        } else {
            var markerIndex;
            if (this.clickOnMarkerFlag === true) {
                markerIndex = this.currentIndex;
            } else {
                markerIndex = this.lats.indexOf(this.lat);
            }

            this.markersArray[markerIndex].comments.push({
                locationTitle: locationTitle,
                userName: userName,
                commentText: commentText,
                commentDate: this.getCommentDate()
            });

            this.commentsList.innerHTML = this.createComments(this.markersArray[markerIndex].comments);

            this.userNameInput.value = '';
            this.locationTitleInput.value = '';
            this.commentTextInput.value = '';
        }
    },
    createComments: function (comments) {
        var templateFn = require('../comment-template.hbs');

        return templateFn({
            comments: comments
        });
    },
    getCommentDate: function () {
        var Data = new Date();
        var year = Data.getFullYear();
        var month = Data.getMonth();
        var data = Data.getDate();
        var fMonth;

        switch (month)
        {
            case 0: fMonth="января"; break;
            case 1: fMonth="февраля"; break;
            case 2: fMonth="марта"; break;
            case 3: fMonth="апреля"; break;
            case 4: fMonth="мая"; break;
            case 5: fMonth="июня"; break;
            case 6: fMonth="июля"; break;
            case 7: fMonth="августа"; break;
            case 8: fMonth="сентября"; break;
            case 9: fMonth="октября"; break;
            case 10: fMonth="ноября"; break;
            case 11: fMonth="декабря"; break;
        }

        var currentDate = data + ' ' + fMonth + ' '+ year + ' г.';

        return currentDate;
    },
    clickOnMarkerAndShowModal: function () {
        var x = window.event.pageX;
        var y = window.event.pageY;

        mapWorker.currentIndex = mapWorker.lats.indexOf(this.position.lat());
        mapWorker.clickOnMarkerFlag = true;

        mapWorker.locationTitleComments.innerText = this.location;
        mapWorker.modal.style.display = 'block';
        mapWorker.modal.style.top = y + 'px';
        mapWorker.modal.style.left = x + 'px';

        mapWorker.commentsList.innerHTML = mapWorker.createComments(this.comments);
    },
    refreshCluster: function () {
        var mcOptions = {styles: [{
            height: 66,
            url: "https://www.lodge.co.nz/realestate/assets/images/m3.png",
            width: 66,
            textSize: 13,
            textColor: '#ffffff'
        }]};

        var markerCluster = new MarkerClusterer(myMap, this.markersArray, mcOptions);
    }
}


