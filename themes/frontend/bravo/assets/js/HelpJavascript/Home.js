var lastId;
//var splitter,cont1,cont2,cont3;
//var last_x,window_width;

//function init()
//{
//    window_width=window.innerWidth;
//    splitter=document.getElementById("splitter");
//    cont1=document.getElementById("tdNav");
//    cont2=document.getElementById("tdMainContent");
//    //var dx=cont1.clientWidth;
//    //splitter.style.marginLeft=dx+"px";
//    //dx+=splitter.clientWidth;
//    //cont2.style.width=dx+"px";
//    //dx=window_width-dx;
//    //cont2.style.width=dx+"px";
//    splitter.addEventListener("mousedown",spMouseDown);
//}

//function spMouseDown(e)
//{
//    splitter.removeEventListener("mousedown",spMouseDown);
//    window.addEventListener("mousemove",spMouseMove);
//    window.addEventListener("mouseup",spMouseUp);
//    last_x=e.clientX;
//}

//function spMouseUp(e)
//{
//    window.removeEventListener("mousemove",spMouseMove);
//    window.removeEventListener("mouseup",spMouseUp);
//    splitter.addEventListener("mousedown",spMouseDown);
//    resetPosition(last_x);
//}

//function spMouseMove(e)
//{
//    resetPosition(e.clientX);
//}

//function resetPosition(nowX)
//{
//    //var dx=nowX-last_x;
//    //dx+=cont1.clientWidth;
//    //cont1.style.width=dx+"px";
//    //splitter.style.marginLeft=dx+"px";
//    //dx+=splitter.clientWidth;
//    //cont2.style.marginLeft=dx+"px";
//    //dx=window_width-dx;
//    //cont2.style.width=dx+"px";
//    //last_x=nowX;

//    var dx=nowX-last_x;
//    dx+=cont1.clientWidth;
//    cont1.style.width=dx+"px";
//    splitter.style.marginLeft=dx+"px";
//    dx+=splitter.clientWidth;
//    cont2.style.marginLeft=dx+"px";
//    dx=window_width-dx;
//    cont2.style.width=dx+"px";
//    last_x=nowX;
//}

function validateForm(path)
{
    var keyword = document.getElementById("searchBox").value;
    var format = /[!#@@$%^&*()_+\-=\[\]{}':"\\|,.<>\/?]/;
    if(format.test(keyword))
    {
        alert("Từ khóa chứa ký tự không được phép");
        document.getElementById("searchBox").focus();
        return false;
    }
    SearchContent(keyword, path);
    return false;
}

function Ajax(commandKeyValue, id, isGroup)
{
    //@Url.Action("StaticContentGenerator", "Home")
    window.scrollTo(0, 0);
    var divProcess = document.getElementById("divProcessing");
    //divProcess.style.display = "block";
    $.ajax({
        type: "GET",
        url: '/Home/StaticContentGenerator',
        datattype: "html",
        data: { commandKey: commandKeyValue },
        success: function (data) {
            if(isGroup == 'True')
            {
                idSpanNode = document.querySelector('[id*="' + id + '"]');
                idSpanNode.click();
            }
            else {
                if (lastId != null)
                {
                    var lastIdControl = document.getElementById(lastId);
                    lastIdControl.style.color = "black";
                    lastIdControl.style.backgroundColor = "white";
                    lastIdControl.style.fontWeight = "normal";
                }
                var idControl = document.getElementById(id);
                idControl.style.color = "white";
                idControl.style.backgroundColor = "blue";
                idControl.style.fontWeight = "bold";
                lastId = id;
            }
            divProcess.style.display = "none";
            $('#Main_Content').html(data);
            
        },
        error: function (data) {
            alert("Error while loading data");
        }
    });
}

function SearchContent(keywordValue, path)
{
    window.scrollTo(0, 0);
    var divProcess = document.getElementById("divProcessing");
    divProcess.style.display = "block";
    $.ajax({
        type: "POST",
        url: path,
        datattype: "html",
        data: { keyword: keywordValue},
        success: function (data) {
            divProcess.style.display = "none";
            $('#Main_Content').html(data);
            
        },
        error: function (data) {
            alert("Error while loading data");
        }
    });
}
