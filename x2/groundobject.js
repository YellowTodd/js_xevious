
const OBJECT_BARRA      =  1;
const OBJECT_LOGRAM     =  2;
const OBJECT_ZOLBAK     =  3;
const OBJECT_DOMOGRAM   =  4;
const OBJECT_DEROTA     =  5;
const OBJECT_BOZALOGRAM =  6;
const OBJECT_GROBDA     = 10;
const OBJECT_SOL        = 20;
const OBJECT_SPECIAL    = 21;
const OBJECT_COPYRIGHT  = -1;
const OBJECT_BRIDGE     = 22;

_inherit( GroundObject, Object );
function GroundObject() {
	this.base();
	this.m_bNeedCinder = true;	//불탄 흔적 필요
	this.m_nMaxConsec = 1;		//최대 연사 수
	this.m_nConsec = 0;			//연사한 수
	this.m_bConsec = false;		//연사 여부
	this.m_bFirstShot = true;	//첫 탄 여부
	this.m_nodeTriangularShadow = null;	// 바라와 갈바라의 삼각형 그림자

	GroundObject.prototype.Create = function( objArea, nX, nY ) {
		this.m_nodeBack = objArea.GetNode();
		Object.prototype.Create.call( this, objArea, nX, nY );
		this.m_nodeThis.style.zIndex = 2;
		this.m_nodePicture.classList.add( 'ground_object' );
		if( this.m_bNeedPalette )
			this.m_nodePalette.classList.add( 'ground_palette' );

		if( this.m_bBreakable ) {
			this.m_nodeExplosion = document.createElement('div');
			this.m_nodeExplosion.classList.add( 'object' );
			this.m_nodeExplosion.classList.add( 'size32' );
			this.m_nodeExplosion.classList.add( 'ground_explosion' );
			this.m_nodeExplosion.style.left = '-8px';
			this.m_nodeExplosion.style.top = '-8px';
			this.m_nodeExplosion.style.zIndex = 3;
			this.m_nodeExplosion.style.backgroundPosition = '0px 0px';
			this.m_nodeThis.appendChild( this.m_nodeExplosion );
		}

		if( g_App.GetConfigObject().IsShadow() )
			this.m_nodeThis.classList.add( 'ground-shadow' );
	}

	GroundObject.prototype.AddTriangularShadow = function() {
		if( !g_App.GetConfigObject().IsShadow() )
			return;

		this.m_nodeTriangularShadow = document.createElement('div');
		this.m_nodeTriangularShadow.classList.add( 'object' );
		if( this.m_nType == OBJECT_BARRA )
			this.m_nodeTriangularShadow.classList.add( 'barra-shadow' );
		if( this.m_nType == OBJECT_GARUBARRA )
			this.m_nodeTriangularShadow.classList.add( 'garubarra-shadow' );
		this.m_nodeThis.appendChild( this.m_nodeTriangularShadow );
		this.m_nodeThis.style.overflow = 'none';
	}

	GroundObject.prototype.ShowCinder = function() {
		this.m_nodeThis.style.zIndex = 1;
		this.m_nodePicture.style.backgroundPosition = '-16px -128px';
		this.m_nodePicture.style.visibility = 'visible';
		if( this.m_bNeedPalette ) {
			this.m_nodePalette.classList.remove( 'palette' );
			this.m_nodePalette.classList.add( 'palette_cinder' );
			this.m_nodePalette.style['-webkit-mask-position'] = '0px -128px';
			this.m_nodePalette.style.visibility = 'visible';
		}
	}

	GroundObject.prototype.Move = function() {
		if( this.m_nHitCount < 0 )
			return false;

		if( this.m_nHitCount > 0 ) {
			const nOftX = -32 * ((this.m_nHitCount/2)|0);
			this.m_nodeExplosion.style.backgroundPosition = nOftX + 'px 0px';
			this.m_nHitCount++;
			if( this.m_nHitCount > 16 ) {
				this.m_nHitCount = -1;
				this.m_nodeExplosion.style.visibility = 'hidden';
				if( this.m_bNeedCinder )
					this.ShowCinder();
			}
			return false;
		}

		// 포탄을 아직 쏘지 않음
		if( this.m_nFiring == 0 ) {
			this.Fire();
		}
		// 포탄을 쏘기 위해 해치를 여는 애니메이션
		else {
			let nOftX;
			// 해치를 연다
			if( this.m_nFiring <= 7 ) {
				nOftX = -16 + (-16 * ((this.m_nFiring/2)|0));
				this.m_nodePicture.style.backgroundPosition = nOftX + 'px ' + this.m_nBKOftY + 'px';
				// 완전히 열리면 발사
				if( this.m_nFiring == 7 ) {
					this.ShootSpario(0,0);
				}
				this.m_nFiring++;
			}
			// 해치를 닫는다
			else {
				nOftX = -64 + 16 * ((this.m_nFiring/2-4)|0);
				this.m_nodePicture.style.backgroundPosition = nOftX + 'px ' + this.m_nBKOftY + 'px';
				this.m_nFiring++;
				if( this.m_nFiring >= 15 ) 
					this.m_nFiring = 0;
			}
		}
		return true;
	}

	GroundObject.prototype.Hit = function() {
		if( !Object.prototype.Hit.call(this) )
			return false;
		this.m_nodeExplosion.style.visibility = 'visible';
		this.m_nodePicture.style.visibility = 'hidden';
		if( this.m_nodePalette )
			this.m_nodePalette.style.visibility = 'hidden';
		if( this.m_nodeTriangularShadow ) {
			if( this.m_nType == OBJECT_BARRA ) {
				this.m_nodeTriangularShadow.style.visibility = 'hidden';
			}
			else {
				this.m_nodeTriangularShadow.classList.remove('garubarra-shadow');
				this.m_nodeTriangularShadow.classList.add('broken-garubarra-shadow');
			}
		}

		g_objSound.Stop('idSndGExp');
		g_objSound.Play('idSndGExp');
		return true;
	}

	GroundObject.prototype.Fire = function() {
		// 탄을 쏘지 않는 캐릭터
		if( !this.m_bCanFire )
			return;

		// 화면 밖이면 쏘지 않음(Area4 이전과 Area5 이후가 다름)
		const nAreaNo = g_App.GetMapObject().GetCurrentArea().GetAreaNo();
		const nMinY = this.m_bFirstShot? (nAreaNo <= 4)? _random(128)-16 : _random(64)-16 : -16;
		const nMaxY = (this.m_strName == 'GARU DEROTA')? SCREEN_HEIGHT : (nAreaNo <= 4)? 152 : 208;
		const nObjectHalfSize = (this.m_nSize/2)|0;
		const nObjectTop = parseInt(this.m_nodeThis.style.top);
		if( !this.m_bConsec ) {
			if( nObjectTop+nObjectHalfSize < nMinY || nObjectTop+nObjectHalfSize >= nMaxY )
				return;
		}

		// 이전 발사와 간격이 짧으면 쏘지 않음
		const nCurFrame = g_App.m_nFrameCount;
		if( this.m_bConsec ) {
			if( ((nCurFrame)-this.m_nFiredFrame) < 16 ) {
				return;
			}
		}
		else {
			if( ((nCurFrame)-this.m_nFiredFrame) < this.m_nRestPeriod )
				return;

			// 가능성이 낮으면 쏘지 않음
			if( _random(1000) > this.m_nFiringPossibility*10 ) {
				return;
			}
		}
		this.m_nFiredFrame = nCurFrame;
		m_bFirstShot = false;

		// 첫 탄일 때 연사 여부
		if( this.m_nConsec == 0 ) {
			this.m_bConsec = false;
			const nPossibility = (nAreaNo <= 4)? 12 : 25;
			if( _random(100) < nPossibility )
				this.m_bConsec = true;
		}

		// 해치 개폐 애니메이션이 없으면 즉시 발사
		if( !this.m_bHasHatch ) {
			this.ShootSpario(0,0);
		}
		// 해치 개폐 애니메이션을 Move에서 수행
		else {
			this.m_nFiring = 1;
		}

		if( this.m_bConsec ) {
			this.m_nConsec++;
			if( this.m_nConsec >= this.m_nMaxConsec ) {	// 연사 수가 상한이면 연사 종료
	 			this.m_nConsec = 0;
				this.m_bConsec = false;
			}
		}
	}
}

