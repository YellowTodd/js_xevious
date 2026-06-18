"use strict";

window.onerror = function (mes, file, num) {
  alert(["file    : " + file, "line    : " + num, "message : " + mes].join("\n"));
  return true;
};

var COOKIE = 'AJRXV';
var SCREEN_WIDTH = 224;
var SCREEN_HEIGHT = 288;
var COLOR_WHITE = 'rgb(210,210,210)';
var COLOR_ORANGE = 'rgb(255,174,  0)';
var COLOR_RED = 'rgb(255, 20,  0)';
var COLOR_YELLOW = 'rgb(255,255,  0)';

_include('sound');

_include('image');

_include('button');

_include('control');

_include('text');

_include('config');

_include('object');

_include('objectmanager');

_include('flyingobject');

_include('solvalou');

_include('groundobject');

_include('biggroundobject');

_include('domogram');

_include('andorgen');

_include('demo');

_include('score');

_include('remain');

_include('area');

_include('game');

_include('reghighscore');

_include('gamepad');

var DEBUG_LEVEL = 0;
var SOUND_ON = 1;

if (!_isUploaded()) {
  DEBUG_LEVEL = 1;
  SOUND_ON = 0;
}

var strAr = document.location.href.split('?');

for (var i = strAr.length - 1; i >= 0; i--) {
  if (strAr[i] == 'debug') DEBUG_LEVEL = 1;
  if (strAr[i] == 'no_sound') SOUND_ON = 0;
}

var g_App = null;
var g_Debug = null;
var g_bPaused = false;
var g_fScale = 1;
var g_nExtraAreaFlag = 0;
var g_nCurFPS = 60;

function Debug() {
  var m_nodeDebug1 = document.getElementById('idDebug1');
  var m_nodeDebug2 = document.getElementById('idDebug2');
  var m_strDebug = '';
  var m_nAccumulateFps = 0;

  this.PrintInfo = function (prevTime) {
    var elapsed = _getTime() - prevTime;
    var fps = 1000 / elapsed;
    var times = 10;
    m_nAccumulateFps += fps;

    if (g_App.m_nFrameCount % times == 0) {
      g_nCurFPS = Math.round(m_nAccumulateFps / times);
      m_nAccumulateFps = 0;
    }

    var objCurArea = g_App.GetMapObject().GetCurrentArea();
    var nAreaNo = objCurArea.GetAreaNo();
    var nScrollPos = objCurArea.GetScrollPos();
    var curAction = objCurArea.GetCurAction();
    var sCurActionType = ('00' + curAction.type.toString(16)).slice(-2);
    var sCurActionValue = ('000' + curAction.value).slice(-3);
    m_nodeDebug1.innerHTML = 'FPS:' + g_nCurFPS + '<br>Area:' + nAreaNo + '<br>Scroll:' + nScrollPos + '<br>Action:' + sCurActionType + '[' + sCurActionValue + ']' + '<br>Index:' + g_App.GetGameObject().GetFlyingEnemyIndex() + '<br>ExtraAreaFlag:0x' + ('0' + g_nExtraAreaFlag.toString(16)).slice(-2);
  };

  this.Clear = function () {
    m_strDebug = '';
    m_nodeDebug2.innerHTML = '';
  };

  this.Print = function (str) {
    m_strDebug += str + '<br>';
    m_nodeDebug2.innerHTML = m_strDebug;
  };

  this.EraseString = function (str) {
    m_strDebug = m_strDebug.replace(str + '<br>', '');
    m_nodeDebug2.innerHTML = m_strDebug;
  };
}

