Plan.responsiveUI() ;
httpLoader.request("myData.json") ;
setTimeout(function(){
 //  按httpLoader模型的设计，_textContent存放了获取的文本的字符串
   if(httpLoader._textContent.length > 1 ){
       loadData() ;
     }else{
     setTimeout(loadData(),3000); //针对极差的网络环境，再给第2次处理调入的数据的机会，若这次还无法调入，则说明用户网络状态无法运行本系统
    }
   function loadData(){
		let s = httpLoader._textContent ;
		Model.books = JSON.parse(s) ;
         let imgArr = [] ;
	  for (let book of Model.books ){
		imgArr.push(book.bookPage) ;
	   }
	  //console.log(imgArr);
	  Plan.loadImgOneByOne(imgArr) ;
   }
 },3000) ; //发出request("myData.json") 后，3s后第一次处理调入的数据

 

 
  document.body.onclick =document.body.ontouchstart = function(){
	UI.log($('book'), Model.books[0].name);
	
	$('main').replaceChild(UI.bookFace[0],$('bookFace')) ;
	$('bookFace').style.opacity = 0 ;
	setTimeout(function(){
		$('bookFace').style.opacity = 0.9 ;
	},200);
	
	Model.bookIndex = 0 ; //设置当前书的指针
	document.body.onclick = document.body.ontouchstart = null ; 
  };

  Model.mouse = {
	isDown: false ,
	x : 0 ,
	deltaX : 0 ,
	 } ;

  $('main').addEventListener("mousedown", function(ev){
    ev.preventDefault() ;
	console.log("mouse is down! ");
    Model.mouse.isDown = true ;
	Model.mouse.x = ev.pageX ;
   }) ;
  $('main').addEventListener("mousemove", function(ev){
	ev.preventDefault() ;
   let mouse = Model.mouse ;
   if (mouse.isDown && Math.abs($('bookFace').offsetLeft) < UI.deviceWidth / 5){
	   console.log("认可的 mouse事件： down and moving");
	   mouse.deltaX = ev.pageX - mouse.x ;
	   $('bookFace').style.left = $('bookFace').offsetLeft + mouse.deltaX + 'px' ;
	   mouse.deltaX = 0 ;
   } //end if mouse.isDown
  }) ; //'main'.addEventListener("mousemove")
  
  $('main').addEventListener("mouseup",function(ev){
	ev.preventDefault() ;
   	let mouse = Model.mouse ;
	    mouse.isDown = false ;
	let mini = parseInt(UI.deviceWidth/5) ;
	let offsetLeft =  $('bookFace').offsetLeft ;
	 if( Math.abs(offsetLeft) > mini){
 		if( offsetLeft > mini){
			 Model.prevBook();
		}else{
			if( offsetLeft < - mini ){
             Model.nextBook() ;
			}
		}
        mouse.x = 0 ;
		this.removeChild($('bookFace')) ;
		this.appendChild(UI.bookFace[Model.bookIndex]) ;
		bookFace.style.opacity =  '0.1' ;
      setTimeout(function(){ 
		$('bookFace').style.left =  '0px' ;
		$('bookFace').style.opacity =  '0.9' ;
      },200); 
	}else{ //end if Math.abs(mouse.deltaX) > mini,else 则需要书图回归原位
		setTimeout(function(){ 
			$('bookFace').style.left =  '0px' ;
	    },200); 
	 }
   }) ;       //'main'.addEventListener("mouseup")



