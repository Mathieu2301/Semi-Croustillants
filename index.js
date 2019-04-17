



function getMonthInfos(date, callback){
    var firstDay = date;
    addDay(1-firstDay.getDate(), firstDay)
    
    var firstMonday = new Date(date.getFullYear(), date.getMonth(), 1);
    addDay(1-firstMonday.getDay(), firstMonday)

    callback(firstDay, firstMonday)
}



console.log("TEST 1"); // Février test
var fevrier = new Date(Date.now());
fevrier.setDate(23)
fevrier.setMonth(1)
getMonthInfos(fevrier, function(firstDay, firstMonday){
    console.log("Aujourd'hui : --------- " + printDate(fevrier) + " => " + ((printDate(fevrier) == "Samedi 23/02/2019") ? "OK !" : "Samedi 23/02/2019"));
    console.log("Premier jour : -------- " + printDate(firstDay) + " => " + ((printDate(firstDay) == "Vendredi 01/02/2019") ? "OK !" : "Vendredi 01/02/2019"));
    console.log("Premier lundi : ------- " + printDate(firstMonday) + " => " + ((printDate(firstMonday) == "Lundi 28/01/2019") ? "OK !" : "Lundi 28/01/2019"));
})

console.log("TEST 2"); // True test

getMonthInfos(new Date(Date.now()), function(firstDay, firstMonday){
    console.log("Aujourd'hui : --------- " + printDate(new Date(Date.now())) + " => " + ((printDate(new Date(Date.now())) == "Mercredi 17/04/2019") ? "OK !" : "Mercredi 17/04/2019"));
    console.log("Premier jour : -------- " + printDate(firstDay) + " => " + ((printDate(firstDay) == "Lundi 01/04/2019") ? "OK !" : "Lundi 01/04/2019"));
    console.log("Premier lundi : ------- " + printDate(firstMonday) + " => " + ((printDate(firstMonday) == "Lundi 01/04/2019") ? "OK !" : "Lundi 01/04/2019"));
})


var ask_form = new Vue({
    el: '#ask_form',
    data: {
        visible: false,
        calendar: {
            days: []
        }
    },
    methods: {
        submit: function(e){
            e.preventDefault();
        },
    }
});

getMonthInfos(fevrier, function(firstDay, firstMonday){
    
    while (ask_form.calendar.days.length != 35){
        ask_form.calendar.days.push(firstMonday.getDate());
        addDay(1, firstMonday);

    }

})


function printDate(date = new Date()){
    return ['.', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][date.getDay()] + " " + addZero(date.getDate()) + '/' + addZero(date.getMonth()+1) + '/' + date.getFullYear();
}

function addZero(number=0){return (new String(number).length<2) ? "0"+number : number;}
function addDay(nbr=1, date=new Date()){date.setTime(date.getTime()+(nbr*86400000))}

$(function(){
    $(".body").fadeIn();
});
