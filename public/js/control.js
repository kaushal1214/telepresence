//Keyrelease event

document.addEventListener('keyup',function(event){
	console.log(event);
	if(event.key=="ArrowUp"||event.key=="ArrowDown"||event.key=="ArrowLeft"||event.key=="ArrowRight")
	{
		socket.emit('keyUp',{key:event.key});
		Pressed = false;
	}
});

document.addEventListener("keydown", function (e)
{	
	if(e.key == "ArrowUp" || e.key=="ArrowDown" || e.key=="ArrowLeft" || e.key=="ArrowRight")
	{
	       socket.emit('keyPress',{key:e.key});
		     Pressed = true;
	}
});
