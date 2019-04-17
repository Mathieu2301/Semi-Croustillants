const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getMonthInfos(date, callback){
    var firstMonday = new Date(date.getFullYear(), date.getMonth(), 1);
    callback(addDay(1-firstMonday.getDay(), firstMonday))
}

var today = Date.now();

var ask_form = new Vue({
    el: '#ask_form',
    data: {
        visible: false,
        calendar: {
            year: new Date(today).getFullYear(),
            month: months[new Date(today).getMonth()],
            days: [],
            selected: 0
        },
        form: {
            discordID:"",
            team_name:"",
            time:"",
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
    },
    filters: {
        date: function(time){
            var date = new Date(time);
            return (addZeros(date.getDate()) + "/" + addZeros(date.getMonth()+1))
        }
    }
});


getMonthInfos(new Date(today), function(firstMonday){
    
    while (ask_form.calendar.days.length != 35){
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
    $(".body").fadeIn();
});