_inherit( Barra, GroundObject );
function Barra() {
	this.base();
	this.m_nType = OBJECT_BARRA;
	this.m_strName = 'BARRA';
	this.m_nBKOftY = 0;
	this.m_nScore = 100;
	this.m_bNeedPalette = false;

	Barra.prototype.Create = function( objArea, nX, nY ) {
		GroundObject.prototype.Create.call( this, objArea, nX, nY );
		this.AddTriangularShadow();
	}
}

_inherit( Logram, GroundObject );
function Logram() {
	this.base();
	this.m_nType = OBJECT_LOGRAM;
	this.m_strName = 'LOGRAM';
	this.m_nBKOftY = -16;
	this.m_nScore = 300;
	this.m_bCanFire = true;
	this.m_nRestPeriod = 450;
	this.m_nFiringPossibility = 1;
	this.m_nMaxConsec = 2;
	this.m_bHasHatch = true;

}

_inherit( Zolbak, GroundObject );
function Zolbak() {
	this.base();
	this.m_nType = OBJECT_ZOLBAK;
	this.m_strName = 'ZOLBAK';
	this.m_nBKOftY = -32;
	this.m_nScore = 200;

	Zolbak.prototype.Hit = function() {
		GroundObject.prototype.Hit.call( this );
		g_App.GetGameObject().AddFlyingEnemyIndex( -2 );
	}
}