function App() {
  g_App = this;
  g_Debug = new Debug();
  this.m_nFrameCount = 0;
  var objThis = this;
  var m_nodePaused = document.getElementById('idPaused');
  var m_nodeDebug1 = document.getElementById('idDebug1');
  var m_objText = new Text();

  this.GetTextObject = function () {
    return m_objText;
  };

  var m_objScore = new Score(this);

  this.GetScoreObject = function () {
    return m_objScore;
  };

  var m_objMap = new Map(this);

  this.GetMapObject = function () {
    return m_objMap;
  };

  var m_objObjectManager = new ObjectManager();

  this.GetObjectManager = function () {
    return m_objObjectManager;
  };

  var m_objConfig = new Config(this);

  this.GetConfigObject = function () {
    return m_objConfig;
  };

  var m_objSolvalou = new Solvalou();

  this.GetSolvalouObject = function () {
    return m_objSolvalou;
  };

  var nodeZapperKey = document.getElementById('idZapperKey');
  var nodeBlasterKey = document.getElementById('idBlasterKey');

  if (m_objConfig.GetKeyAsign() == 0) {
    nodeZapperKey.innerHTML = 'X Key';
    nodeBlasterKey.innerHTML = 'Z Key';
  } else {
    nodeZapperKey.innerHTML = 'Z Key';
    nodeBlasterKey.innerHTML = 'X Key';
  }

  var m_objDemo = new Demo(this);
  var m_objRegHighScore = new RegHighScore(this);

  this.GetRegHighScoreObject = function () {
    return m_objRegHighScore;
  };

  var m_objRemain = new Remain();

  this.GetRemainObject = function () {
    return m_objRemain;
  };

  var m_objGame = new Game(this);

  this.GetGameObject = function () {
    return m_objGame;
  };

  var m_objSoundButton = new SEButton(document.getElementById('idSound'));
  var m_cbAction;
  var m_nFrameSwitch = 0;
  var m_bDemoMode = true;
  var m_bConfigMode = false;
  var m_bGameMode = false;
  var m_nStarting = 0;
  m_objSolvalou.Create();

  this.IsDemoMode = function () {
    return m_bDemoMode;
  };

  this.IsConfigMode = function () {
    return m_bConfigMode;
  };

  this.IsGameMode = function () {
    return m_bGameMode;
  };

  this.SetDemoMode = function (bDemo) {
    var nodeFooterM = document.getElementById('idFooterM');
    m_bDemoMode = bDemo;
    m_bConfigMode = false;
    m_bGameMode = false;

    if (bDemo) {
      m_cbAction = m_objDemo.Act;
      m_objDemo.Initialize();
      m_nStarting = 0;
      nodeFooterM.style.visibility = 'visible';
    } else {
      m_bGameMode = true;
      m_objDemo.End();
      m_cbAction = m_objGame.Act;
      m_objGame.Initialize();
      nodeFooterM.style.visibility = 'hidden';
    }
  };

  this.SetDemoMode(true);

  this.Configulation = function () {
    m_bConfigMode = true;
    m_objGame.End();
    m_objDemo.End();
    m_objConfig.Initialize();
    m_cbAction = m_objConfig.Act;
    document.getElementById('idFooterM').style.visibility = 'hidden';
  };

  this.Run = function () {
    g_objSound.Play('idSndDummy'); //何か鳴らしておかないと次の音の最初が再生されない

    m_objSoundButton.Show(true);
    m_objSoundButton.Activate(true);

    var requestAnimationFrame = function () {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
      };
    }();

    var prevTime = _getTime();

    var frameUpdate = function frameUpdate(timestamp) {
      return regeneratorRuntime.async(function frameUpdate$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              g_GamePad.UpdateStatus();
              g_Debug.PrintInfo(prevTime);

              if (!g_bPaused && m_nStarting == 0) {
                m_cbAction(m_nFrameSwitch);
                m_nFrameSwitch = 1 - m_nFrameSwitch;
                prevTime = _getTime(); // 地上キャラがスパリオを撃つタイミングに使用

                objThis.m_nFrameCount++;
                if (objThis.m_nFrameCount > 2147483647) objThis.m_nFrameCount = 0;
              }

              _context.t0 = requestAnimationFrame;
              _context.next = 6;
              return regeneratorRuntime.awrap(frameUpdate);

            case 6:
              _context.t1 = _context.sent;
              (0, _context.t0)(_context.t1);

              if (m_bDemoMode) {
                // スタートキー押下
                if (g_bKeyStart && !g_bPaused) {
                  g_bKeyStart = false;
                  g_objSound.Play('idSndCredit', true); // ロゴの背景を赤に戻しておく

                  document.getElementById('idLogoPalette').style.backgroundColor = '#ff0000'; // ゲーム開始までの待ち時間

                  m_nStarting = 100;
                } // 待ち時間経過したらゲーム開始


                if (m_nStarting > 0) {
                  m_nStarting--;

                  if (m_nStarting == 0) {
                    objThis.SetDemoMode(false);
                  }
                } // コンフィグ開始キー押下


                if (g_bKeyConfig) {
                  g_bKeyConfig = false;

                  if (!g_bPaused && !m_bConfigMode) {
                    m_bConfigMode = true;
                    objThis.Configulation();
                  }
                }
              } // サウンドON/OFF


              if (g_bKeyMute) {
                g_bKeyMute = false;
                m_objSoundButton.ClickByKey();
              } // 一時停止ON/OFF


              if (g_bKeyPause) {
                g_bKeyPause = false;

                if (!m_bConfigMode) {
                  g_bPaused = !g_bPaused;

                  if (!g_bPaused) {
                    if (!g_bMuted) g_objSound.Mute(false);
                    if (DEBUG_LEVEL == 0) m_objText.Clear(m_nodePaused);else g_Debug.EraseString('=PAUSED=');
                  } else {
                    g_objSound.Mute(true); // デバッグ中は'PAUSED'の文字を表示しない
                    // (画面キャプチャできるように)

                    if (DEBUG_LEVEL == 0) m_objText.Print(m_nodePaused, 90, 0, 'PAUSED');else g_Debug.Print('=PAUSED=');
                  }
                }
              }

            case 11:
            case "end":
              return _context.stop();
          }
        }
      });
    };

    frameUpdate(0);
  };

  this.Run();
}

