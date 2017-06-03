var source = new EventSource('/result');
source.onmessage = function(e) {

    var jsonData = JSON.parse(e.data);
    document.getElementById("result").innerHTML = "Le résultat est : " + e.data ;
};
