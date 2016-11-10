// (1) SDKの初期化
var ncmb = new NCMB('YOUR_APPLICATION_KEY',
                    'YOUR_CLIENT_KEY');

// (2) 会員の新規登録の処理
var signUp = function(email, password){
  // Userのインスタンスを生成
  var user = new ncmb.User();
  // 値を設定
  user.set('userName', email)
      .set('password', password);
  // 新規登録
  user.signUpByAccount()
      .then(function(user){
          /* 新規登録成功時の処理 */
          // ログイン処理
          return ncmb.User.login(user);
      })
      .then(function(user){
          /* ログイン成功時の処理 */
          $('body').trigger('loginComplete');
      })
      .catch(function(err){
          /* 失敗時の処理 */
          $('body').trigger('ncmbError', [err, 'signup']);
      });
};

// (3) 会員のログインの処理
var login = function(email, password){
  // ログイン
  ncmb.User.login(email, password)
           .then(function(user){
             /* ログイン成功時の処理 */
             $('body').trigger('loginComplete');
           })
           .catch(function(err){
             /* ログイン失敗時の処理 */
             $('body').trigger('ncmbError', [err, 'login']);
           });
};

// (4) ログアウトの処理
var logout = function(){
  // ログアウト
  ncmb.User.logout()
           .then(function(){
             /* ログアウト成功時の処理 */
             $('body').trigger('logoutComplete');
           })
           .catch(function(err){
             /* ログアウト失敗時の処理 */
             $('body').trigger('ncmbError', [err, 'logout']);
           });
};

// (5) クラウド上で歩数を管理する「Steps」クラスを定義する
var Steps = ncmb.DataStore('Steps');

// (6) アプリ内に保持しいている未同期の歩数データをクラウドと同期させる処理
var syncCloud = function(data, waitingList){
  // 現在ログイン中のユーザー(自分自身)を取得
  var currentUser = ncmb.User.getCurrentUser();
  // ACL(アクセス権限)
  var acl = new ncmb.Acl();
  // 権限を設定(自分だけに読み書き権限を付与)
  acl.setUserReadAccess(currentUser, true)
     .setUserWriteAccess(currentUser, true);

  // Stepsクラスのインスタンスを生成
  var steps = new Steps();
  // 値を設定
  steps.set('objectId', data.objectId)
       .set('date', data.date)
       .set('count', data.count)
       .set('acl', acl);

  // save/updateメソッドでクラウド上へ保存/更新する
  (!steps.objectId ? steps.save() : steps.update()) // 三項演算子 (条件 ? 真:偽)
    .then(function(obj){
      /* 保存または更新成功時の処理 */
      Pedometer.steps[data.date].objectId = obj.objectId;
      $('body').trigger('syncNext', [waitingList]);
    })
    .catch(function(err){
      /* 保存または更新失敗時の処理 */
      Pedometer.steps[data.date].synced = false;
      $('body').trigger('ncmbError', [err, 'syncCloud']);
      $('body').trigger('syncNext', [waitingList]);
    });
};

// (7) ログイン完了時の処理
var loginComplete = function(today){
  // 今日の歩数をクラウドから取得してPedometerに設定
  Steps.equalTo('date', today)
       .fetchAll()
       .then(function(objects){
         /* 検索成功時の処理 */
         if (objects.length > 0) {
           var currentSteps = {
             count: objects[0].get('count'),
             objectId: objects[0].get('objectId'),
             date: objects[0].get('date')
           };
           // 歩数計に値を設定
           Pedometer.setSteps(currentSteps);
         }
         // 歩数計更新
         Pedometer.refresh();
       })
       .catch(function(err){
         /* 検索失敗時の処理 */
         $('body').trigger('ncmbError', [err, 'loginComplete']);
       });
};