_inherit( Derota, GroundObject );
function Derota() {
	this.base();
	this.m_nType = OBJECT_DEROTA;
	this.m_strName = 'DEROTA';
	this.m_nBKOftY = -64;
	this.m_nScore = 1000;
	this.m_bCanFire = true;
	this.m_nRestPeriod = 80;
	this.m_nFiringPossibility = 27;
	this.m_nMaxConsec = 3;
}

_inherit( BozaLogram, GroundObject );
function BozaLogram() {
	this.base();
	this.m_nType = OBJECT_BOZALOGRAM;
	this.m_strName = 'BOZA LOGRAM';
	this.m_nBKOftY = -80;
	this.m_nScore = 600;
	this.m_objLogramAr = [];
	this.m_bCanFire = false;
	this.m_nRestPeriod = 150;
	this.m_nFiringPossibility = 12;

	BozaLogram.prototype.Create = function( objArea, nX, nY ) {
		GroundObject.prototype.Create.call( this, objArea, nX, nY );
		this.GetNode().style.zIndex = 2;
	}
	
	this.AddLogram = function( objLogram ) {
		this.m_objLogramAr[this.m_objLogramAr.length] = objLogram;
		objLogram.m_nRestPeriod = this.m_nRestPeriod;
		objLogram.m_nFiringPossibility = this.m_nFiringPossibility;
	}

	BozaLogram.prototype.Hit = function() {
		// 파괴되지 않은 분기 수
		let nLograms = 0;
		for( let i=0; i<this.m_objLogramAr.length; i++ ) {
			const objLogram = this.m_objLogramAr[i];
			if( objLogram.m_nHitCount == 0 ) {
				nLograms++;
				// 남아 있는 분기 포대는 점수 0으로 파괴
				objLogram.m_nScore = 0;
				objLogram.Hit();
			}
		}
		// 분기가 모두 남아 있으면 2000점
		if( nLograms == 4 ) {
			this.m_nScore = 2000;

			// 폭격 범위 안의 분기 포대는 점수를 준다
			const posTarget = g_App.GetSolvalouObject().GetBombingPos();
			for( let i=0; i<this.m_objLogramAr.length; i++ ) {
				const objLogram = this.m_objLogramAr[i];
				/*
				const nLeft = parseInt(objLogram.m_nodeThis.style.left) + objLogram.m_nHitAreaX;
				const nRight = nLeft + objLogram.m_nHitAreaW;
				const nTop = parseInt(objLogram.m_nodeThis.style.top) + objLogram.m_nHitAreaY;
				const nBottom = nTop + objLogram.m_nHitAreaH;
				*/
				const nLeft = parseInt(objLogram.m_nodeThis.style.left);
				const nRight = nLeft + 16;
				const nTop = parseInt(objLogram.m_nodeThis.style.top);
				const nBottom = nTop + 16;
				if( posTarget.x >= nLeft && posTarget.x <= nRight &&
				    posTarget.y >= nTop  && posTarget.y <= nBottom )
					this.m_nScore += 300;
			}
		}
		GroundObject.prototype.Hit.call( this );
	}
}