//------触屏模型定义和处理函数---------
    Model.touch = {
	target: null ,
	x0: 0 ,
	deltaX : 0 ,
	} ; //Model.touch定义完毕

	   $('main').addEventListener("touchstart",function(e){
	       	   e.preventDefault();
	          let touch = Model.touch ;
	           touch.target = e.touches[0].target ;
	           touch.x0 = e.touches[0].pageX ;
	           console.log("touch start at:("+ touch.x0 + ', ' + e.touches[0].pageY + ")")  ;
	    }); //$('main').addEventListener("touchstart"...

	   $('main').addEventListener("touchend", function(e){
	     e.preventDefault();
	   let eTouch = e.changedTouches ;
       let touch = Model.touch ;
	       touch.x0 = 0 ;
	   let mini = UI.deviceWidth / 3 ;
        //需要书图回归原位的条件
	   if (touch.deltaX <= mini && touch.deltaX >= -mini ){
		  $('bookFace').style.opacity =  '0.9' ;
          setTimeout(function(){ 
			 $('bookFace').style.left =  '0px' ;
	      },200);
		  return ;
	    }
	      if (touch.deltaX > mini){
			  Model.nextBook() ;
	      }
          if (touch.deltaX < -mini ){
			  Model.prevBook() ;
          }
		this.removeChild($('bookFace')) ;
		this.appendChild(UI.bookFace[Model.bookIndex]) ;
		$('bookFace').style.opacity =  '0.1' ;
        setTimeout(function(){ 
		  $('bookFace').style.left =  '0px' ;
		  $('bookFace').style.opacity =  '0.9' ;
        },200); 
	    touch.deltaX = 0 ;
	  }); //$('main').addEventListener("touchend",...

	   $('main').addEventListener("touchmove",  function (e){
	     e.preventDefault();
	    let eTouch = e.changedTouches[0] ;
	    let touch = Model.touch ;
	   	let x = parseInt(eTouch.pageX);
		touch.deltaX = x - touch.x0 ;
		if (Math.abs(touch.deltaX) < UI.deviceWidth / 2 ) {
		    $('bookFace').style.left =  touch.deltaX + 'px' ;
		  }
       }); //$('main').addEventListener("touchmove", ...

	
	