function OnLoad() {
  // FC2のフッターをフッター用テーブルに移動
  var nodeFC2 = document.getElementById('fc2_footer');
  var nodeFC2Placeholder = document.getElementById('idFC2');

  if (nodeFC2) {
    if (nodeFC2Placeholder) nodeFC2Placeholder.appendChild(nodeFC2);
  } // フッターのテキストを日本語に変更


  if (_getLanguage() == 'ja') {
    document.getElementById('idToTop').innerHTML = '冒険者たちへシリーズ一覧';
    document.getElementById('idSpanBBS').innerHTML = 'ご意見、ご感想はこちら。';
  }

  var nodeMain = document.getElementById('idMain');
  var nodeSound = document.getElementById('idSound');
  var nodeFooter = document.getElementById('idFooter');
  var nodeDebug = document.getElementById('idDebug');
  var nodeInstruction = document.getElementById('idInstruction'); //nodeMain.classList.add('crt');
  // 画面サイズに合わせてリサイズ

  var onResize = function onResize(e) {
    var nWinW = document.body.clientWidth;
    var nWinH = document.documentElement.clientHeight - 30;
    var nMainW = nodeMain.offsetWidth;
    var nMainH = nodeMain.offsetHeight + (nodeMain.offsetTop + nodeFooter.offsetHeight);
    var fRatio = nMainW / nMainH;
    var fNewMainW = nMainW;
    var fNewMainH = nMainH;

    if (nWinW > nWinH * fRatio) {
      fNewMainH = nWinH;
      fNewMainW = fNewMainH * fRatio;
    } else {
      fNewMainW = nWinW;
      fNewMainH = fNewMainW / fRatio;
    }

    var fScale = fNewMainW / nMainW;
    nodeMain.style.transform = 'scale(' + fScale + ')'; // ゲーム画面以外のスケールを元に戻す

    nodeFooter.style.transform = 'scale(' + 1 / fScale + ')';
    nodeSound.style.transform = 'scale(' + 1 / fScale + ')';
    nodeDebug.style.transform = 'scale(' + 1 / fScale + ')';
    nodeInstruction.style.transform = 'scale(' + 1 / fScale + ')'; // マウス移動用にスケールを設定

    g_fScale = fScale;
  };

  onResize();
  window.addEventListener("resize", onResize); // デバッグ用出力域表示

  if (DEBUG_LEVEL) nodeDebug.style.display = 'block'; // イメージとサウンドの読み込み完了まで待つ(プログレスバー表示)

  var progress = function progress() {
    var nTotal = g_Image.m_nLoading + g_objSound.NumLoading();
    var nResult = g_Image.m_nLoaded + g_objSound.NumLoaded();
    if (!SOUND_ON) nResult = nTotal;
    var nProgress = nResult / nTotal * 100 | 0;
    document.getElementById('idProgressBar').style.width = nProgress + '%';
    document.getElementById('idProgress').innerHTML = nResult + ' / ' + nTotal;

    if (nResult == nTotal) {
      var cb = function cb() {
        document.getElementById('idLoading').style.display = 'none';
        new App();
      };

      setTimeout(cb, 500);
      return;
    }

    setTimeout(progress, 100);
  }; // サウンド読み込み開始


  Sound.Load();
  setTimeout(progress, 1);
}

window.addEventListener('load', OnLoad);
window.addEventListener('contextmenu', function (e) {
  _stopEvent(e);

  return false;
});
//# sourceMappingURL=xevious.dev.js.map
