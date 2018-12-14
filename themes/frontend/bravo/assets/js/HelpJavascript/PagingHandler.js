function GetRecordPerPage(path)
{
    window.scrollTo(0, 0);
    var divProcess = document.getElementById("divProcessing");
    divProcess.style.display = "block";
    var sel = document.getElementById("recordPerPage");
    $.ajax({
        type: "GET",
        url: path,
        data: {recordPerPage: sel.value},
        success: function (data) {
            divProcess.style.display = "none";
            $('#data-table').html(data);
        },
        error: function (data) {
            alert("Error while loading data");
        }
    }); 
}


function search(event, path) {
    if (event.which == 13 || event.keyCode == 13) {
        var divProcess = document.getElementById("divProcessing");
        divProcess.style.display = "block";
        var keyword = document.getElementById("searcher").value;
        if (keyword == "") {
            divProcess.style.display = "None";
            alert("Vui lòng nhập từ khóa tìm kiếm");
            document.getElementById("searcher").focus();
            
            return false;
        }

        var format = /[!#%*\-=\[\]{}':"\\|,.<>\/?]/;
        if (format.test(keyword)) {
            divProcess.style.display = "None";
            alert("Từ khóa chứa kí tự đặc biệt");
            document.getElementById("tbxCodeId").focus();
            
            return false;
        }
        $.ajax({
            type: "GET",
            url: path,
            data: { keyword: keyword },
            success: function (data) {
                window.scrollTo(0, 0);
                $('#data-table').html(data);
                divProcess.style.display = "None";
            },
            error: function (data) {
                alert("Error while loading data");
            }
        });
    }
}
