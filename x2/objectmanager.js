
const MAX_SPARIOS = 19;
const MAX_OBJECTS = 6;

function ObjectManager() {
	const m_objAr = [];
	let m_nSparios = 0;
	let m_nObjects = 0;

	function isLimitedObject( nType ) {
		if( nType == OBJECT_TOROID  || nType == OBJECT_JARA  ||
		    nType == OBJECT_TORKAN  || nType == OBJECT_KAPI  ||
		    nType == OBJECT_TERRAZI || nType == OBJECT_ZOSHI ||
		    nType == OBJECT_ZAKATO )
			return true;
		return false;
	}

	function decNumSpario( obj ) {
		if( obj.m_nType == OBJECT_SPARIO ) {
			m_nSparios--;
			if( m_nSparios < 0 )
				m_nSparios = 0;
		}
	}

	function decNumObject( obj ) {
		if( isLimitedObject(obj.m_nType) ) {
			m_nObjects--;
			if( m_nObjects < 0 )
				m_nObjects = 0;
		}
	}

	this.NumSparios = function() {
		return m_nSparios;
	}

	this.NumObjects = function() {
		return m_nObjects;
	}

	this.Create = function( nType, nOpt ) {
		let obj;

		if( isLimitedObject(nType) ) {
			if( m_nObjects >= MAX_OBJECTS )
				return null;
			m_nObjects++;
		}

		switch(nType) {
			case OBJECT_SPARIO:
				if( m_nSparios >= MAX_SPARIOS )
					return;
				m_nSparios++;
				obj = new Spario();
				break;
			case OBJECT_GSPARIO:
				obj = new GSpario();
				break;
			case OBJECT_BSPARIO:
				obj = new BSpario();
				break;
			case OBJECT_TOROID:
				obj = new Toroid( nOpt );
				break;
			case OBJECT_JARA:
				obj = new Jara( nOpt );
				break;
			case OBJECT_TORKAN:
				obj = new Torkan();
				break;
			case OBJECT_KAPI:
				obj = new Kapi();
				break;
			case OBJECT_TERRAZI:
				obj = new Terrazi();
				break;
			case OBJECT_ZOSHI:
				obj = new Zoshi( nOpt );
				break;
			case OBJECT_ZAKATO:
				obj = new Zakato( nOpt );
				break;
			case OBJECT_BZAKATO:
				obj = new BZakato( nOpt );
				break;
			case OBJECT_GZAKATO:
				obj = new GZakato();
				break;
			case OBJECT_BACURA:
				obj = new Bacura();
				break;
			case OBJECT_SHEONITE:
				obj = new Sheonite();
				break;
			case OBJECT_BRAGZA:
				obj = new Bragza( nOpt );
				break;
			case OBJECT_ANDORGEN:
				obj = new AndorGen();
				break;
			case OBJECT_OGAWA:
				obj = new Ogawa();
				break;
			case OBJECT_GALBOSS:
				obj = new GalBoss();
				break;
			default:
				m_nObjects--;
				return null;
		}

		this.AddObject( obj );
		return obj;
	}

	this.AddObject = function( obj ) {
		m_objAr[m_objAr.length] = obj;
	}

	this.DeleteObject = function( obj ) {
		for( let i=m_objAr.length-1; i>=0; i-- ) {
			if( m_objAr[i] == obj ) {
				decNumSpario( obj );
				decNumObject( obj );

				m_objAr.splice( i, 1 );
				obj.Delete();
				obj = null;
				break;
			}
		}
	}

	this.DeleteAllObjects = function() {
		for( let i=m_objAr.length-1; i>=0; i-- ) {
			let obj = m_objAr[i];
			obj.Delete();
			obj = null;
		}
		m_objAr.splice( 0, m_objAr.length );
		m_nSparios = 0;
		m_nObjects = 0;
	}

	this.GetObjectAr = function() {
		return m_objAr;
	}

	this.GetObject = function( nObjType ) {
		for( let i=m_objAr.length-1; i>=0; i-- ) {
			if( m_objAr[i].m_nType == nObjType )
				return m_objAr[i];
		}
		return null;
	}

	this.Move = function() {
		g_Debug.Clear();
		g_Debug.Print('Objects:'+m_nObjects);
		g_Debug.Print('Sparios:'+m_nSparios);

		for( let i=m_objAr.length-1; i>=0; i-- ) {
			let obj = m_objAr[i];
			if( !obj.Move() ) {
				decNumSpario( obj );
				decNumObject( obj );

				m_objAr.splice( i, 1 );
				obj.Delete();
				obj = null;
			}
		}
	}
}
