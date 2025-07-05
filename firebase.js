// firebase.js

// Firebase プロジェクトの設定 (Firebase コンソールから取得したものを貼り付け)
// 注意: この情報は公開されるため、機密情報を含めないでください。
// GitHub Pages でホストする場合、この方法は一般的ですが、
// APIキーなどが悪用されるリスクはゼロではありません。
// より安全な方法としては、サーバーレス関数を介してFirebaseのサービスアカウントキーを扱う方法がありますが、
// 今回の要件ではクライアントサイドで直接利用します。
const firebaseConfig = {
    apiKey: "AIzaSyDfjDeUsCn0qVSoFEy4eozmmm_z6H6G40k",
    authDomain: "gradient-descent-playground.firebaseapp.com",
    projectId: "gradient-descent-playground",
    storageBucket: "gradient-descent-playground.firebasestorage.app",
    messagingSenderId: "294792269757",
    appId: "1:294792269757:web:ab7bd9a038a0be02044cd4",
    measurementId: "G-7FFS0M2QZV"
};

// Firebase の初期化
firebase.initializeApp(firebaseConfig);
// 認証サービスと Firestore データベースへの参照を取得
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// UI要素の取得
const signInGoogleButton = document.getElementById('signInGoogleButton');
const signOutButton = document.getElementById('signOutButton');
const userStatusSpan = document.getElementById('userStatus');
const saveResultButton = document.getElementById('saveResultButton');
const loadResultsButton = document.getElementById('loadResultsButton');
const savedResultsDiv = document.getElementById('savedResults');

// 認証状態の変化を監視
auth.onAuthStateChanged(user => {
    if (user) {
        userStatusSpan.textContent = `サインイン済み: ${user.displayName || user.email}`;
        if (signInGoogleButton) signInGoogleButton.style.display = 'none';
        if (signOutButton) signOutButton.style.display = 'inline-block';
        if (saveResultButton) saveResultButton.style.display = 'inline-block';
        if (loadResultsButton) loadResultsButton.style.display = 'inline-block';
    } else {
        userStatusSpan.textContent = '未サインイン';
        if (signInGoogleButton) signInGoogleButton.style.display = 'inline-block';
        if (signOutButton) signOutButton.style.display = 'none';
        if (saveResultButton) saveResultButton.style.display = 'none';
        if (loadResultsButton) loadResultsButton.style.display = 'none';
        if (savedResultsDiv) savedResultsDiv.innerHTML = ''; // サインアウト時に結果をクリア
    }

    // ギャラリーページにいる場合にのみ結果を自動ロード
    // window.location.pathname が '/gallery.html' または '/your-repo-name/gallery.html' のように終わるかチェック
    if (window.location.pathname.endsWith('/gallery.html') || window.location.pathname.endsWith('/gallery.html/')) {
        // displaySavedResultsForGallery 関数が定義されていることを確認してから呼び出す
        if (window.displaySavedResultsForGallery) {
            window.displaySavedResultsForGallery('gallery');
        }
    }
});

// Google サインイン
if (signInGoogleButton) {
    signInGoogleButton.addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await auth.signInWithPopup(provider);
            alert('Google サインイン成功！');
        } catch (error) {
            console.error('Google サインインエラー:', error);
            alert('Google サインインに失敗しました。');
        }
    });
}


// サインアウト
if (signOutButton) {
    signOutButton.addEventListener('click', async () => {
        try {
            await auth.signOut();
            alert('サインアウトしました。');
        } catch (error) {
            console.error('サインアウトエラー:', error);
            alert('サインアウトに失敗しました。');
        }
    });
}

