# 【Monaca × ニフティクラウド mobile backend】<br>簡単IoT！歩数計アプリを作ろう

![歩数計アプリイメージ](/readme-img/歩数計アプリイメージ.png)

## はじめに
### 概要
Monacaとニフティクラウド mobile backendを使うことで、クラウドにデータを保存し、そのデータをユーザーごとに管理できる機能を備えた「歩数計」アプリが簡単に作成できます。ここではその手順を解説します。

### Monacaって何？
* __もなか 【[Monaca](https://ja.monaca.io/)】__ HTML5/JavaScript/CSS3でスマホアプリが開発できる開発環境。開発スタイル／コーディング環境は選択可能。

![Monacaとは？](/readme-img/Monacaとは.png)

### ニフティクラウド mobile backend って何？
* __にふてぃくらうど-もばいる-ばっくえんど 【[ニフティクラウド mobile backend](http://mb.cloud.nifty.com/about.htm)】__ スマートフォンアプリに必要なバックエンド機能が開発不要で利用できるクラウドサービス。 クラウド上に用意された機能をAPIで呼び出すだけで利用できます。また、APIを簡単に使うためのSDKを用意しています（ iOS / Android / Monaca / Unity ）。mobile Backend as a Service の頭文字を取って、通称 mBaaS 呼ばれます。

![mBaaSとは？](/readme-img/mBaaSとは.png)

### Monaca と mBaaS でサーバー連携アプリは簡単に実現可能に
この２つを組み合わせると、高度なアプリも簡単スピーディーに開発できます
![Monaca×mBaaS](/readme-img/Monaca×mBaaS.png)

#### アプリ側は Monaca を使用すると…
* iOS / Android のアプリが同時に開発可能！
* プラグインを入れるだけで、簡単に加速度センサーにアクセス可能！
* いつでもどこでも、ブラウザで開発OK！

#### サーバー側に mBaaS を使用すると…
* SDKで簡単にデータの保存/取得を実装可能！
* SDKで簡単に会員管理機能を実装可能！
* コントロールパネルからクラウドの状況をパッと確認できる！

## 準備
### 事前準備
下記登録を完了し、アカウントを作成しておいてください。
* [Monaca](https://ja.monaca.io/register/start.html)利用登録（無料）
* [ニフティクラウド mobile backend](http://mb.cloud.nifty.com/signup.htm)利用登録（無料）

### 動作環境準備
* PC
 * Chrome 最新版
* 端末 ( iPhone / Android )
 * Monacaデバッガー 最新版

### Monaca準備
* Monacaにログインをします

![Monaca準備1](/readme-img/Monaca準備1.png)
https://ja.monaca.io/

* プロジェクトをインポートします
 * 今回は「アプリとサーバーの連携以外の処理」に関しては実装したプロジェクトを用意しました。アプリとサーバー間の連携部分のコーディングを体験していただけます。
* 「Import Project」をクリックすると、「プロジェクトのインポート」画面が表示されます
* 「プロジェクト名」を入力します　例）__歩数計アプリ__
* 「インポート方法」では、「URLを指定してインポート」を選択し、次のURLを入力します
 * `https://github.com/natsumo/MonacaPedometerApp/archive/master.zip`

![Monaca準備2](/readme-img/Monaca準備2.png)

* プロジェクトが作成さてたら、「開く」をクリックします
* プロジェクトが開かれます

![Monaca準備3](/readme-img/Monaca準備3.png)

これでMonaca（アプリ側）の準備は完了です◎

#### プロジェクトに実装済みの内容紹介
* mBaaS SDK の導入
 * 詳しくは[こちら](http://mb.cloud.nifty.com/doc/current/introduction/quickstart_monaca.html#SDKのインストールと読み込み)をご参照ください
* 端末の加速度センサーにアクセスし、値を取得する処理
 * 後ほど解説します

### mBaaS準備
* mBaaS にログインします

![mBaaS準備1](/readme-img/mBaaS準備1.png)
http://mb.cloud.nifty.com/

* 新しいアプリを作成します
 * アプリ名は「`pedometer`」と入力してください
 * mBaaSを既に使用したことがある場合は、画面上方のメニューバーにある「+新しいアプリ」をクリックすると同じ画面が表示されます

 ![mBaaS準備2-2](/readme-img/mBaaS準備2-2.png)

![mBaaS準備2-1](/readme-img/mBaaS準備2-1.png)

* アプリが作成されるとAPIキー（２種類）が発行されます
 * APIキーは後で使用します。
* ここでは使用しないので、「OK」で閉じます

![mBaaS準備3](/readme-img/mBaaS準備3.png)

* ダッシュボードが表示されます

![mBaaS準備4](/readme-img/mBaaS準備4.png)

これでmBaaS（サーバー側）の準備も完了◎
コーディングと動作確認をしていきましょう。

## コーディング手順と解説・動作確認の手順
Monaca（アプリ側）とmBaaS（サーバー側）の連携部分をコーディングしていきます。
* `www/js/app.js`を開きます
* (1)～(7)のコーディングを終えるとアプリが完成する仕組みです

![手順1](/readme-img/手順1.png)

* 編集したら保存を忘れずに！！
 * メニューバーの「保存」をクリックするか、Windowsの場合「Ctrl + S」、Macの場合「Command + S」で保存できます。

### 目次
* (1) SDKの初期化
* (2) 会員の新規登録の処理
* (3) 会員のログインの処理
* (4) ログアウトの処理
* ★動作確認①
* (5) クラウド上で歩数を管理する「Steps」クラスを定義する
* (6) 歩数データをクラウドと同期させる処理
* (7) ログイン完了時の処理
* ＜おまけ＞加速度センサーから値を取得する処理[実装済み]
* ★動作確認②

### (1) SDKの初期化
SDKの初期化は、mBaaSを使用する場合に必ず行う作業です。これによって、アプリがサーバーを認識し、連携されます。

```js
// (1) SDKの初期化
var ncmb = new NCMB('YOUR_APPLICATION_KEY',
                    'YOUR_CLIENT_KEY');
```
* mBaaS のダッシュボードから、APIキー（アプリケーションキーとクライアントキー）をコピーして、それぞれ`YOUR_APPLICATION_KEY`と`YOUR_CLIENT_KEY`に貼り付けます

![SDKの初期化](/readme-img/SDKの初期化.png)

* このとき、シングルクォーテーション「`'`」は消さないように注意しましょう


### (2) 会員の新規登録の処理
ここからは、
```js
/* ここに記入 */
```
の部分を、各処理コードに書き換えることでアプリが完成するようになっています。

* 会員管理機能を実装していきます
* まずは新規で会員を登録する処理です

```js
// (2) 会員の新規登録の処理
var signUp = function(email, password){
  // Userのインスタンスを生成
  var user = new ncmb.User();
  // 値を設定
  user.set('userName', email)
      .set('password', password)
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
```
* インスタンスを生成して、`.set('キー', バリュー)`メソッドで値を設定します
 * ここでは「ユーザー名とパスワード」で認証する形式を利用し、ユーザー名としてメールアドレスを使っています。
 * 「メールアドレスとパスワード」での認証も実装可能です。詳しくは[ドキュメントページ](http://mb.cloud.nifty.com/doc/current/user/authorize_email_monaca.html)をご覧ください。
* `.signUpByAccount()`メソッドで登録を実行します
* この後も出てきますが、登録や保存の処理に成功したの場合の処理を、`.then`、処理失敗の場合の処理を、`.catch`で行います。
* 会員登録処理に成功した場合は、`.login(ユーザー名, パスワード)`としてユーザー名とパスワードを設定することでログインできます。

### (3) 会員のログインの処理
会員登録をしたら、次はログインの処理を実装します
* (2)と同様に実装できます

```js
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
```

### (4) ログアウトの処理
* `.logout()`メソッドでログアウトできます

```js
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
```
これでログイン周りの機能実装が完了しました◎

### ★動作確認①
* プレビュー画面をつかって、会員機能（会員登録、ログイン、ログアウト）の動作確認をしてみましょう
 * ここでは簡単のため、Monacaデバッガーは使用せず動作確認を行います。

![Monaca準備3](/readme-img/Monaca準備3.png)


#### 会員登録
* 「IDをお持ちでない方」タップし、メールアドレスとパスワードを入力します
 * メールアドレスは適当ものでOKです。
 * パスワードは6桁以上入力する必要があります。
* 入力後、「新規登録」をタップすると登録完了し、ログインします

![動作確認①新規登録](/readme-img/動作確認①新規登録.png)

__ダッシュボードで登録されたことを確認__

* mBaaSのダッシュボード（クラウド）を見てみましょう
* 「会員管理」をクリックすると先ほど端末から登録したアカウントを確認できます

![動作確認①ダッシュボード](/readme-img/動作確認①ダッシュボード.png)

#### ログアウト

* ログインの確認をする前に、一度ログアウトしておきましょう
* 画面左上のアイコンをタップすると、ログアウトできます

![動作確認①ログアウト](/readme-img/動作確認①ログアウト.png)

#### ログイン

* 会員登録と同様に、アドレスとパスワードを入力し、「ログイン」ボタンをタップします

![動作確認①ログイン](/readme-img/動作確認①ログイン.png)

### (5) クラウド上で歩数を管理する「Steps」クラスを定義する
次は歩数計で測定した「歩数」の記録を、アプリとクラウド間で保存・更新･取得をしていきます。

* 記録格納用クラスを作成します

```js
// (5) クラウド上で歩数を管理する「Steps」クラスを定義する
var Steps = ncmb.DataStore('Steps');
```

* 「`Steps`」の部分を変更すれば、作成するクラス名を自由に設定することができます。

### (6) アプリ内に保持しいている未同期の歩数データをクラウドと同期させる処理
このアプリでは、「スタート」ボタンをタップして、「ストップ」ボタンをタップするまでの間、歩数をカウントします。「ストップ」ボタンをタップしたときに、歩数と日付のデータをサーバーに格納するように作られています。

![動作確認②デバッガー1](/readme-img/動作確認②デバッガー1.png)

* mBaaSにデータを保存（あるいは更新）する処理を実装します

```js
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
```

* 保存するデータには参照権限（ACL）を設定することが可能です
 * ここでは、会員管理ユーザーと紐付けて、データの持ち主本人（currentUser）のみがデータの読み書き可という設定にしています。
* 読み込み権限：`.setUserReadAccess（ユーザー, 真偽値）`、書き込み権限：`.setUserWriteAccess（ユーザー, 真偽値）`出設定できます
* 保存も更新も、同様に`.set('キー', バリュー)`メソッドで値を設定します
* その後、保存の場合は`save()`メソッド、`update()`メソッドを実行して処理を行います
 * ここでは三項演算子を用いて、保存の場合と更新の場合をまとめて表記しています

### (7) ログイン完了時の処理
ログイン完了時、サーバーをにその日の歩数データがあれがば画面に表示します。

* mBaaSからデータを取得する処理を実装します

```js
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
```

* データの取得のため、検索を行います
* `.equalTo('キー', バリュー)`メソッドで「キー」の値が、「バリュー」と一致するデータを指定し、`.fetchAll()`メソッドで全件検索を行います
* 取得した値から各キーの値を取り出すには、`.get('キー')`メソッドを使用します

### ＜おまけ＞加速度センサーから値を取得する処理[実装済み]
端末に備わっている「加速度センサー」の値取得し、歩数を計測しています。Monacaでは簡単に加速度センサーから値を取得することが可能です。使い方に関しては、後ほど触れますが、実装済みの内容をここで示しておきます。

* Cordvaプラグイン
 * Device Motion を有効にします

![Device_Motion](/readme-img/Device_Motion.png)

* 加速度センサーから値を取得

```js
var watchId = navigator.accelerometer.watchAcceleration(onAcceSuccess, onAcceError, accelerometerOptions);
```
* `onAcceSuccess`：加速度センサー取得成功時のコールバック
* `onAcceError`：加速度センサー取得失敗時のコールバック
* `accelerometerOptions`：加速度センサー取得時の設定

### ★動作確認②
Monacaデバッガー動作確認をしてみましょう
* Monacaデバッガーアプリを起動し、ログインしてください
* 作成した歩数計アプリを起動します

![動作確認②デバッガー0](/readme-img/動作確認②デバッガー0.png)

* 起動したらアプリにログインをしてください
 * 動作確認①で作成したアカウントを使います

![動作確認①ログイン](/readme-img/動作確認①ログイン.png)

* 実際に歩数計を使ってみましょう
* 「スタート」ボタンをタップして、測定を開始
 * 歩けない場合は、振っても動作確認が可能です◎
* 「ストップ」ボタンをタップして測定を終えます
 * このときデータがmBaaSに保存されます！

![動作確認②デバッガー1](/readme-img/動作確認②デバッガー1.png)

__ダッシュボードで登録されたことを確認__

* mBaaSのダッシュボード（クラウド）を見てみましょう
* 「データストア」をクリックすると、コードで作成した保存先クラス「Steps」が確認できます
* 「Steps」をクリックするとデータを確認できます

![動作確認②ダッシュボード1](/readme-img/動作確認②ダッシュボード1.png)

* 「acl」の「パーミッション編集」をクリックすると、会員（自分）のobjectIdが確認できます
 * この場合は、会員自身のみがデータにアクセスすることができます。

__一度ログアウトしたあと、もう一度アプリを使ってみよう！__

* データを検索して、ログイン後すぐに歩数（今日の分）を表示してくれます！

__カウントを「0」に戻すには？？__

* 画面右上の「ゴミ箱」アイコンをタップすると歩数計のカウントを0に戻すことができます
 * 「ゴミ箱」ボタンは歩数計作動中にも使用することができます。
 * ただし、「ゴミ箱」ボタンをタップして、画面のカウントを「0」にリセットしても、再び歩数計をスタートさせ、「ストップ」ボタンをタップしない限り、mBaaS（クラウド）にはデータは反映されません。
* mBaaS（クラウド）上に正しく反映されるか、確認してみましょう

## まとめ
* Monacaで簡単に加速度センサーにアクセスできることがわかった
* mBaaSとの連携で簡単にサーバー連携したアプリが作成できることがわかった
 * mBaaSで簡単に会員管理機能を実装できた
 * mBaaSで簡単にデータをクラウドへ保存・更新・取得がでることがわかった
* サーバーと連携すれば、アプリはもっといろんなことができることがわかった！！

## 参考
### 5分で体験会バージョン
「(1)SDKの初期化」以外の実装を完成させた、『5分で体験会バージョン』をご用意しています。以下の２点を実施するだけで直ぐに動作確認いただけます。

* `www/index.html`ファイルの14行目と16行目のコメントアウトを下図のように入れ替えてください。
* `www/js/app.completed.js`の「(1)SDKの初期化」にmBaaSのダッシュボードからコピーしたAPIキーを貼り付けてください。

![参考1](/readme-img/参考1.png)