_inherit( Grobda, GroundObject );
function Grobda() {
	this.base();
	this.m_nType = OBJECT_GROBDA
	this.m_strName = 'GROBDA';
	this.m_nBKOftY = -96;
	this.m_nPictureCount = 1;
	this.m_nMovingCount = 0;

	Grobda.prototype.Progress = function( nStep ) {
		const nY = parseInt( this.m_nodeThis.style.top ) + nStep;
		if( nY >= -16 && nY < SCREEN_HEIGHT ) {
			this.m_nodeThis.style.top = nY + 'px';
			const nOftX = -16 * this.m_nPictureCount;
			this.m_nodePicture.style.backgroundPosition = nOftX + 'px ' + this.m_nBKOftY + 'px';
			this.m_nPictureCount++;
			if( this.m_nPictureCount > 4 )
				this.m_nPictureCount = 1;
		}
	}

	Grobda.prototype.Reverse = function( nStep ) {
		const nY = parseInt( this.m_nodeThis.style.top ) - nStep;
		if( nY >= -16 && nY < SCREEN_HEIGHT ) {
			this.m_nodeThis.style.top = nY + 'px';
			const nOftX = -16 * (5-this.m_nPictureCount);
			this.m_nodePicture.style.backgroundPosition = nOftX + 'px ' + this.m_nBKOftY + 'px';
			this.m_nPictureCount++;
			if( this.m_nPictureCount > 4 )
				this.m_nPictureCount = 1;
		}
	}
}

_inherit( Grobda1, Grobda );
function Grobda1() {
	this.base();
	this.m_nType = OBJECT_GROBDA+1;
	this.m_strName = 'GROBDA1';
	this.m_nScore = 200;
}

_inherit( Grobda2, Grobda );
function Grobda2() {
	this.base();
	this.m_nType = OBJECT_GROBDA+2;
	this.m_strName = 'GROBDA2';
	this.m_nScore = 400;

	Grobda2.prototype.Move = function() {
		if( !GroundObject.prototype.Move.call(this) )
			return false;

		Grobda.prototype.Progress.call( this, 1 );
		return true;
	}
}

_inherit( Grobda3, Grobda );
function Grobda3() {
	this.base();
	this.m_nType = OBJECT_GROBDA+3;
	this.m_strName = 'GROBDA3';
	this.m_nScore = 600;

	Grobda3.prototype.Move = function() {
		if( !GroundObject.prototype.Move.call(this) )
			return false;

		const nY = parseInt( this.m_nodeThis.style.top );
		if( nY >= -16 && nY < SCREEN_HEIGHT ) {
			let posTarget = g_App.GetSolvalouObject().GetTargetPos();
			if( this.m_nMovingCount > 0 || Object.prototype.HitTest.call(this, posTarget.x, posTarget.y, true) ) {
				Grobda.prototype.Progress.call( this, 1 );
				this.m_nMovingCount++;
			}
		}
		return true;
	}
}

_inherit( Grobda4, Grobda );
function Grobda4() {
	this.base();
	this.m_nType = OBJECT_GROBDA+4;
	this.m_strName = 'GROBDA4';
	this.m_nScore = 1000;

	Grobda4.prototype.Move = function() {
		if( !GroundObject.prototype.Move.call(this) )
			return false;

		const nY = parseInt( this.m_nodeThis.style.top );
		if( nY >= -16 && nY < SCREEN_HEIGHT ) {
			if( this.m_nMovingCount >= 0 ) {
				let posTarget = g_App.GetSolvalouObject().GetTargetPos();
				if( Object.prototype.HitTest.call(this, posTarget.x, posTarget.y, true) ) {
					this.m_nMovingCount++;
					if( this.m_nMovingCount >= 22 )
						this.m_nMovingCount = -1;
					return true;
				}
			}

			Grobda.prototype.Progress.call( this, 1 );
		}
		return true;
	}
}