/****
  本版围绕五个方面问题做了开发：
  1、进一步精简了html建模的mediaUI部件，设计仅用一套通用的UI实现音视频的控制。
  2、程序对音视频的播放已经可以跨平台，即可以在本地桌面端播放，也可入存入Web服务器后，在真实移动端正常播放音视频；
  3、按书的音频的JSON数据结构设计并实现了UI，用户可以在切换书后打开本书，看到弹出的章节菜单。
  4、创作了mediaPlayer函数，让程序可以用一个通用函数实现视频和音频的控制和播放，同时在函数中实现了用一套UI控制音视频这二种媒体 。
  5、根据新的设计，完善了代码逻辑和本软件的CSS样式外观。
 
/* 重新精简设计了UI的内容，JS代码必须作相应调整
 <div id ="mediaUI">
   <button id="playPause">Play/Pause</button> 
   <button id="duration">000</button>
   <video id ="myV" ></video>
   <ol id = "bookMenu"></ol>
   <audio id = "myA"></audio> 
</div>
*/

	   //打开书的后续代码，写在下面
	   $('handleBook').addEventListener("click",  function (e){
		e.preventDefault();
		if( !Model.bookIsOpen){
		 setTimeout(() => {
			$('bookFace').style.display = 'none' ;
			$('handleBook').textContent = "->关闭这本书" ;
		 }, 200);

		let book = Model.books[Model.bookIndex] ;
		Model.bookIsOpen = true ;
		$('mediaUI').style.display = 'block' ;

		if(book.type === 'video'){ 
          let videos = book ;
		  let i = parseInt(videos.files.length * Math.random( )) ;
		  UI.log($('book'),"碰巧播放NO."+(i+1)+" / "+videos.files.length+"号视频！") ;
          mediaPlayer($('myV') , videos.URL + videos.files[i]) ;
			  
	  }  //视频书结束
	
	  if(book.type === "audio"){
		let lessonIndex = 0 ;
		
        let chapters =  book.chapters[lessonIndex] ? book.chapters[lessonIndex] : [];
		UI.log($('statusInfo'), book.name +" 的课程 ！") ;
/* 重新精简设计了UI的内容，代码必须作相应调整
 <div id ="mediaUI">
   <button id="playPause">Play/Pause</button> 
   <button id="duration">000</button>
   <video id ="myV" ></video>
   <ol id = "bookMenu"></ol>
   <audio id = "myA"></audio> 
</div>
*/
		
		$('bookMenu').style.display = 'block' ;      
		let url = book.URL + book.files[lessonIndex] ;
		mediaPlayer($('myA') , url)
		let dadDom = $("bookMenu") ;
		    dadDom.textContent = "" ;
        if( chapters.length){
			for(let chapter of chapters){
		 	liDom = document.createElement('li') ;
			liDom.textContent = chapter.title ;
			dadDom.appendChild(liDom);
		  }
		 }else{
			dadDom.textContent = "遗憾，本书暂无任何教学内容 ，请自学吧 ！" ;
		 }
     }//音频书结束
	 //可以播放和控制视频和音频UI的通用函数mediaPlayer，写在“进入本书”的逻辑代码块内
 	 function mediaPlayer(mediaDom , url){  
		mediaDom.style.display = 'block' ;     
		mediaDom.src = url ;
		mediaDom.addEventListener('loadedmetadata',function(){
		  let m = Math.floor(this.duration/60) ;
		  let s = Math.ceil(this.duration - parseInt(this.duration/60)*60) ;
		  let bak = $('statusInfo').textContent ;
		  UI.log($('statusInfo'),'本教学音/视频长度为: '+ m +' 分钟 '+ s + ' 秒 ！');
		  setTimeout(() => {
			  UI.log($('statusInfo'), bak) ; 
		  }, 20000);
		 
		 $('playPause').onclick = $('playPause').ontouchstart = function(){
		   if(!Model.videoIsPlaying){
			 mediaDom.play() ;
			 Model.videoIsPlaying = true;
			 UI.log($('statusInfo'),  '教学音/视频正在播放！');
			}else{
			 mediaDom.pause() ;
			 Model.videoIsPlaying = false;
			 UI.log($('statusInfo'),  '教学音/视频已经暂停！');
		   }
		   $('duration').textContent = parseInt(mediaDom.duration) + ' s' ;
		  } ; //按移动互联网节省流量的标准，把确定播放/暂停视频的权力交给用户
		}); //获取了视频的元数据信息
	   
		mediaDom.addEventListener('canplaythrough',function(){
		  UI.log($('statusInfo'), '读取教学音/视频完成，点Play播放！');
		  this.style.width = UI.deviceWidth + 'px' ;
		  clearInterval(Model.clock) ;
		  Model.clock = setInterval(() => {
			  let leftTime = parseInt(mediaDom.duration - mediaDom.currentTime) ;
			  UI.log($('duration'), leftTime + ' s ');
			 }, 1000);
		}); //End canplaythrough
  
		//实际上对于低速网络环境，上面反馈需要大量的等待时间，代码此时需要给用户积极反馈
		Model.clock = setInterval(() => {
			  UI.log($('statusInfo'), parseInt(Math.random()*100) + '教学音/视频数据正在加载，请耐心等待！');
			 }, 2000);
	  } //end of mediaPlayer function
	  
	} else//end if !Model.bookIsOpen
	      {
			setTimeout(() => {
				$('bookFace').style.display = 'block' ;
				$('handleBook').textContent = "->打开这本书" ;
			 }, 200);
			Model.bookIsOpen = false ;
			$('myV').src = "" ;
			$('myA').src = "" ;
			$('myV').style.display = 'none' ;
			$('bookMenu').textContent = '' ;
			$('mediaUI').style.display = 'none' ;
			clearInterval(Model.clock);
			Model.clock = null ;

			setTimeout(function(){
				UI.log($('statusInfo'), " CopyRight from 李健宏 江西科技师范大学 2022--2025" );
			},5000);
		  } //end  if Model.bookIsOpen
   },true); //$('handleBook').addEventListener("click" 。。。 最后这个true参数很重要，让该click事件不再传递到父元素main上