// 結果を保存
if (saveResultButton) {
    saveResultButton.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) {
            alert('結果を保存するにはサインインしてください。');
            return;
        }

        // gd.js から最新のステップ数、x, y を取得
        // これらのDOM要素が存在することを前提としています。
        const step = document.getElementById('stepCount').textContent;
        const currentX = document.getElementById('x').textContent;
        const currentY = document.getElementById('y').textContent;

        const functionType = document.getElementById('functionType').value; // 選択された関数タイプ
        const optimizerType = document.getElementById('optimizer').value; // 選択されたオプティマイザタイプ

        // 画像
        const imageDataUrl = getCanvasImage();

        // データURLをBlobに変換（StorageへのアップロードにはBlobが便利）
        const response = await fetch(imageDataUrl);
        const blob = await response.blob();

        // 2. Cloud Storage に画像をアップロード
        const storageRef = storage.ref();
        const imageFileName = `heatmaps/${user.uid}/${Date.now()}.png`; // 例: heatmaps/ユーザーID/タイムスタンプ.png
        const imageRef = storageRef.child(imageFileName);

        let imageUrl = '';
        try {
            const snapshot = await imageRef.put(blob); // Blobをアップロード
            imageUrl = await snapshot.ref.getDownloadURL(); // アップロードされた画像のURLを取得
            console.log('Image uploaded successfully! URL:', imageUrl);
        } catch (error) {
            console.error('画像のアップロードエラー:', error);
            alert('画像の保存に失敗しました。');
            return; // 画像アップロード失敗時は処理を中断
        }


        const resultData = {
            userId: user.uid,
            url: generateURL(),
            imageUrl: imageUrl,
            functionType: functionType,
            optimizerType: optimizerType,
            finalStep: step,
            finalX: currentX,
            finalY: currentY,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // サーバーのタイムスタンプ
        };

        try {
            await db.collection('optimizationResults').add(resultData);
            alert('結果を保存しました！');
        } catch (error) {
            console.error('結果の保存エラー:', error);
            alert('結果の保存に失敗しました。');
        }
    });
}


// ギャラリーページに保存された結果を表示する関数
async function displaySavedResultsForGallery(displayElementId) {
    const user = auth.currentUser;
    const displayElement = document.getElementById(displayElementId);

    if (!displayElement) {
        console.error(`Display element with ID "${displayElementId}" not found.`);
        return;
    }

    // displayElement.innerHTML = '<h3>あなたの保存された結果:</h3>';

    if (!user) {
        displayElement.innerHTML += '<p>結果を表示するにはサインインしてください。</p>';
        return;
    }

    try {
        const snapshot = await db.collection('optimizationResults').where('userId', '==', user.uid).orderBy('timestamp', 'desc').get();

        if (snapshot.empty) {
            displayElement.innerHTML += '<p>保存された結果はありません。</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.style.listStyle = 'none'; // リストのスタイルを調整
        ul.style.padding = '0';

        snapshot.forEach(doc => {
            const data = doc.data();
            const li = document.createElement('li');
            li.style.border = '1px solid #ccc';
            li.style.borderRadius = '8px';
            li.style.padding = '15px';
            li.style.marginBottom = '10px';
            li.style.backgroundColor = '#f9f9f9';
            li.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';


            const imgTag = data.imageUrl ? `<a href="${data.url}"><img src="${data.imageUrl}" alt="結果画像" style="max-width: 100%; height: auto; margin-top: 10px; margin-bottom: 5px; border-radius: 4px;"></a>` : '';

            li.innerHTML = `
                <h4>関数: ${data.functionType} / オプティマイザ: ${data.optimizerType}</h4>
                <p><strong>最終位置:</strong> (${data.finalX}, ${data.finalY}) / <strong>ステップ数:</strong> ${data.finalStep}</p>
                ${imgTag}<br>
                <small>保存日時: ${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : '不明'}</small>
            `;
            ul.appendChild(li);
        });
        displayElement.appendChild(ul);

    } catch (error) {
        console.error('ギャラリーの結果取得エラー:', error);
        displayElement.innerHTML = `<p>結果の取得に失敗しました。 ${user.uid} </p>`;
    }
}

// ギャラリーページからこの関数を呼び出せるようにグローバルに公開
window.displaySavedResultsForGallery = displaySavedResultsForGallery;