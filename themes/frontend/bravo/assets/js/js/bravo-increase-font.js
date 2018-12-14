$(document).ready(function () {
    // kích thước font chữ tối thiểu
    var min = 10;
    //kích thước font chữ tối đa
    var max = 16;

    // lấy font chữ mực định
    var reset = $('body').css('fontSize');

    //những phần tử sẽ thực hiện khi chức năng được gọi
    var elm = $('body');

    // ấn định kích thước font chữ mặc định và xóa bỏ px từ giá trị
    var size = str_replace(reset, 'px', '');
            
    //Tăng kích thước font chữ
    $('a.fontSizePlus').click(function () {
                
        // Nếu kích thước font chữ nhở hơn hoặc bằng với giá trị tối đa thì
        if (size <= max) {

            // tăng kích thước
            size++;

            // ấn định kích thước font cho phần tử
            elm.css({ 'fontSize': size });
        }

        // hủy sự kiện click
        return false;

    });
    // Giảm kích thước font
    $('a.fontSizeMinus').click(function () {

        // nếu kích thước font chữ lớn hơn hay bằng với giá trị tối thiểu
        if (size >= min) {

            //giảm kích thước
            size--;

            // ấn định kích thước font cho phần tử
            elm.css({ 'fontSize': size });
        }

        // hủy sự kiện click
        return false;

    });

    // khôi phục lại kích thước mặc định
    $('a.fontReset').click(function () {

        // ấn định kích thước font chữ mặc định
        elm.css({ 'fontSize': reset });
    });

});

//hàm thay đổi chuỗi
function str_replace(haystack, needle, replacement) {
    var temp = haystack.split(needle);
    return temp.join(replacement);
}