_inherit( Grobda5, Grobda );
function Grobda5() {
	this.base();
	this.m_nType = OBJECT_GROBDA+5;
	this.m_strName = 'GROBDA5';
	this.m_nScore = 1500;

	Grobda5.prototype.Move = function() {
		if( !GroundObject.prototype.Move.call(this) )
			return false;

		if( this.m_nMovingCount < 0 )
			return true;

		const nY = parseInt( this.m_nodeThis.style.top );
		if( nY >= -16 && nY < SCREEN_HEIGHT ) {
			let posTarget = g_App.GetSolvalouObject().GetBombingPos();
			if( this.m_nMovingCount > 0 || Object.prototype.HitTest.call(this, posTarget.x, posTarget.y, true) ) {
				Grobda.prototype.Reverse.call( this, 1 );
				this.m_nMovingCount++;
				if( this.m_nMovingCount > 22 )
					this.m_nMovingCount = -1;
			}
		}
		return true;
	}

}

_inherit( Grobda6, Grobda );
function Grobda6() {
	this.base();
	this.m_nType = OBJECT_GROBDA+6;
	this.m_strName = 'GROBDA6';
	this.m_nScore = 1500;
}

_inherit( Grobda7, Grobda );
function Grobda7() {
	this.base();
	this.m_nType = OBJECT_GROBDA+7;
	this.m_strName = 'GROBDA7';
	this.m_nScore = 2000;

	Grobda7.prototype.Move = function() {
		if( !GroundObject.prototype.Move.call(this) )
			return false;

		Grobda.prototype.Progress.call( this, 1 );
		if( this.m_nMovingCount < 0 )
			return true;

		const nY = parseInt( this.m_nodeThis.style.top );
		if( nY >= -16 && nY < SCREEN_HEIGHT ) {
			let posTarget = g_App.GetSolvalouObject().GetTargetPos();
			if( this.m_nMovingCount > 0 || Object.prototype.HitTest.call(this, posTarget.x, posTarget.y, true) ) {
				Grobda.prototype.Progress.call( this, 1 );
				this.m_nMovingCount++;
				if( this.m_nMovingCount > 22 )
					this.m_nMovingCount = -1;
			}
		}
		return true;
	}
}

_inherit( Grobda8, Grobda );
function Grobda8() {
	this.base();
	this.m_nType = OBJECT_GROBDA+8;
	this.m_strName = 'GROBDA8';
	this.m_nScore = 2500;

	Grobda8.prototype.Move = function() {
		if( !GroundObject.prototype.Move.call(this) )
			return false;

		Grobda.prototype.Progress.call( this, 1 );
		if( this.m_nMovingCount < 0 )
			return true;

		const nY = parseInt( this.m_nodeThis.style.top );
		if( nY >= -16 && nY < SCREEN_HEIGHT ) {
			let posTarget = g_App.GetSolvalouObject().GetBombingPos();
			if( this.m_nMovingCount > 0 || Object.prototype.HitTest.call(this, posTarget.x, posTarget.y, true) ) {
				Grobda.prototype.Reverse.call( this, 2 );
				this.m_nMovingCount++;
				if( this.m_nMovingCount > 22 )
					this.m_nMovingCount = -1;
			}
		}
		return true;
	}
}

_inherit( Grobda9, Grobda );
function Grobda9() {
	this.base();
	this.m_nType = OBJECT_GROBDA+9;
	this.m_strName = 'GROBDA9';
	this.m_nScore = 10000;

	Grobda9.prototype.Move = function() {
		if( !GroundObject.prototype.Move.call(this) )
			return false;

		const nY = parseInt( this.m_nodeThis.style.top );
		if( nY >= -16 && nY < SCREEN_HEIGHT ) {
			let posTarget = g_App.GetSolvalouObject().GetBombingPos();
			if( this.m_nMovingCount > 0 || Object.prototype.HitTest.call(this, posTarget.x, posTarget.y, true) ) {
				Grobda.prototype.Progress.call( this, 2 );
				this.m_nMovingCount++;
				if( this.m_nMovingCount > 22 )
					this.m_nMovingCount = 0;
			}
		}
		return true;
	}
}

