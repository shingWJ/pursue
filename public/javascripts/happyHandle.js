var currentCard;
var isLikeClick = function(obj){
	var classes = obj.getAttribute('class');
	var commentID = obj.parentNode.children.commentId.value;
	var ele = obj;
	if (classes.indexOf('heart-like') > 0 ) {
		Ajax.get('/updateIsLike/'+ commentID + '/' + 0,function(){
			ele.classList.remove('heart-like');
		});
	} else {
		Ajax.get('/updateIsLike/'+ commentID + '/' + 1,function(){
			ele.classList.add('heart-like');
		});
	}
}

var commentClick = function(obj) {
	document.getElementById('commentDiv').style.display = "";
	document.getElementById('currentID').value = obj.parentNode.children.commentId.value;
	document.getElementById('commentInput').focus();
	currentCard = obj;
}

document.getElementById('commntBtn').onclick = function() {
	
	if (document.getElementById('commentInput').value){
		Ajax.get('/addComment/' + document.getElementById('currentID').value + '/' + document.getElementById('commentInput').value,function(){
			var commentList = currentCard.parentNode.parentNode.parentNode.parentNode.children.commentList;
			var ele = document.createElement('p');
			ele.className = 'comment-p';
			ele.innerHTML =document.getElementById('userName').value + '&nbsp:&nbsp' + document.getElementById('commentInput').value;
			commentList.appendChild(ele);
			document.getElementById('commentInput').value = '';
		})
	}
	document.getElementById('commentDiv').style.display = "none";
	
}

var Ajax = {
    get: function (url,fn) {
        var obj = new XMLHttpRequest();// XMLHttpRequest对象用于在后台与服务器交换数据
        obj.open('GET', url, true);
        obj.onreadystatechange = function() {
            if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) { // readyState == 4说明请求已完成
                fn.call(this, obj.responseText);  //从服务器获得数据
            }
        };

        obj.send();
    },

    post: function (url,data,fn) {
        var obj = new XMLHttpRequest();
        obj.open("POST", url, true);
        obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");  // 添加http头，发送信息至服务器时内容编码类型
        obj.onreadystatechange = function() {
            if (obj.readyState == 4 && (obj.status == 200 || obj.status == 304)) {  // 304未修改
                fn.call(this, obj.responseText);
            }
        };
        obj.send(data);
    }
};

$(function(){
	var page = 0;
	$.each($('img'),function(index,item){
		if (item.width > window.innerWidth * 0.8){
			$(item).css('width',240);
		}
	})
	$('#contentList').css('height', window.innerHeight);
	$('#contentList').scroll(function(){
		var divHeight = $(this).height();
		var scrollheight = $(this)[0].scrollHeight;
		var scrollTop = $(this)[0].scrollTop;

		if (divHeight + scrollTop >= scrollheight) {
			$('#contentList').append('<img src="/images/loading.gif" style="margin-left: -2.5em;">');
			page += 1;
			var eleStr = '';
			$.get('/happyContentByPage?page=' + page,function(data,status){
				$('#contentList').children().last().remove();
				$.each(data,function(index,item){
					eleStr = eleStr + '<div class="card"><div class="card-block"><h4 class="card-title"></h4><p class="card-text">' + item.content + '</p><div style="color: #757575;">';
					if (item.isLike == 0) {
						eleStr += '<span class="glyphicon glyphicon-heart" id="likeNor" onClick="isLikeClick(this);"></span>';
					} else {
						eleStr += '<span class="glyphicon glyphicon-heart heart-like" id="likeNor" onClick="isLikeClick(this);"></span>';
					}
					eleStr= eleStr + '<span class="glyphicon glyphicon-comment happy-comment" id="comment" onclick="commentClick(this);"></span><input type="hidden" name="commentId" id="commentId" value='+ item.commentID
					+'></div></div></div><div class="comment-list" id="commentList">';
					var commentStr = '';
					if (item.comments && item.comments.length > 0) {
						for (var i = 0 ; i < item.comments.length ; i++) {
							commentStr = commentStr + '<p class="comment-p">' + $('#userName').val() + '&nbsp:&nbsp' + item.comments[i].content + '</p>';
						}
					}
					eleStr = eleStr + commentStr + '</div>';
				});
				$('#contentList').append(eleStr);
			});
		}
	});
});