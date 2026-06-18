
const OBJECT_GARUBARRA  = 101;
const OBJECT_GARUDEROTA = 102;

_inherit( BigGroundObject, GroundObject );
function BigGroundObject() {
	this.base();
	this.m_nBKOftX = -40;
	this.m_nHitAreaX = 20-4-5;
	this.m_nHitAreaY = 20-4-5;
	this.m_nSize = 40;

	BigGroundObject.prototype.Create = function( objArea, nX, nY ) {
		GroundObject.prototype.Create.call( this, objArea, nX, nY );
		this.m_nodeThis.classList.remove( 'size16' );
		this.m_nodePicture.classList.remove( 'size16' );
		this.m_nodePalette.classList.remove( 'size16' );
		this.m_nodeThis.classList.add( 'size40' );
		this.m_nodePicture.classList.add( 'size40' );
		this.m_nodePalette.classList.add( 'size40' );
		this.m_nodePicture.classList.add( 'big_ground_object' );
		this.m_nodePalette.classList.add( 'big_ground_palette' );

		this.m_nodeExplosion.style.left = '4px';
		this.m_nodeExplosion.style.top = '4px';
	}

	BigGroundObject.prototype.ShowCinder = function() {
		this.m_nodePicture.style.backgroundPosition = '-80px ' +  this.m_nBKOftY + 'px';
		this.m_nodePalette.style['-webkit-mask-position'] = '0px ' +  this.m_nBKOftY + 'px';
		this.m_nodePalette.style.visibility = 'visible';
	}

	BigGroundObject.prototype.Hit = function() {
		GroundObject.prototype.Hit.call( this );
		this.m_nodePicture.style.visibility = 'visible';
	}
}

_inherit( GaruBarra, BigGroundObject );
function GaruBarra() {
	this.base();
	this.m_nType = OBJECT_GARUBARRA;
	this.m_strName = 'GARU BARRA';
	this.m_nBKOftY = -0;
	this.m_nScore = 300;

	GaruBarra.prototype.Create = function( objArea, nX, nY ) {
		BigGroundObject.prototype.Create.call( this, objArea, nX, nY );
		this.AddTriangularShadow();
	}
}

_inherit( GaruDerota, BigGroundObject );
function GaruDerota() {
	this.base();
	this.m_nType = OBJECT_GARUDEROTA;
	this.m_strName = 'GARU DEROTA';
	this.m_nBKOftY = -40;
	this.m_nScore = 2000;
	this.m_bCanFire = true;
	this.m_nRestPeriod = 50;
	this.m_nFiringPossibility = 38;
	this.m_nMaxConsec = 3;
}