_inherit( Sol, GroundObject );
function Sol() {
	this.base();
	this.m_nType = OBJECT_SOL;
	this.m_strName = 'SOL';
	this.m_nBKOftX = 0;
	this.m_nBKOftY = 0;
	this.m_nScore = 2000;
	this.m_nSolHit = 0;
	this.m_bNeedPalette = false;

	Sol.prototype.Create = function( objArea, nX, nY ) {
		GroundObject.prototype.Create.call( this, objArea, nX, nY );
		this.m_nodeThis.classList.remove( 'size16' );
		this.m_nodePicture.classList.remove( 'size16' );
		this.m_nodeThis.classList.add( 'size32' );
		this.m_nodePicture.classList.add( 'size32' );
		this.m_nodePicture.classList.add( 'sol' );
	}

	Sol.prototype.ShowCinder = function() {
		GroundObject.prototype.ShowCinder.call( this );
		this.m_nodeThis.classList.remove( 'size32' );
		this.m_nodePicture.classList.remove( 'size32' );
		this.m_nodeThis.classList.add( 'size16' );
		this.m_nodePicture.classList.add( 'size16' );
		this.m_nodePicture.classList.remove( 'sol' );
		this.m_nodePicture.classList.add( 'ground_object' );
	}
	
	Sol.prototype.Move = function() {
		// 출현한 솔인 경우
		if( this.m_nSolHit == 2 )
			return GroundObject.prototype.Move.call( this );

		// 출현 애니메이션
		if( this.m_nHitCount > 0 ) {
			const nOftX = -32 * ((this.m_nHitCount/8)|0);
			this.m_nodePicture.style.backgroundPosition = nOftX + 'px 0px';
			this.m_nHitCount++;
			if( this.m_nHitCount > 56 ) {
				this.m_nHitCount = 0;
				this.m_nodeExplosion.style.visibility = 'hidden';
			}
		}
		return true;
	}

	Sol.prototype.Hit = function() {
		this.m_nSolHit++;
		// 출현 위치를 맞춤
		if( this.m_nSolHit == 1 ) {
			Object.prototype.Hit.call( this );
			g_objSound.Stop('idSndGExp');
			g_objSound.Play('idSndGExp');
			if( g_App.GetMapObject().GetCurrentAreaNumber() == 6 )
				g_nExtraAreaFlag |= 0x20;
		}
		// 출현한 솔을 맞춤
		else if( this.m_nSolHit == 2 ) {
			GroundObject.prototype.Hit.call( this );
		}
	}
}

// 출현한 스페셜 플래그(solvarou.js에서 참조)
let g_objSpecial = null;

_inherit( Special, GroundObject );
function Special() {
	this.base();
	this.m_nType = OBJECT_SPECIAL;
	this.m_strName = 'SPECIAL';
	this.m_nBKOftY = -112;
	this.m_nScore = 1000;
	this.m_bBreakable = false;
	this.m_bHidden = true;
	this.m_bNeedPalette = false;

	Special.prototype.Create = function( objArea, nX, nY ) {
		GroundObject.prototype.Create.call( this, objArea, nX, nY );
		if( !DEBUG_LEVEL)
			this.m_nodePicture.style.visibility = 'hidden';
		g_objSpecial = null;
	}

	Special.prototype.Move = function() {
		const nY = parseInt( this.m_nodeThis.style.top );
		if( nY >= -32 && nY < -16 )
			this.SetInitialXPos(8); // X 위치가 이미 결정되었으면 아무것도 하지 않고 반환하므로 여러 번 호출해도 OK
		return true;
	}

	Special.prototype.Hit = function() {
		if( g_objSpecial )									//출현한 깃발을 다시 폭격할 수 없도록
			return;
		g_App.GetScoreObject().AddScore( this.m_nScore );
		this.m_nHitCount = 0;								//폭발 처리를 하지 않도록
		this.m_nodePicture.style.visibility = 'visible';
		this.m_nodeThis.classList.add( 'special' );
		g_objSpecial = this;
		g_objSound.Play( 'idSndGExp' );

		switch( g_App.GetMapObject().GetCurrentAreaNumber() ) {
			case 1: g_nExtraAreaFlag |= 0x02;  break;
			case 3: g_nExtraAreaFlag |= 0x04;  break;
			case 5: g_nExtraAreaFlag |= 0x08;  break;
			case 7: g_nExtraAreaFlag |= 0x10;  break;
		}
	}

	this.FlagTaken = function() {
		g_objSound.Play( 'idSndSpecial' );
		this.m_nodeThis.classList.remove( 'special' );		//다시 검색되지 않도록(solvarou.js)
		g_objSpecial = null;
		this.m_nHitCount = -1;
		this.m_nodePicture.style.visibility = 'hidden';
		const objRemain = g_App.GetRemainObject();
		objRemain.Increase( false );
	}
}

