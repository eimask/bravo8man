//Menu
function mainmenu(){
	$("ul.menu ul ").css({display: "none"}); // Opera Fix
	$("ul.menu li").hover(function(){
		$(this).find('ul:first').css({visibility: "visible",display: "none"}).show(200);
	},function(){
		$(this).find('ul:first').css({visibility: "hidden"});
	});
}

jQuery(document).ready(function($){					
	mainmenu();
	
	/*Clients Carousel*/
	if($(".clients-carousel").length){
		$('ul.clients-carousel').jcarousel({ scroll: 1 });
	}	
});