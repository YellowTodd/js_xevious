
window.AudioContext = window.AudioContext || window.webkitAudioContext;
try {
	g_AudioContext = new AudioContext();	
} catch (error) {
	g_AudioContext = null;
}

var g_objSound = null;
var SOUND_BGM = 1;
var SOUND_SE  = 2;

function SoundStruct( strID, strSrc, nType ) {
	this.m_strID        = strID;
	this.m_nType        = nType;
	this.m_bLoaded      = false;
	this.m_bPlaying     = false;
	this.m_nType        = nType;
	this.m_nStartTime   = 0;
	this.m_nRepeats     = 1;
	this.m_nCurLoop     = -1;
	this.m_playbackRate = 1.0;
	this.m_nVol         = 100;
	this.m_fPanValue    = 0;
	this.m_bMuted       = false;
	this.m_fDetune      = 0;

	this.m_oAudio       = null;
	this.m_bufferSource = null;
	this.m_gain         = null;
	this.m_pan          = null;
	this.m_filter       = null;
	this.m_buffer       = null;

	var objThis = this;

	this.OnEnded = function () {
		objThis.m_bPlaying = false;
		if( objThis.m_nRepeats < 0 )
			return;

		if( --objThis.m_nCurLoop > 0 ) {
			objThis.Stop();
			objThis.Play();
		}
	}

	if( g_AudioContext ) {
		var request = new XMLHttpRequest;
		request.open( 'GET', strSrc, true );
		request.responseType = 'arraybuffer';

		request.onload = function() {
			g_AudioContext.decodeAudioData( request.response, function(buffer) {
				objThis.m_buffer = buffer;
				objThis.m_bLoaded = true;
			}, function() {
				objThis.m_bLoaded = true;
			});
		}
		request.onerror = function() {
			objThis.m_bLoaded = true;
		}
		request.send();
	}
	else {
		this.m_oAudio = new Audio('audio');
		this.m_oAudio.src     = strSrc;
		this.m_oAudio.preload = 'auto';
		this.m_oAudio.volume  = 1;
		this.m_oAudio.muted   = false;
		this.m_oAudio.loop    = false;

		this.m_oAudio.oncanplaythrough = function () {
			objThis.m_oAudio.currentTime = objThis.m_nStartTime/1000.0;
			objThis.m_bLoaded = true;
			objThis.m_oAudio.oncanplaythrough = null;
		}
		this.m_oAudio.onerror = function() {
			objThis.m_bLoaded = true;
		}

		this.m_oAudio.onended = function() {
			objThis.OnEnded();
		}
	}

	this.IsLoaded = function() {
		return this.m_bLoaded;
	}

	this.GetAudio = function() {
		return this.m_oAudio;
	}

	this.GetID = function() {
		return m_striD;
	}

	this.SetType = function( nType ) {
		this,m_nType = nType;
	}
	this.GetType = function() {
		return this.m_nType;
	}

	this.SetStartTime = function( nStartTime ) {
		this.m_nStartTime = nStartTime;
	}
	this.GetStartTime = function() {
		return this.m_nStartTime;
	}

	this.SetLoopCount = function( nLoop ) {
		if( nLoop <= 0 ) {
			this.m_nRepeats = this.m_nCurLoop = -1;
			if( !g_AudioContext )
				this.m_oAudio.loop = true;
		}
		else {
			this.m_nRepeats = this.m_nCurLoop = nLoop;
			if( !g_AudioContext )
				this.m_oAudio.loop = false;
		}
	}
	this.GetLoopCount = function() {
		return this.m_nRepeats
	}


	this.GetStartTime = function() {
		return this.m_nStartTime;
	}

	this.SetVolume = function( nVol ) {
		if( nVol < 0 )
			nVol = 0;
		if( nVol > 100 )
			nVol = 100;
		this.m_nVol = nVol;

		if( this.m_bMuted )
			return;
		if( g_AudioContext ) {
			if( this.m_gain ) {
				this.m_gain.gain.value = this.m_nVol/100;
			}
		}
		else {
			this.m_oAudio.volume = this.m_nVol/100;
		}
	}
	
	this.GetVolume = function() {
		return this.m_nVol;
	}

	this.SetInitialVolume = function( nVol ) {
		this.m_nInitialVol = nVol;
	}
	
	this.GetInitialVolume = function() {
		return this.m_nInitialVol;
	}
	
	this.SetPlaybackRate = function( playbackRate ) {
		this.m_playbackRate = playbackRate;

		if( this.IsMuted() ) {
			this.m_gain.gain.value = 0;
			return;
		}

		if( g_AudioContext ) {
			if( this.m_bufferSource ) {
				this.m_bufferSource.playbackRate.value = playbackRate;
			}
		}
		else {
			this.m_oAudio.playbackRate = this.m_playbackRate;
		}
	}
	this.GetPlaybackRate = function() {
		return this.m_playbackRate;
	}

	this.SetDetune = function( fDetune ) {
		this.m_fDetune = fDetune;
		if( g_AudioContext ) {
			if( this.m_bufferSource ) {
				this.m_bufferSource.detune.value = this.m_fDetune;
			}
		}
	}
	this.GetDetune = function() {
		return this.m_fDetune;
	}

	this.SetPan = function( fPan ) {
		if( fPan < -1 )
			fPan = -1;
		if( fPan > 1 )
			fPan = 1;
		this.m_fPanValue = fPan;
		if( g_AudioContext ) {
			if( this.m_pan )
				this.m_pan.pan.value = this.m_fPanValue;
		}
	}
	this.GetPan = function() {
		return this.m_fPanValue;
	}

	this.Mute = function( bMute ) {
		this.m_bMuted = bMute;
		if( g_AudioContext ) {
			if( this.m_gain ) {
				if( bMute ) {
					this.m_gain.gain.value = 0;
				}
				else {
					this.m_gain.gain.value = this.m_nVol/100;
				}
			}
		}
		else {
			this.m_oAudio.muted = bMute;
		}
	}
	this.IsMuted = function() {
		return this.m_bMuted;
	}

	this.Play = function() {
		if( this.m_bPlaying )
			return;

		if( g_AudioContext ) {
			if( !this.m_gain )
				this.m_gain = g_AudioContext.createGain();

			if( !this.m_pan )
				this.m_pan = g_AudioContext.createStereoPanner();

			if( !this.m_filter )
				this.m_filter = g_AudioContext.createBiquadFilter();

			this.m_gain.connect( g_AudioContext.destination );
			this.m_pan.connect(this.m_gain );
			this.m_filter.connect( this.m_pan );

			this.m_bufferSource = g_AudioContext.createBufferSource();
			this.m_bufferSource.connect( this.m_filter );
			this.m_bufferSource.buffer = this.m_buffer;

			this.m_gain.gain.value = this.m_bMuted? 0 : this.m_nVol/100;
			this.m_filter.type = 'lowpass';
			this.m_filter.frequency.value = 20000;

			if(this.m_nRepeats >= 0) {
				this.m_bufferSource.loop = false;
				this.m_bufferSource.removeEventListener( 'ended', objThis.OnEnded );
				this.m_bufferSource.addEventListener( 'ended', objThis.OnEnded );
			}
			else {
				this.m_bufferSource.loop = true;
				this.m_bufferSource.onended = null;
			}
			this.m_bufferSource.playbackRate.value = this.m_playbackRate;
			this.m_bufferSource.detune.value = this.m_fDetune;
			this.m_bufferSource.start( 0, this.m_nStartTime/1000);
			
		}
		else {
			this.m_oAudio.volume = this.m_nVol/100;
			this.m_oAudio.currentTime = this.m_nStartTime/1000.0;
			this.m_oAudio.play();
			this.m_oAudio.playbackRate = this.m_playbackRate;
		}

		this.m_bPlaying = true;
	}
	this.IsPlaying = function() {
		return this.m_bPlaying;
	}

	this.Stop = function() {
		if( !this.m_bPlaying )
			return;

		if( g_AudioContext ) {
			if( this.m_bufferSource )
				this.m_bufferSource.stop();
			this.m_bufferSource = null;
		}
		else {
			this.m_oAudio.pause();
			this.m_oAudio.currentTime = this.m_nStartTime/1000.0;
		}
		this.m_bPlaying = false;
	}
}

