const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
var today = Date.now();

var socket = io("ws://cloud1.usp-3.fr:7532/");


var header_vue = new Vue({
    el: '#header_vue',
    data: {
        connected: false,
        MenuOpened: false
    },
    methods: {
        toggleMenu: function(){
            if (!this.MenuOpened){
                $("header>.right>.menu").show();
                setTimeout(()=> $("header>.right").addClass("opened"), 20);
                this.MenuOpened = true;
            }else{
                $("header>.right").removeClass("opened")
                setTimeout(function(){
                    $("header>.right>.menu").hide();
                }, 300)
                this.MenuOpened = false;
            }
        },
        openPlanning: function(){
            if (!login_vue.visible){
                planing_vue.visible = true;
                config_vue.visible = false;
            }
        },
        openConfig: function(){
            if (!login_vue.visible){
                planing_vue.visible = false;
                config_vue.visible = true;
            }
        },
        disconnect: function(){
            localStorage.removeItem("auth");
            reloadApp();
        }
    }
});

var login_vue = new Vue({
    el: '#login_vue',
    data: {
        visible: false,
        password: "",
        wrongpassword: "@@@@@@@@@"
    },
    methods: {
        login: function(e){
            e.preventDefault();
            if (this.password.length >= 5){
                socket.emit("admin_panel_login", {password: this.password}, function(rs){
                    if (rs.result){
                        localStorage.setItem("auth", rs.auth);
                        planing_vue.visible = true;
                        login_vue.visible = false;
                        header_vue.connected = true;
                        izitoast_show("Logged in", "You are logged in");
                    }else{
                        login_vue.wrongpassword = login_vue.password;
                        login_vue.visible = true;
                        izitoast_show("Error", rs.message, true);
                    }
                });
            }
        }
    }
});

var planing_vue = new Vue({
    el: '#planing_vue',
    data: {
        visible: false,
        calendar: {
            year: new Date(today).getFullYear(),
            month: months[new Date(today).getMonth()],
            days: [],
            selected: 0,
            min: today,
        },
        maps: {},
        requests: {},
        scrims: {}
    },
    methods: {
        selectDay: function(day){
            if (!day.impossible){
                this.calendar.selected = day;
                socket.emit("admin_edit_dispos", day.time, !day.prefer)
            }
        },
        contact: function(discordID){

            socket.emit("admin_addFriend", discordID, function(result){
                if (result.result){
                    izitoast_show("Done", "Opening discussion with " + discordID + " on Discord");
                    location.href = "discord://discordapp.com/channels/@me/" + result.DM;
                }else{
                    $('#clipboard').text(discordID);
                    var $temp=$("<input>");
                    $("body").append($temp);
                    $temp.val($('#clipboard').text()).select();
                    document.execCommand("copy");
                    $temp.remove();
                    $('#clipboard').text("")
                    izitoast_show("Done", "Discord ID copied : " + discordID);
                }
            })

        },
        accept: function(request_uid){
            if (!this.scrims || Object.keys(this.scrims).filter(v=>this.scrims[v].date==this.requests[request_uid].date).length == 0){
                socket.emit("admin_accept_request", request_uid);
            }else{
                var replaced = planing_vue.scrims[Object.keys(this.scrims).filter(v=>this.scrims[v].date==this.requests[request_uid].date)[0]];
                izitoast_confirm("Are you sure you want to do that ?", "If you accept this request, the scrim of the " + replaced.date + " will be cancelled. You will have to contact " + replaced.user + " to tell him.", function(rs){
                    if (rs){
                        socket.emit("admin_accept_request", request_uid);
                        planing_vue.contact(replaced.user);
                    }
                })
            }
        },
        ignore: function(request_uid){
            socket.emit("admin_ignore_request", request_uid);
        },
        delete_scrim: function(scrim_date){
            var scrim = planing_vue.scrims[scrim_date];
            izitoast_confirm("Are you sure you want to delete the scrim of the " + scrim.date + " ?", "You will have to contact " + scrim.user + " to tell him.", function(rs){
                if (rs){
                    socket.emit("admin_delete_scrim", scrim_date);
                    planing_vue.contact(scrim.user);
                }
            })
        },
        updateScrim: function(date, scrim){
            socket.emit("admin_update_scrim", date, scrim);
        }
    },
    filters: {
        date: function(time){
            var date = new Date(time);
            return (date.getFullYear() + "-" + addZeros(date.getMonth()+1) + "-" + addZeros(date.getDate()));
        },
        short: function(text){
            if (text.length > 15){
                return text.slice(0, 16) + "...";
            }else return text;
        },
        map: (mapUID, type) => ((mapUID.length > 4) ? config_vue.maps[type][mapUID] : "--")
    }
});

