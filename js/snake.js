var snake_parts = [];
var snake_timer = null;
var snake_direction = "right";
var game_started = !1;

function rand(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function onSnakeMove(){
	var leader_part = snake_parts[0];
	var offset = leader_part.width();
	var prev_coords = [leader_part.css("left"), leader_part.css("top")];
	leader_part.css(((snake_direction == "up" || snake_direction == "down") ? "top" : "left"), ((snake_direction == "left" || snake_direction == "up") ? "-" : "+") + "=" + offset);

	var container = $("#container");
	var border = [parseInt(container.css("left")), parseInt(container.css("top")), container.width(), container.height()];
	var leader_x = border[0] + parseInt(leader_part.css("left"));
	var leader_y = border[1] + parseInt(leader_part.css("top"));
	if(leader_x + offset == border[0] || leader_x == border[0] + border[2] || leader_y + offset == border[1] || leader_y == border[1] + border[3]){
		return stop_game();
	}

	var prize = $("#snake_prize");
	var prize_x = border[0] + parseInt(prize.css("left"));
	var prize_y = border[1] + parseInt(prize.css("top"));
	if(leader_x == prize_x && leader_y == prize_y){
		append_snake_part();
		create_prize();
	}

	for(var i = 1; i < snake_parts.length; i++){
		var current_part = snake_parts[i];
		var new_coords = prev_coords;
		prev_coords = [current_part.css("left"), current_part.css("top")];
		var cpart_x = border[0] + parseInt(prev_coords[0]);
		var cpart_y = border[1] + parseInt(prev_coords[1]);
		if(leader_x == cpart_x && leader_y == cpart_y){
			return stop_game();
		}else if(cpart_x == prize_x && cpart_y == prize_y){
			append_snake_part();
			create_prize();
		}
		current_part.css("left", new_coords[0]);
		current_part.css("top", new_coords[1]);
	}
}

function change_snake_direction(dir){
	if((dir == "left" && snake_direction == "right") || (dir == "right" && snake_direction == "left") || (dir == "up" && snake_direction == "down") || (dir == "down" && snake_direction == "up")) return false;
	snake_direction = dir || snake_direction;
	if(snake_timer){
		clearInterval(snake_timer);
		snake_timer = setInterval(onSnakeMove, 150);
	}
	onSnakeMove();
	return true;
}
function append_snake_part(is_default){
	var offset = snake_parts[0].width();
	var last_id = snake_parts.length - 1;
	var new_id = last_id + 1;
	snake_parts[new_id] = snake_parts[last_id].clone().attr("id", "spart_" + new_id).appendTo("#container");
	if(!is_default){
		var record_score = parseInt($("#record_score_count").html());
		var new_score = parseInt($("#score_count").html()) + 1;
		$("#score_count").html(new_score);
		if(new_score > record_score){
			$("#record_score_count").html(new_score);
			$.cookie("snake_record", new_score);
		}
	}
}
function create_prize(){
	var prize = $("#snake_prize");
	if(prize.length){
		prize.remove();
	}
	var offset = snake_parts[0].width();
	var container = $("#container");
	var max_left = Math.floor(container.width() / offset) - 1;
	var max_top = Math.floor(container.height() / offset) - 1;
	$("#container").append('<div id="snake_prize" class="snake_part prize" style="left:' + offset * rand(0, max_left) + 'px;top:' + offset * rand(0, max_top) + 'px"></div>');
	return true;
}
function start_game(){
	if(game_started) return false;
	game_started = !0;
	var record_count = $.cookie("snake_record");
	if(record_count){
		$("#record_score_count").html(record_count);
	}
	$("#score_count").html("0");
	$("#overlay").hide();
	$("#container").append('<div id="spart_0" class="snake_part" style="left:100px;top:100px"></div>');
	snake_parts[0] = $("#spart_0");
	append_snake_part(true);
	append_snake_part(true);
	append_snake_part(true);
	create_prize();
	snake_timer = setInterval(onSnakeMove, 150);
	return true;
}
function stop_game(){
	if(!game_started) return false;
	game_started = !1;
	if(snake_timer){
		clearInterval(snake_timer);
		snake_timer = null;
	}
	$("#container .snake_part").remove();
	$("#overlay").show();
	snake_parts = [];
	snake_direction = "right"
	return true;
}

$(document).ready(function(){
	$(document).keydown(function(e){
		if(e.which == 13){ // enter
			start_game();
		}else if(e.which == 27){ // esc
			stop_game();
		}else if(e.which == 37){ // left
			change_snake_direction("left");
			e.preventDefault();
		}else if(e.which == 39){ // right
			change_snake_direction("right");
			e.preventDefault();
		}else if(e.which == 38){ // up
			change_snake_direction("up");
			e.preventDefault();
		}else if(e.which == 40){ // down
			change_snake_direction("down");
			e.preventDefault();
		}
	});
	$("#container").swipe({
		swipe: function(event, direction, distance, duration, fingerCount, fingerData){
			if(direction == "left"){
				if(fingerCount == 2){
					stop_game();
				}else{
					change_snake_direction("left");
				}
			}else if(direction == "right"){
				change_snake_direction("right");
			}else if(direction == "up"){
				if(fingerCount == 2 || !game_started){
					start_game();
				}else{
					change_snake_direction("up");
				}
			}else if(direction == "down"){
				change_snake_direction("down");
			}
		}
	});
});