function SoundManager() {
	this.m_SoundAr = new Array;
	this.m_nLoading = 0;

	this.LoadSound = function( strID, strSrc, nType, nVol, nLoop, nStartTime, nEndTime, fPitch, nSpeed ) {
		var objSoundStruct = new SoundStruct( strID, strSrc, nType );
		this.m_SoundAr[this.m_SoundAr.length] = objSoundStruct;
		objSoundStruct.SetVolume( nVol );
		objSoundStruct.SetInitialVolume( nVol );
		objSoundStruct.SetLoopCount(nLoop );
		objSoundStruct.SetStartTime( nStartTime );
		objSoundStruct.SetPlaybackRate( fPitch );
		objSoundStruct.SetDetune( nSpeed );

		this.m_nLoading++;
	}

	this.NumLoading = function() {
		return this.m_nLoading;
	}

	this.NumLoaded = function() {
		var nLoaded = 0;
		for( var i=0; i<this.m_SoundAr.length; i++ ) {
			var objSoundStruct = this.m_SoundAr[i];
			if( objSoundStruct.m_bLoaded )
				nLoaded++;
		}
		return nLoaded;
	}

	this.IsAudioAPIAvailable = function() {
		return g_AudioContext? true : false;
	}

	this.GetSoundStruct = function( strID ) {
		for( var i=0; i<this.m_SoundAr.length; i++ ) {
			var objSoundStruct = this.m_SoundAr[i];
			if( strID == objSoundStruct.m_strID )
				return objSoundStruct;
		}
		return null;
	}

	this.Mute = function( bMute ) {
		for( var i=0; i<this.m_SoundAr.length; i++ ) {
			var objSoundStruct = this.m_SoundAr[i];
			objSoundStruct.Mute(bMute);
		}
	}

	this.Pause = function( bPause ) {
		if( g_AudioContext ) {
			if( bPause )
				g_AudioContext.suspend();
			else
				g_AudioContext.resume();
		}
	}

	this.Play = function( strID, bForce ) {
		if( g_App && g_App.IsDemoMode() && !bForce )
			return;
		if( strID == '' )
			return;

		var objSoundStruct = this.GetSoundStruct( strID );
		if( !objSoundStruct)
			return;

		objSoundStruct.Play();
	}

	this.IsPlaying = function( strID ) {
		if( strID == '' )
			return false;

		var objSoundStruct = this.GetSoundStruct( strID );
		if( !objSoundStruct)
			return false;

		return objSoundStruct.IsPlaying();
	}

	this.Stop = function( strID ) {
		if( strID == '' )
			return;

		var objSoundStruct = this.GetSoundStruct( strID );
		if( !objSoundStruct)
			return;

		objSoundStruct.Stop();
	}

	this.SetVolume = function( strID, nVol ) {
		if( strID == '' )
			return;

		var objSoundStruct = this.GetSoundStruct( strID );
		if( !objSoundStruct)
			return;

		objSoundStruct.SetVolume( nVol );
	}

	this.GetVolume = function( strID ) {
		if( strID == '' )
			return 0;

		var objSoundStruct = this.GetSoundStruct( strID );
		if( !objSoundStruct)
			return 0;

		return objSoundStruct.GetVolume();
	}

	this.GetInitialVolume = function( strID ) {
		if( strID == '' )
			return 0;

		var objSoundStruct = this.GetSoundStruct( strID );
		if( !objSoundStruct)
			return 0;

		return objSoundStruct.GetInitialVolume();
	}

	this.SetPan = function( strID, nVol ) {
		if( strID == '' )
			return;

		var objSoundStruct = this.GetSoundStruct( strID );
		if( !objSoundStruct)
			return;

		objSoundStruct.SetPan( nVol );
	}

	this.GetPan = function( strID ) {
		if( strID == '' )
			return 0;

		var objSoundStruct = this.GetSoundStruct( strID );
		if( !objSoundStruct)
			return 0;

		return objSoundStruct.GetPan();
	}

	this.StopAll = function() {
		for( var i=0; i<this.m_SoundAr.length; i++ ) {
			var objSoundStruct = this.m_SoundAr[i];
			objSoundStruct.Stop();
		}
	}
}

