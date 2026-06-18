
function Text() {

	this.Clear = function( nodeParent ) {
		nodeParent.innerHTML = '';
	}

	this.Print = function( nodeParent, nLeft, nTop, strText, strColor ) {
		const nodeFrame = document.createElement( 'div' );
		nodeFrame.id = strText;
		nodeFrame.style.position = 'absolute';
		nodeFrame.style.left = nLeft + 'px';
		nodeFrame.style.top = nTop + 'px';
		nodeParent.appendChild( nodeFrame );

		let nX = 0;
		for( let i=0; i<strText.length; i++ ) {
			const nCode = strText.charCodeAt(i);
			const nOftX = nCode % 16;
			const nOftY = (nCode / 16)|0;

			const node = document.createElement( 'div' );
			node.classList.add( 'text' );
			node.style.left = nX + 'px';
			node.style.top = '0px';
			node.style.backgroundPosition = '-' + (nOftX*10) + 'px -' + (nOftY*10) + 'px';
			nodeFrame.appendChild( node );

			if( !strColor )
				strColor = COLOR_WHITE;
			const nodePalette = document.createElement( 'div' );
			nodePalette.classList.add( 'text_palette' );
			nodePalette.style.left = '0px';
			nodePalette.style.top = '0px';
			nodePalette.style['-webkit-mask-position'] = '-' + (nOftX*10) + 'px -' + (nOftY*10) + 'px';
			nodePalette.style.backgroundColor = strColor;
			node.appendChild( nodePalette );

			nX += 8;
		}
		return nodeFrame;
	}

	this.SetColor = function( node, strColor ) {
		let nodePaletteAr = node.getElementsByClassName( 'text_palette' );
		if( nodePaletteAr ) {
			for( let i=0; i<nodePaletteAr.length; i++ )
				nodePaletteAr[i].style.backgroundColor = strColor;
		}
		nodePaletteAr = null;
	}

	this.RemoveText = function( nodeParent, nodeTarget ) {
		nodeParent.removeChild( nodeTarget );
	}
}