// ==================================
var Pedometer = {
  // Accelerometer
  threshold: {
    upper: 14,
    lower: 11
  },
  watchId: null,
  syncId: null,
  stepFlag: false,
  steps: {},
  enable: false,
  // 加速度センサーの動作オプション
  accelerometerOptions: {
    frequency: 40
  },
  // クラウド同期の動作オプション
  syncCloudOptions: {
    frequency: 1000
  },
  //
  syncFlag: false,
  syncCloudEventHandler: function(event, dataList){
    if (dataList.length > 0) {
      syncCloud(dataList.shift(), dataList);
    } else {
      Pedometer.syncFlag = false;
    }
  },
  // 歩数計スタート
  start: function(){
    this.enable = true;
    // 加速度センサの監視の定期実行
    if (this.watchId === null) {
      this.watchId = navigator.accelerometer.watchAcceleration(this.onAcceSuccess, this.onAcceError, this.accelerometerOptions);
    }
    // 同期処理の定期実行
    if (this.syncId === null) {
      this.syncId  = window.setInterval(function(){
        if (Pedometer.syncFlag === false) {
          Pedometer.syncFlag = true;
          var dataList = [];
          for (var key in Pedometer.steps) {
            if (Pedometer.steps[key].synced === false) {
              dataList.push(
                {
                  objectId: Pedometer.steps[key].objectId,
                  date: key,
                  count: Pedometer.steps[key].count,
                }
              );
              Pedometer.steps[key].synced = true;
            }
          }
          $('body').trigger('syncNext', [dataList]);
        }
      }, this.syncCloudOptions.frequency);
    }
  },
  // 歩数計ストップ
  stop: function(){
    this.enable = false;
    if (this.watchId !== null) {
      navigator.accelerometer.clearWatch(this.watchID);
    }
    if (this.syncId !== null) {
      window.clearInterval(this.syncId);
    }
    this.watchId = null;
    this.syncId  = null;
  },
  // 歩数計リセット
  reset: function(){
    var today = this.getToday();
    var todaySteps = today in this.steps ? this.steps[today] : {count: 0, date:today, synced: false};
    todaySteps.count = 0;
    this.setSteps(todaySteps);
  },
  // 歩数のインクリメント
  incrementSteps: function(){
    var today = this.getToday();
    if (!(today in this.steps)) {
      this.steps[today] = {count: 0, synced: false};
    }
    this.steps[today].count++;
    this.steps[today].synced = false;
    this.refresh();
  },
  // 歩数の手動設定
  setSteps: function(steps) {
    steps.synced = false;
    this.steps[this.getToday()] = steps;
    this.refresh();
  },
  // 歩数の取得
  getSteps: function() {
    var today = this.getToday();
    return today in this.steps ? this.steps[today].count : 0;
  },
  // 歩数計の表示更新
  refresh: function(){
    $('#steps').text(this.getSteps());
  },
  // 今日の日付をYYYYMMDD形式の文字列として返却
  getToday: function(){
    var now = new Date();
    var today = '';
    today += now.getFullYear();
    today += ((now.getMonth() + 1) < 10 ? '0' : '') + (now.getMonth() + 1);
    today += (now.getDate() < 10 ? '0' : '') + now.getDate();
    return today;
  },
  // 加速度センサーの値取得成功時のコールバック
  onAcceSuccess: function(acceleration){
    var compositeAcceleration = Math.sqrt(Math.pow(acceleration.x, 2) + Math.pow(acceleration.y, 2) + Math.pow(acceleration.z, 2));

    if (Pedometer.enable === true) {
      if (Pedometer.stepFlag === true) {
        if (compositeAcceleration < Pedometer.threshold.lower) {
          Pedometer.stepFlag = false;
          Pedometer.incrementSteps();
        }
      } else {
        if (compositeAcceleration > Pedometer.threshold.upper) {
          Pedometer.stepFlag = true;
        }
      }
    }
  },
  // 加速度センサーの値取得失敗時のコールバック
  onAcceError: function(){
    $('body').trigger('ncmbError', ['Accelerometer error.', 'acceleration']);
  }
};

// ==================================
// Onsen UI
ons.bootstrap();
ons.ready(function(){
  // 過去のログイン情報が存在している場合に自動ログインを試みる
  var currentUser = ncmb.User.getCurrentUser();
  if (currentUser !== null) {
    currentUser.login()
               .then(function(user){
                  $('body').trigger('loginComplete');
                })
                .catch(function(err){
                  $('body').trigger('ncmbError', [err, 'autoLogin']);
                });
  }

  // - 画面遷移が完了した場合のイベント処理
  mainNavigator.on('postpush', function(event){
    if (event.enterPage.name === 'pedometer.html') {
      var today = Pedometer.getToday();
      $('#dateLabel').text('' + today.substring(0, 4) + '年' + today.substring(4, 6) + '月' + today.substring(6, 8) + '日');
      loginComplete(today);
    }
  });
});

// ==================================
// Device ready
document.addEventListener('deviceready', function(){
  navigator.splashscreen.hide(); // スプラッシュ画面を消す
}, false);