Sound = {
	data: [
	//	 ID                File Name                    Type Volume Repeat Offset Length Pitch Detune
		'idSndDummy',     'sound/dummy.wav',			2,   20,    1,     0,     -1,    1,    0,
		'idSndCredit',    'sound/01_credit.mp3',		2,   20,    1,     0,     -1,    1,    0,
		'idSndStart',     'sound/02_start.mp3',			1,   20,    1,     0,     -1,    1,    0,
		'idSndBGM',       'sound/03_bgm.wav',			1,   10,    -1,    0,     -1,    1,    0,
		'idSndExtend',    'sound/04_extend.mp3',		2,   30,    1,     0,     -1,    1,    0,
		'idSndZapper',    'sound/05_zapper.wav',		2,   20,    1,     0,     -1,    1,    0,
		'idSndFExp',      'sound/06_f_explosion.wav',	2,   20,    1,     0,     -1,    1,    0,
		'idSndBacura',    'sound/08_bacura.wav',		2,   20,    1,     0,     -1,    1,    0,
		'idSndBlaster',   'sound/09_blaster.wav',		2,   20,    1,     0,     -1,    1,    0,
		'idSndGExp',      'sound/10_g_explosion.mp3',	2,   20,    1,     0,     -1,    1,    0,
		'idSndSpecial',   'sound/12_special.mp3',		2,   30,    1,     0,     -1,    1,    0,
		'idSndSheonite',  'sound/13_sheonite.wav',		2,   20,    1,     0,     -1,    1,    0,
		'idSndNameEntry1','sound/14_nameentry1.mp3',	2,   20,    -1,    0,     -1,    1,    0,
		'idSndZakato',    'sound/15_zakato.wav',		2,   20,    1,     0,     -1,    1,    0,
		'idSndGZakato',   'sound/16_gzakato.wav',		2,   20,    1,     0,     -1,    1,    0,
		'idSndAndorGen',  'sound/17_andorgen.wav',		2,   20,    -1,    0,     -1,    1,    0,
		'idSndMiss',      'sound/18_miss.wav',			2,   20,    1,     0,     -1,    1,    0,
		'idSndNameEntry2','sound/19_nameentry2.mp3',	2,   20,    -1,    0,     -1,    1,    0,
		null
	]
};
Sound.Load = function() {
	g_objSound = new SoundManager;

	let n = 0;
	while( Sound.data[n] ) {
		g_objSound.LoadSound( Sound.data[n++], Sound.data[n++], Sound.data[n++], Sound.data[n++],
				              Sound.data[n++], Sound.data[n++], Sound.data[n++], Sound.data[n++], Sound.data[n++] );
	}
}
