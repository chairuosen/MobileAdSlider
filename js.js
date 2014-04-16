$(function(){
  $.log = function(){
    return console.log(arguments);
  }

  $.fn.ad = function(){
    var st = {
      transitionTiming:300,
      minMoving:100
    }
    var $ad = $(this);
    var $ul = $ad.find('ul');
    var $li = $ul.find('li');
    var _w, _count,_current=1;
    
    $ad.init = function(){
      $ul.addClass('transition');
      $ul.empty().append($li);
      _w = $(window).width();
      _count = $li.length;
      $li.width(_w);
      
      var $first = $li.eq(0).clone();
      var $last = $li.eq(-1).clone();
      $first.appendTo($ul);
      $last.css({
        position:'absolute',
        top:0,
        left:-_w+'px'
      }).appendTo($ul);
      $ad.bindEvent();
      $ad.disableTransition();
      setTimeout(function(){
        $ad.goToIndex(_current);
        $ad.enableTransition();
      },1);
      return $ad;
    }
    
    $ad.moveToPosition = function(x){
      $ul.css({
        "-webkit-transform":"translateX(" + x + "px)"
      });
    }
    $ad.goToIndex = function(x){
      $ad.moveToPosition( -_w * (x-1));
      $ad.changeCurrentIndex(x);
    }
    $ad.getCurrentPosition = function(){
      return (new WebKitCSSMatrix( $ul.css('-webkit-transform') )).m41;
    }
    $ad.changeCurrentIndex = function(x){
      _current = x;
      // do something with UI
    }
    $ad.getNowIndex = function(){
      var pos = - $ad.getCurrentPosition();
      var index = Math.round(pos/_w)+1;
      return index;
    }
    $ad.getCurrentIndex = function(){
      return _current;
    }
    $ad.fromTo = function(f,t){
      if( 
        ( t == _count && f < (_count/2) )
        ||
        ( t == 1 && f > (_count/2) )
       ){
        var tempPosition = t==1 ? _count+1 : 0;    
        var finalPosition = t==1 ? 1 : _count;
        $ad.goToIndex(tempPosition);
        setTimeout(function(){

          $ad.disableTransition();
          setTimeout(function(){

            $ad.goToIndex(finalPosition);
            setTimeout(function(){
              $ad.enableTransition();
            },1);

          },1);

        },st.transitionTiming);
      }else{
        $ad.goToIndex(t);
      }
    }
    $ad.enableTransition = function(){
      $ul.addClass('transition');
    }
    $ad.disableTransition = function(){
      $ul.removeClass('transition');
    }
    $ad.getEvent = function(e){
      if( e.touches ){
        return e.touches[0];
      }
      if( e.originalEvent && e.originalEvent.changedTouches ){
        return e.originalEvent.changedTouches[0];
      }
      return e;
    }
    $ad.bindEvent = function(){
      var touchstartX,touchstartY,ulstartX;
      var touchMark = false;
      var disableOnce = false;

      var start = function(e){
        console.clear();
        $ad.disableTransition();
        var event = $ad.getEvent(e);
        touchstartX = event.pageX;
        touchstartY = event.clientY;
        ulstartX = $ad.getCurrentPosition();
        touchMark = true;
      }
      var move = function(e){
        if(touchMark){
          var event = $ad.getEvent(e);
          var diffX = event.pageX - touchstartX;
          var diffY = event.clientY - touchstartY;

          // $.log(Math.abs(diffX),Math.abs(diffY));
          
          if( Math.abs(diffX) < Math.abs(diffY) ){
            disableOnce = true;
            // $.log(1);
          }else{
            // $.log(2);
            $ad.moveToPosition( ulstartX + diffX );
            e.preventDefault();
          }
        }
      }
      var end = function(e){
        $ad.enableTransition();
        var event = $ad.getEvent(e);
        var diff = event.pageX - touchstartX;
        var _disableOnce = disableOnce;
        setTimeout(function(){
          var from = $ad.getCurrentIndex();
          if (diff > st.minMoving ){
            var t = from-1;
          }else if(diff < -st.minMoving){
            var t = from+1; 
          }else{
            var t = from;
          }
          var to =  t%_count== 0 ? _count : t%_count ;
          // $.log(_disableOnce);
          if( _disableOnce ){
            $ad.disableTransition();
            setTimeout(function(){
              $ad.goToIndex(from);
            })
          }else{
            $ad.fromTo(from,to);
          }
        },1);
      
        touchMark = false;
        disableOnce = false;
      }
      $ul.unbind().bind('mousedown touchstart',start);
      $ul.bind('mousemove touchmove',move);
      $ul.bind('mouseup touchend',end);
      $(window).unbind('.slide').bind('resize.slide',function(){
        $ad.init();
      })
    }

    
    return $ad.init();
  }
  
   window.ad = $('#slider').ad();
});