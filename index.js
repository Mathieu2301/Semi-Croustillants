var socket = io("ws://cloud1.usp-3.fr:7532/");

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var today = Date.now();

var profils_grid = new Vue({
    el: '#profils_grid',
    data: {
        profils:[
            {
                name: "Opéra",
                type: "tank",
                social:[
                    {type: "discord", copy: "Opera#3202"},
                    {type: "twitter", url: "--"},
                    {type: "youtube", url: "--"}
                ]
            },
            {
                name: "Hoshin",
                type: "tank",
                social:[
                    {type: "discord", copy: "Hoshin#2339"},
                    {type: "twitter", url: "--"},
                    {type: "youtube", url: "--"}
                ]
            },
            {
                name: "Beck",
                type: "dps",
                social:[
                    {type: "discord", copy: "Beck#4213"},
                    {type: "twitter", url: "--"},
                    {type: "youtube", url: "--"}
                ]
            },
            {
                name: "Garm",
                type: "dps",
                social:[
                    {type: "discord", copy: "Garm#0000"},
                    {type: "twitter", url: "--"},
                    {type: "youtube", url: "--"}
                ]
            },
            {
                name: "Kadwall",
                type: "support",
                social:[
                    {type: "discord", copy: "Kadwall#2998"},
                    {type: "twitter", url: "--"},
                    {type: "youtube", url: "--"}
                ]
            },
            {
                name: "Manu",
                type: "support",
                social:[
                    {type: "discord", copy: "Manu#6769"},
                    {type: "twitter", url: "--"},
                    {type: "youtube", url: "--"}
                ]
            },
        ]
    },
    methods: {
        openSocial: function(network){
            if (network.url && network.url != ""){
                window.open(network.url,'_blank');
            }else if (network.copy && network.copy != ""){
                $('#clipboard').text(network.copy);
                var $temp=$("<input>");
                $("body").append($temp);
                $temp.val($('#clipboard').text()).select();
                document.execCommand("copy");
                $temp.remove();
                $('#clipboard').text("")
                izitoast_show("Done", "Discord ID copied : " + network.copy);
            }
        }
    }
});

var ask_form = new Vue({
    el: '#ask_form',
    data: {
        calendar: {
            year: new Date(today).getFullYear(),
            month: months[new Date(today).getMonth()],
            days: [],
            selected: 0,
            min: today,
        },
        form: {
            discordID: localStorage.getItem("discordID"),
            team_name: localStorage.getItem("team_name"),
            date:"",
            dateValid: false,
            time:"",
            maps: {},
            control_map:"",
            hybrid_map:"",
            assault_map:"",
            escort_map:"",
            
            error: false
        },
    },
    methods: {
        submit: function(e){
            e.preventDefault();

            if (this.validDiscordID(this.form.discordID) && this.form.team_name.length>=3 && this.form.date != "" && ask_form.validRequestDate()){
                var dateSelected = new Date(this.form.date);

                var form_data = {
                    discordID: this.form.discordID,
                    team_name: this.form.team_name,
                    date: (addZeros(dateSelected.getDate()) + "/" + addZeros(dateSelected.getMonth()+1) + "/" + dateSelected.getFullYear())
                }

                if (this.form.time) form_data.time = this.form.time;
                if (this.form.control_map || this.form.hybrid_map || this.form.assault_map || this.form.escort_map){
                    form_data.map_control = this.form.control_map;
                    form_data.map_hybrid  = this.form.hybrid_map;
                    form_data.map_assault = this.form.assault_map;
                    form_data.map_escort  = this.form.escort_map;
                }

                var _this = this;

                socket.emit('newScrimRequest', form_data, function(rs){
                    rs = JSON.parse(rs);
                    if (rs.success){
                        _this.form.error = false;
                        izitoast_show("Scrim request sent", rs.message)
                        _this.form.date = ""
                        _this.form.time = ""

                        localStorage.setItem("discordID", _this.form.discordID)
                        localStorage.setItem("team_name", _this.form.team_name)
                    }else{
                        izitoast_show("Error", rs.message, true)

                        if (rs.resetUser){
                            _this.form.discordID = "";
                            _this.form.error = true;
                        }
                    }
                })
            }else{
                this.form.error = true;
            }

        },
        validDiscordID: function(discordID){
            if (discordID.length >= 6 && discordID.includes('#')){
                var split = discordID.split("#");
                var name = split[0];
                var tag = split[1];
                if (!isNaN(tag) && name.length >= 2 && tag.length >= 4 && tag.length <= 6){
                    return true;
                }else{
                    return false;
                }
            }else{
                return false;
            }
        },
        validRequestDate: function(){
            let date = new Date(this.form.date);
            let day = ask_form.calendar.days.filter(v=>(v.date==date.getDate() && v.month==date.getMonth()))[0];
            return this.form.dateValid = (date.toJSON() && !isNaN(date.getTime()) && (today-86400000 < date.getTime()) && (!day || !day.event))
        }
    },
    filters: {
        date: function(time){
            var date = new Date(time);
            return (date.getFullYear() + "-" + addZeros(date.getMonth()+1) + "-" + addZeros(date.getDate()))
        },
        short: function(text){
            if (text.length > 9){
                return text.slice(0, 8) + "..."
            }else return text;
        }
    }
});

socket.on("connect", function(){

    socket.on("planning", function(days){
        ask_form.calendar.days = days;
    });

    socket.on("planning", function(days){
        ask_form.calendar.days = days;
    });

    socket.on("maps", maps =>{
        ask_form.maps = maps;
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