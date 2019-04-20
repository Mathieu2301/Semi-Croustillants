const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var today = Date.now();

var socket = io("ws://cloud1.usp-3.fr:7532/");

var planning = new Vue({
    el: '#planing_vue',
    data: {
        calendar: {
            year: new Date(today).getFullYear(),
            month: months[new Date(today).getMonth()],
            days: [],
            selected: 0,
            min: today,
        }
    },
    methods: {
        
    },
    filters: {
        date: function(time){
            var date = new Date(time);
            return (date.getFullYear() + "-" + addZeros(date.getMonth()+1) + "-" + addZeros(date.getDate()))
        }
    }
});

socket.on("connect", function(){

    socket.on("planning", function(days){
        planning.calendar.days = days;
    });

    $(function(){
        setTimeout(function(){
            $(".loader").fadeOut(300, function(){
                $(".body").fadeIn();
            })
        }, 500);
    });

})


function izitoast_show(title, message, error=false){
    iziToast.show({
        theme: 'dark',
        title: title,
        message: message,
        backgroundColor: (!error) ? "#181B2C" : "#c74343",
        progressBarColor: '#F3AD43',
        image: 'images/logo2.png',
        imageWidth: 70,
        layout: 2,
    });
}

function addZeros(val){return(val<10)?'0'+val:val}

$(function(){

    jQuery('img.svg').each(function(){
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');
    
        $.get(imgURL, function(data) {
            var $svg = jQuery(data).find('svg');
    
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass);
            }
            $svg = $svg.removeAttr('xmlns:a');
            if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
            }
            $img.replaceWith($svg);
        }, 'xml');
    });

});