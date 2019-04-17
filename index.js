const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getMonthInfos(date, callback){
    var firstMonday = new Date(date.getFullYear(), date.getMonth(), 1);
    callback(addDay(1-firstMonday.getDay(), firstMonday))
}

var today = Date.now();

var profils_grid = new Vue({
    el: '#profils_grid',
    data: {
        profils:[
            {
                name: "Opéra",
                image: "https://dummyimage.com/600x600/ffffff/000000.gif&text=Opéra",
                type: "tank"
            },
            {
                name: "Hoshin",
                image: "https://dummyimage.com/600x600/ffffff/000000.gif&text=Hoshin",
                type: "tank"
            },
            {
                name: "Beck",
                image: "https://dummyimage.com/600x600/ffffff/000000.gif&text=Beck",
                type: "dps"
            },
            {
                name: "Garm",
                image: "https://dummyimage.com/600x600/ffffff/000000.gif&text=Garm",
                type: "dps"
            },
            {
                name: "Kadwall",
                image: "https://dummyimage.com/600x600/ffffff/000000.gif&text=Kadwall",
                type: "support"
            },
            {
                name: "Manu",
                image: "https://dummyimage.com/600x600/ffffff/000000.gif&text=Manu",
                type: "support"
            },
        ]
    }
});

var ask_form = new Vue({
    el: '#ask_form',
    data: {
        calendar: {
            year: new Date(today).getFullYear(),
            month: months[new Date(today).getMonth()],
            days: [],
            selected: 0
        },
        form: {
            discordID:"",
            team_name:"",
            time:"X",
            control_map:"",
            hybrid_map:"",
            assault_map:"",
            escort_map:"",
        }
    },
    methods: {
        selectDate: function(date){
            if (date > Date.now()){
                this.calendar.selected = date;
            }
        },
        submit: function(e){
            e.preventDefault();
        },
        validDiscordID: function(discordID){
            if (discordID.length >= 7 && discordID.includes('#')){
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
        }
    },
    filters: {
        date: function(time){
            var date = new Date(time);
            return (addZeros(date.getDate()) + "/" + addZeros(date.getMonth()+1) + "/" + date.getFullYear())
        }
    }
});


getMonthInfos(new Date(today), function(firstMonday){
    
    while (ask_form.calendar.days.length != 42){
        if (new Date(today).getMonth()*30+(new Date(today).getDate()+3) > firstMonday.getDate()+30*firstMonday.getMonth()) ask_form.calendar.selected = firstMonday.getTime();
        ask_form.calendar.days.push({
            time: firstMonday.getTime(),
            date: firstMonday.getDate(),
            month: firstMonday.getMonth(),
            outofmonth: (firstMonday.getMonth() != new Date(today).getMonth()),
            today: (firstMonday.getDate() == new Date(today).getDate() && firstMonday.getMonth() == new Date(today).getMonth()),
            available: (firstMonday.getDate()+30*firstMonday.getMonth() > new Date(today).getMonth()*30+new Date(today).getDate()),
            prefer: (Math.random() > 0.5 && new Date(today).getMonth()*30+(new Date(today).getDate()+5) > firstMonday.getDate()+30*firstMonday.getMonth()),
        });
        addDay(1, firstMonday);
    }

})

function addDay(nbr=1, date=new Date()){date.setTime(date.getTime()+(nbr*86400000));return date;}
function addZeros(val){return(val<10)?'0'+val:val}

$(function(){

    setTimeout(function(){
        $(".loader").fadeOut(300, function(){
            $(".body").fadeIn();
        })
    }, 500);

    var scroll_pos = 0;

    $(document).scroll(function() {
        let new_scroll_pos = $(this).scrollTop()
        const scrDown = (new_scroll_pos > scroll_pos);
        scroll_pos = new_scroll_pos;
        
        if (scrDown){
            $("header").css("top", "-86px");
        }else{
            $("header").css("top", "0");
        }
        
    });
});