var config_vue = new Vue({
    el: '#config_vue',
    data: {
        visible: false,
        streams: [],
        streamName: "",
        onlinestream: "",
        maxRequestPerIP: 3,
        managerDiscordAUTH: "",

        maps: {},
        mapname: "",
        maptype: "",
    },
    methods: {
        selectDay: function(day){
            if (!day.impossible){
                this.calendar.selected = day;
                socket.emit("admin_edit_dispos", day.time, !day.prefer)
            }
        },
        removeStream: function(index){
            delete this.streams[index];
            socket.emit("admin_edit_streams", this.streams);
        },
        addStream: function(){
            if (this.streamName != ""){
                this.streams.push(this.streamName)
                socket.emit("admin_edit_streams", this.streams);
                this.streamName = "";
            }
        },
        removeMap: function(type, UID){
            socket.emit("admin_remove_map", type, UID);
        },
        addMap: function(){
            if (this.mapname != ""){
                socket.emit("admin_add_map", this.maptype, this.mapname);
                this.mapname = "";
            }
        },
        pushUp: function(index){
            if (this.streams[index] && this.streams[index-1]){
                let s2 = this.streams[index-1];
                this.streams[index-1] = this.streams[index];
                this.streams[index] = s2;
                socket.emit("admin_edit_streams", this.streams);
            }
        },
        pushDown: function(index){
            if (this.streams[index] && this.streams[index+1]){
                let s2 = this.streams[index+1];
                this.streams[index+1] = this.streams[index];
                this.streams[index] = s2;
                socket.emit("admin_edit_streams", this.streams);
            }
        },
        update_managerDiscordAUTH: function(){
            socket.emit("admin_edit_managerDiscordAUTH", this.managerDiscordAUTH, function(rs){
                izitoast_show(((!rs.error) ? "Done !" : "Error !"), rs.message, rs.error);
            })
            
        },
        update_maxRequestPerIP: function(){
            if (this.maxRequestPerIP > 0){
                socket.emit("admin_edit_maxRequestPerIP", this.maxRequestPerIP);
                izitoast_show("Done !", "'maxRequestPerIP' has been set to " + this.maxRequestPerIP);
            }
        }
    },
    filters: {
        date: function(time){
            var date = new Date(time);
            return (date.getFullYear() + "-" + addZeros(date.getMonth()+1) + "-" + addZeros(date.getDate()))
        }
    }
});

socket.on("connect", function(){
    
    socket.emit("admin_panel_login", {auth: localStorage.getItem("auth")}, function(rs){
        if (rs.result){
            localStorage.setItem("auth", rs.auth);
            planing_vue.visible = true;
            header_vue.connected = true;
        }else{
            login_vue.visible = true;
        }

        socket.on("admin_update_maxRequestPerIP", nbr => config_vue.maxRequestPerIP = nbr);
        socket.on("admin_update_streams", list => config_vue.streams = list);
        socket.on("admin_update_requests", list => planing_vue.requests = list);
        socket.on("admin_update_scrims", list => planing_vue.scrims = list);
        
    });

    socket.on("maps", maps =>{
        planing_vue.maps = maps;
        config_vue.maps = maps;
    });

    socket.on("stream_change", channel => config_vue.onlinestream = channel);

    socket.on("planning", function(days){
        planing_vue.calendar.days = days;
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
        image: '../images/logo2.png',
        imageWidth: 70,
        layout: 2,
    });
}

function izitoast_confirm(title, question, callback){
    iziToast.show({
        theme: 'dark',
        overlay: true,
        title: title,
        message: question,
        position: 'center',
        progressBarColor: '#F3AD43',
        backgroundColor: "#181B2C",
        image: '../images/logo2.png',
        imageWidth: 70,
        layout: 2,

        buttons: [
            ['<button>Ok</button>', function (instance, toast) {
                instance.hide({
                    transitionOut: 'fadeOutUp',
                }, toast, 'buttonName');
                callback(true);
            }, true],
            ['<button>Close</button>', function (instance, toast) {
                instance.hide({
                    transitionOut: 'fadeOutUp',
                }, toast, 'buttonName');
                callback(false);
            }]
        ],
        onClosing: ()=>callback(false)    
    });
}


function addZeros(val){return(val<10)?'0'+val:val}

function reloadApp(){
    $(".body").fadeOut(100, function(){
        $(".loader").fadeIn();
        setTimeout(()=> location.reload(), 500)
    })
}

$(function(){

    window.onclick = function(event) {
        if (!event.target.matches("header>.right *")) {
            $("header>.right").removeClass("opened")
            header_vue.MenuOpened = false;
        }
    }

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