_inherit( Copyright, GroundObject );
function Copyright() {
	this.base();
	this.m_nType = OBJECT_COPYRIGHT;
	this.m_strName = 'COPYRIGHT';
	this.m_nBKOftX = 0;
	this.m_nBKOftY = 0;
	this.m_nScore = 10;
	this.m_bBreakable = true;
	this.m_bHidden = true;
	this.m_bNeedPalette = false;

	Copyright.prototype.Create = function( objArea, nX, nY ) {
		GroundObject.prototype.Create.call( this, objArea, nX, nY );
		//this.m_nodePicture.style.background = 'red';
	}

	Copyright.prototype.Move = function() {	// 아무것도 하지 않기 위해 오버라이드
		return true;
	}

	Copyright.prototype.Hit = function() {
		if( g_App.GetMapObject().GetCurrentArea().GetAreaNo() != 1 )
			return;

		GroundObject.prototype.Hit.call( this );
		this.m_nodeExplosion.style.visibility = 'hidden';

		const nodeMessage = document.getElementById('idMessage');
		const objText = g_App.GetTextObject();
		objText.Clear( nodeMessage );
		//objText.Print( nodeMessage, 83,1, 'Ported by AJ.' );
		//objText.Print( nodeMessage, 76,12, 'Thanks for EVEZOO.' )
		objText.Print( nodeMessage, 80,1, 'UNAUTHORIZED COPY.','yellow' );
		objText.Print( nodeMessage, 73,12, 'Don' );
		objText.Print( nodeMessage, 95,12, "'" );
		objText.Print( nodeMessage, 101,12, 't' );
		objText.Print( nodeMessage, 111,12, 'sue,please.' );
		nodeMessage.style.display = 'block';
		const cb = function() {
			nodeMessage.style.display = 'none';
			objText.Clear( nodeMessage );
		}
		setTimeout( cb, 3000 );
		g_nExtraAreaFlag |= 0x01;
	}
}

_inherit( Bridge, GroundObject );
function Bridge( nOption ) {
	this.base();
	this.m_nType = OBJECT_BRIDGE;
	this.m_strName = 'Bridge';
	this.m_bBreakable = false;
	this.m_bHidden = false;
	this.m_bNeedPalette = false;

	Bridge.prototype.Create = function( objArea, nX, nY ) {
		GroundObject.prototype.Create.call( this, objArea, nX, nY );
		this.m_nodeThis.classList.remove( 'size16' );
		this.m_nodeThis.classList.add( 'size32' );
		this.m_nodePicture.classList.remove( 'size16' );
		this.m_nodePicture.classList.add( 'size32' );
		this.m_nodePicture.classList.remove( 'ground_object' );
		this.m_nodePicture.classList.add( 'bridge' );
		this.m_nodeThis.style.zIndex = 0;
		let nOftX = 0;
		if( nOption == 0 )
			nOftX = -32;
		this.m_nodePicture.style.backgroundPosition = nOftX + 'px 0px';
	}

	Bridge.prototype.Move = function() {	// 아무것도 하지 않기 위해 오버라이드
		return true;
	}
}
