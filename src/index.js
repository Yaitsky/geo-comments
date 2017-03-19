require('./index.css');
require('./markerclusterer.js');

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
    clusterClicked: false,
    currentIndex: 0,
    clusterData: [],
    currentSlide: 0,
    initListeners: function() {
        var self = this;

        //slider-window
        this.slider = document.querySelector('.slider');
        this.closeSlider = this.slider.querySelector('.close-slider');
        this.prevSlideButton = this.slider.querySelector('.previous-slide');
        this.nextSlideButton = this.slider.querySelector('.next-slide');
        this.sliderLocation = this.slider.querySelector('.slider__title');
        this.sliderMarkersList = this.slider.querySelector('.markers');
        this.sliderAddress = this.slider.querySelector('.location-title');
        this.sliderComments = this.slider.querySelector('.comments__list--slider');

        //modal-window
        this.modal = document.querySelector('.modal');
        this.closeButton = this.modal.querySelector('.close-button');
        this.addButton = this.modal.querySelector('.add-button');
        this.locationTitleComments = document.querySelector('.modal__title-text');
        this.commentsList = document.querySelector('.comments__list');
        this.userNameInput = document.querySelector('.userName');
        this.locationTitleInput = document.querySelector('.locationName');
        this.commentTextInput = document.querySelector('.add-comment__text');

        //clusters - slider events
        this.closeSlider.addEventListener('click', this.closeSliderWindow.bind(this));
        this.prevSlideButton.addEventListener('click', this.prevSlide);
        this.nextSlideButton.addEventListener('click', this.nextSlide);
        this.sliderAddress.addEventListener('click', this.openCommentsModal);

        // modal events
        this.closeButton.addEventListener('click', this.closeModal.bind(this));
        this.addButton.addEventListener('click', this.addMarkerAndComment.bind(this));

        // map events
        myMap.addListener('zoom_changed', function () {
            self.refreshCluster();
        })

        myMap.addListener('click', function (e) {
            var x = self.getCoordsForWindow('modal').x;
            var y = self.getCoordsForWindow('modal').y;

            self.lat = e.latLng.lat();
            self.lng = e.latLng.lng();

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
    getCoordsForWindow: function (flag) {
        var x = window.event.pageX;
        var y = window.event.pageY;

        var width,
            height;

        if (flag == 'modal') {
            width = 380;
            height = 525;
        } else {
            width = 380;
            height = 320;
        }

        if (x + width > document.documentElement.clientWidth) {
            var deltaX = document.documentElement.clientWidth - x - width - 25;
            x = x + deltaX;
        }

        if (y + height > document.documentElement.clientHeight) {
            var deltaY = document.documentElement.clientHeight - y - height - 25;
            y = y + deltaY;
        }

        return {
            x: x,
            y: y
        }
    },
    closeModal: function () {
        this.modal.style.display = 'none';
    },
    addMarkerAndComment: function () {
        var userName = this.userNameInput.value,
            locationTitle = this.locationTitleInput.value,
            commentText = this.commentTextInput.value;

        //проверка на то, что на модальное окно вышли со слайдера или щелчком на маркер
        var indexForNewLocation;
        var newLat,
            newLng;
        if (this.clickOnMarkerFlag === true) {
            indexForNewLocation = this.currentIndex;
            newLat = this.lats[this.currentIndex],
            newLng = this.lngs[this.currentIndex];
        } else {
            indexForNewLocation = this.markersCounter - 1;
            newLat = this.lat;
            newLng = this.lng;
        }

        if (this.lats.indexOf(this.lat) < 0 && this.lngs.indexOf(this.lng) < 0) {
            // первое условие - проверка текущих координат, на старом ли месте маркер
            this.markersArray[this.markersCounter] = new google.maps.Marker({
                position: {lat: this.lat, lng: this.lng},
                map: myMap,
                comments: []
            });
            //добавляем к маркеру информацию о геопозиции и счетчик маркеров (будет использован для доступа)
            this.markersArray[this.markersCounter].location = this.locationAddress;
            this.markersArray[this.markersCounter].index = this.markersCounter;
            //добавляем объект комментария
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
            //счетчик для создания новых маркеров в массиве
            this.markersCounter++;
            //здесь обновляется массив координат (он понадобится для дальнейщих проверок - первое условие)
            this.lats = [];
            this.lngs = [];
            for (var i = 0; i < this.markersArray.length; i++) {
                this.lats.push(this.markersArray[i].position.lat());
                this.lngs.push(this.markersArray[i].position.lng());
            }

            this.refreshCluster();

        } else if (this.markersArray[indexForNewLocation].comments[0].locationTitle !== locationTitle) {
            //второе условие - проверка на место отзыва, если оно не повторяется, то создается новый маркер
            this.markersArray[this.markersCounter] = new google.maps.Marker({
                position: {lat: newLat, lng: newLng},
                map: myMap,
                comments: []
            });
            //добавляем к маркеру информацию о геопозиции и счетчик маркеров (будет использован для доступа)
            this.markersArray[this.markersCounter].location = this.locationAddress;
            this.markersArray[this.markersCounter].index = this.markersCounter;
            //добавляем объект комментария
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
            //счетчик для создания новых маркеров в массиве
            this.markersCounter++;
            //здесь обновляется массив координат (он понадобится для дальнейщих проверок - первое условие)
            this.lats = [];
            this.lngs = [];
            for (var i = 0; i < this.markersArray.length; i++) {
                this.lats.push(this.markersArray[i].position.lat());
                this.lngs.push(this.markersArray[i].position.lng());
            }

            this.refreshCluster();
        } else {
            //последнее условие - просто добавляем отзывы к имеющимся маркерам
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
        //получаем дату в нужном формате
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
        //показываем модальное окно по щелчку на маркер, используем флажок для контроля
        var x = mapWorker.getCoordsForWindow('modal').x;
        var y = mapWorker.getCoordsForWindow('modal').y;

        mapWorker.currentIndex = mapWorker.lats.indexOf(this.position.lat());
        mapWorker.clickOnMarkerFlag = true;

        mapWorker.locationTitleComments.innerText = this.location;
        mapWorker.modal.style.display = 'block';
        mapWorker.modal.style.top = y + 'px';
        mapWorker.modal.style.left = x + 'px';

        mapWorker.commentsList.innerHTML = mapWorker.createComments(this.comments);
    },
    refreshCluster: function () {
        //обновляем кластеры и вешаем на них обработчики на открытие окна-слайдера
        var mcOptions = {
                styles: [{
                    height: 66,
                    url: "https://www.lodge.co.nz/realestate/assets/images/m3.png",
                    width: 66,
                    textSize: 13,
                    textColor: '#ffffff'
                    }],
                zoomOnClick: false
            };

        var markerCluster = new MarkerClusterer(myMap, this.markersArray, mcOptions);

        google.maps.event.addListener(markerCluster, "clusterclick", function (e) {
            mapWorker.clusterData = [];

            for (var i = 0; i < e.markers_.length; i++) {
                var item = {
                    location: e.markers_[i].location,
                    index: e.markers_[i].index,
                    comments: e.markers_[i].comments
                }
                mapWorker.clusterData.push(item);
            }

            var x = mapWorker.getCoordsForWindow('slider').x;
            var y = mapWorker.getCoordsForWindow('slider').y;

            mapWorker.slider.style.display = 'block';
            mapWorker.slider.style.top = y + 'px';
            mapWorker.slider.style.left = x + 'px';

            mapWorker.renderMarkers(mapWorker.clusterData.length);
            mapWorker.renderSliderWindow(0);
        });
    },
    closeSliderWindow: function () {
        this.slider.style.display = 'none';
    },
    renderSliderWindow: function (index) {
        //рендерим окно-слайдера по нужному номеру маркера в кластере
        mapWorker.currentSlide = index;
        mapWorker.sliderAddress.innerText = mapWorker.clusterData[index].location;
        mapWorker.sliderLocation.innerText = mapWorker.clusterData[index].comments[0].locationTitle;
        mapWorker.sliderComments.innerHTML = mapWorker.createComments(mapWorker.clusterData[index].comments);
        for (var i = 0; i < mapWorker.sliderMarkersList.querySelectorAll('.markers__item').length; i++) {
            mapWorker.sliderMarkersList.querySelectorAll('.markers__item')[i].style.color = '#000';
        }
        mapWorker.sliderMarkersList.querySelectorAll('.markers__item')[index].style.color = '#ff8663';
    },
    renderMarkers: function (length) {
        //рендерим список маркеров - табуляцию в слайдере и вешаем обработчики, меняем стили
        mapWorker.sliderMarkersList.innerHTML = '';
        for (var i = 0; i < length; i++) {
            var item = document.createElement('li');
            item.classList.add('markers__item');
            var index = i + 1;
            item.innerText = index.toString();
            mapWorker.sliderMarkersList.appendChild(item);

            item.addEventListener('click', function (e) {
                var newIndex = Number(e.target.innerText) - 1;
                mapWorker.renderSliderWindow(newIndex);

                for (var i = 0; i < mapWorker.sliderMarkersList.querySelectorAll('.markers__item').length; i++) {
                    mapWorker.sliderMarkersList.querySelectorAll('.markers__item')[i].style.color = '#000';
                }

                mapWorker.sliderMarkersList.querySelectorAll('.markers__item')[newIndex].style.color = '#ff8663';
            })
        }
    },
    prevSlide: function () {
        if (mapWorker.currentSlide > 0) {
            mapWorker.renderSliderWindow(mapWorker.currentSlide - 1);
        } else {
            mapWorker.renderSliderWindow(mapWorker.clusterData.length - 1);
        }
    },
    nextSlide: function () {
        if (mapWorker.currentSlide < mapWorker.clusterData.length - 1) {
            mapWorker.renderSliderWindow(mapWorker.currentSlide + 1);
        } else {
            mapWorker.renderSliderWindow(0);
        }
    },
    openCommentsModal: function () {
        //показываем модальное окно по кнопке из слайдера, используем флажок для контроля
        mapWorker.slider.style.display = 'none';

        var x = mapWorker.getCoordsForWindow('modal').x;
        var y = mapWorker.getCoordsForWindow('modal').y;

        mapWorker.currentIndex = mapWorker.clusterData[mapWorker.currentSlide].index;
        mapWorker.clickOnMarkerFlag = true;

        mapWorker.modal.style.display = 'block';
        mapWorker.modal.style.top = y + 'px';
        mapWorker.modal.style.left = x + 'px';
        mapWorker.locationTitleComments.innerText = mapWorker.clusterData[mapWorker.currentSlide].location;
        mapWorker.commentsList.innerHTML = mapWorker.createComments(mapWorker.clusterData[mapWorker.currentSlide].comments);
    }
}