// ==================================
// Event handling & View controll
$(document).ready(function(){
  // 共通処理
  // - 認証用フォームの値を取り出す関数
  var getAuthFormValue = function(option){
    var authForm = $(option).closest('.authForm');
    var emailForm = authForm.children('[type=email]');
    var passwordForm = authForm.children('[type=password]');

    return {authForm: authForm, email: emailForm.val(), password: passwordForm.val()};
  };

  // - 認証用フォームの内容を検査し、ボタンの有効／無効を切り替える関数
  var validationAuthForm = function(option){
    var target = (this instanceof HTMLInputElement ? this : option);
    var currentAuthForm = getAuthFormValue(target);
    var reEmail = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$");
    var rePassword = new RegExp("^.{6,}$");
    if (currentAuthForm.email.match(reEmail) && currentAuthForm.password.match(rePassword)) {
      currentAuthForm.authForm.children('[modifier=large]').removeAttr('disabled')
    } else {
      currentAuthForm.authForm.children('[modifier=large]').attr('disabled', 'disabled');
    }
  };

  // 画面遷移系
  // - ログイン画面から新規登録画面への遷移
  $('body').on('click', '#gotoSignup', function(){
    var currentAuthForm = getAuthFormValue(this);
    mainNavigator.replacePage('signup.html',{animation: 'none', onTransitionEnd: function(){
      $('#signupEmail').val(currentAuthForm.email);
      $('#signupPassword').val(currentAuthForm.password);
      validationAuthForm(document.getElementById('signupEmail'));
    }});
  });

  // - 新規登録画面からログイン画面への遷移
  $('body').on('click', '#gotoLogin', function(){
    var currentAuthForm = getAuthFormValue(this);
    mainNavigator.replacePage('login.html',{animation: 'none', onTransitionEnd: function(){
      $('#loginEmail').val(currentAuthForm.email);
      $('#loginPassword').val(currentAuthForm.password);
      validationAuthForm(document.getElementById('loginEmail'));
    }});
  });

  // - ログイン処理（新規登録含む）が完了した場合の遷移
  $('body').on('loginComplete', function(){
    mainNavigator.pushPage('pedometer.html', {animation: 'fade'});
  });

  // - ログアウト処理が完了した場合の遷移
  $('body').on('logoutComplete', function(){
    Pedometer.steps = {};
    mainNavigator.resetToPage('login.html', {animation: 'fade'});
  });


  // ユーザー操作系
  // - 登録画面のフォーム入力イベント発生時のバリデーション
  $('body').on('input', '#signupEmail', validationAuthForm);
  $('body').on('input', '#signupPassword', validationAuthForm);

  // - ログイン画面のフォーム入力イベント発生時のバリデーション
  $('body').on('input', '#loginEmail', validationAuthForm);
  $('body').on('input', '#loginPassword', validationAuthForm);

  // - 新規登録ボタンをタップした時の処理
  $('body').on('click', '#signupButton', function(){
    var currentAuthForm = getAuthFormValue(this);
    signUp(currentAuthForm.email, currentAuthForm.password);
  });

  // - ログインボタンをタップした時の処理
  $('body').on('click', '#loginButton', function(){
    var currentAuthForm = getAuthFormValue(this);
    login(currentAuthForm.email, currentAuthForm.password);
  });

  // - ログアウトボタンをタップした時の処理
  $('body').on('click', '#logoutButton', function(){
    Pedometer.stop();
    logout();
  });

  // - スタートボタンをタップした時の処理
  $('body').on('click', '#startButton', function(){
    $('#startButton').hide();
    $('#stopButton').show();
    Pedometer.start();
  });

  // - ストップボタンをタップした時の処理
  $('body').on('click', '#stopButton', function(){
    $('#stopButton').hide();
    $('#startButton').show();
    Pedometer.stop();
  });

  // - リセットボタンをタップした時の処理
  $('body').on('click', '#resetButton', function(){
    Pedometer.reset();
  });

  // その他イベントハンドリング
  // - NCMB関連でエラーが発生した場合のイベント処理
  $('body').on('ncmbError', function(event, err, methodName){
    console.error('[ERROR:' + methodName + ']' + err);
    if (err.status === 401) {
      ons.notification.alert({
        message: '再度ログインしてください',
        title: '認証エラー',
        buttonLabel: 'OK',
        animation: 'default'
      });
      localStorage.clear();
      $('body').trigger('logoutComplete');
    }
  });

  // - 同期完了のイベント処理
  $('body').on('syncNext', Pedometer.syncCloudEventHandler);

  // 歩数計画面の初期状態としてストップボタンを隠す
  $('#stopButton').hide();
});
