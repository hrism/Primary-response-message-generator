import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import stockLogoImage from './images/stock_logo.png'; // 画像のパス


const App = () => {
  // ステート変数の定義
  const [customerName, setCustomerName] = useState('');
  const [customerType, setCustomerType] = useState('new'); // 'new' または 'existing'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [temporaryAssessment, setTemporaryAssessment] = useState('no'); // 'yes' または 'no'
  const [contactMethod, setContactMethod] = useState(''); // 'LINE', 'email', 'phone'
  const [itemCount, setItemCount] = useState('0');
  const [inputSummary, setInputSummary] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState(''); // メールまたは電話の入力用
  const [errorMessage, setErrorMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [customerLink, setCustomerLink] = useState(null);
  const [qrChecked, setQrChecked] = useState(false); // QRコード読み取り確認用
  const [alertVariant, setAlertVariant] = useState('info'); // Alertのクラスを管理するステート

  // 各入力フィールドのエラー状態を判定するための変数
  const hasNameError = errorMessage.includes('顧客名');
  const hasItemCountError = errorMessage.includes('商品点数');
  const hasPhoneNumberError = errorMessage.includes('電話番号');
  const hasEmailError = errorMessage.includes('メールアドレス');
  // const hasItemCountError = errorMessage.includes('商品点数');
  const hasContactMethodError = errorMessage.includes('仮査定の手段を選択してください');

  // ボタンが無効な場合のクリック処理
  const handleButtonClick = (e) => {
    if (temporaryAssessment === 'yes' && contactMethod === 'LINE' && !qrChecked) {
      e.preventDefault();
      window.alert('QRコードを読み取ってチェックマークをつけてください。');
      setAlertVariant('danger'); // 警告をdangerに設定
    } else {
      updateSummary(); // QRコード確認済みなら通常の処理を実行
    }
  };

  // QRコード確認スイッチの変更ハンドラー
  const handleQrCheck = (e) => {
    setQrChecked(e.target.checked);
    setAlertVariant(e.target.checked ? 'success' : 'danger'); // チェックされたらsuccess、外されたらdanger
  };

  const containerStyle = {
    maxWidth: '640px',
  };

  const logoStyle = {
    width: '160px',
  };


  useEffect(() => {
    // 電話番号をハイフンなしの半角に変換
    const cleanedPhoneNumber = phoneNumber
      .replace(/-/g, '') // ハイフンを削除
      .replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)); // 全角を半角に変換
    setPhoneNumber(cleanedPhoneNumber);
  }, [phoneNumber]);

  const updateSummary = () => {
    // 顧客名が空白の場合はエラーを表示
    if (!customerName.trim()) {
      setErrorMessage('「顧客名」を入力してください。');
      return;
    }

    // 商品点数が0の場合はエラーを表示
    if (itemCount === '0') {
      setErrorMessage('持込商品点数を選択してください。');
      return;
    }

    // 既存顧客で電話番号が空白の場合はエラーを表示
    if (customerType === 'existing' && !phoneNumber.trim()) {
      setErrorMessage('「電話番号」を入力してください。');
      return;
    }

    // 仮査定ありで連絡方法がメールで、メールアドレスが空白の場合はエラーを表示
    if (temporaryAssessment === 'yes' && contactMethod === 'email' && !emailOrPhone.trim()) {
      setErrorMessage('「メールアドレス」を入力してください。');
      return;
    }

    // 仮査定ありで連絡方法が選択されていない場合はエラーを表示
    if (temporaryAssessment === 'yes' && !contactMethod) {
      setErrorMessage('仮査定の手段を選択してください。');
      return;
    }

    setErrorMessage('');

    // URLの生成と設定
    if (customerType === 'existing' && phoneNumber.trim()) {
      const url = `https://app.recore-pos.com/member/list/?keyword=${encodeURIComponent(phoneNumber)}`;
      setCustomerLink(<a href={url} target="_blank" rel="noopener noreferrer">顧客候補：{url}</a>);
    } else {
      setCustomerLink(null);
    }

    // 既存の顧客で電話番号が入力されている場合のURL
    const customerCandidateUrl = customerType === 'existing' && phoneNumber.trim()
      ? `顧客候補: https://app.recore-pos.com/member/list/?keyword=${phoneNumber}`
      : '';

    // 入力内容に基づいてTextareaの内容を更新する処理
    const summary = [
      '`[toall]`\nお客様がご来店しました。',
      `顧客名: ${customerName}`,
      `顧客タイプ: ${customerType === 'new' ? '新規顧客' : '既存顧客'}`,
      `電話番号: ${phoneNumber}`,
      customerType === 'existing' ? `会員番号: ${memberNumber}` : '',
      `仮査定: ${temporaryAssessment === 'yes' ? 'あり' : 'なし'}`,
      temporaryAssessment === 'yes' ? `仮査定手段: ${contactMethod}` : '',
      temporaryAssessment === 'yes' && contactMethod === 'email' ? `メールアドレス: ${emailOrPhone}` : '',
      `商品点数: ${itemCount}`,
      customerCandidateUrl, // 顧客候補のURLを追加
      `これより写真をお送ります。査定対応お願いします。`,
    ].filter(Boolean).join('\n');
    setInputSummary(summary);

    // ここでコピー処理を開始する前に、summaryを更新しておく
    if (!errorMessage) {
      navigator.clipboard.writeText(summary)
        .then(() => {
          console.log('コピー成功'); // コピー成功時のログ
          setCopySuccess('コピーしたのでチャットに送信してください！');
          setTimeout(() => setCopySuccess(''), 10000);
        })
        .catch(err => {
          console.error('コピーに失敗しました: ', err);
          setErrorMessage('コピーに失敗しました。');
        });
    }
  };

  const handleReset = () => {
    // ユーザーに確認を求める
    const isConfirmed = window.confirm("すべての入力をリセットしてもよろしいですか？");
    if (isConfirmed) {
      // OKの場合、ページをリロード
      window.location.reload();
    }
  };

  return (
    <Container className="py-5 container-sm container" style={containerStyle}>
      <div className="text-center">
        <img src={stockLogoImage} alt="株式会社ストックラボのロゴ" style={logoStyle} />;
      </div>
      <h1 className="text-center py-4">一次請けメッセージつくる君</h1>

      {/* 顧客名の入力 */}
      <Row className='mb-4'>
        <Form.Group className="mb-2">
          <Form.Label className="fw-bold">◆顧客名（必須）</Form.Label>
          <Form.Control
            type="text"
            placeholder="顧客名"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            isInvalid={hasNameError} // エラー状態の適用
          />
          <Form.Text className="text-muted">
            漢字がわからない場合はカタカナでも可
          </Form.Text>
          {hasNameError && <Form.Control.Feedback type="invalid">顧客名を入力してください。</Form.Control.Feedback>}
        </Form.Group>
      </Row>


      {/* 顧客タイプの選択 */}
      <Row className='mb-4'>
        <p className='mb-2'>◆顧客区分</p>
        <ToggleButtonGroup type="radio" name="customerType" value={customerType} onChange={val => setCustomerType(val)}>
          <ToggleButton id="tbg-ct-1" value={'new'} variant="outline-primary">
            新規顧客
          </ToggleButton>
          <ToggleButton id="tbg-ct-2" value={'existing'} variant="outline-primary">
            既存顧客
          </ToggleButton>
        </ToggleButtonGroup>
      </Row>

      {/* ◆持込商品点数（必須） */}
      <Row className='mb-4'>
        <Form.Label className="fw-bold">◆持込商品点数（必須）</Form.Label>
        <div className='ps-3'>
          <Form.Select
            value={itemCount}
            onChange={(e) => setItemCount(e.target.value)}
            isInvalid={hasItemCountError} // エラー状態の適用
          >
            <option value="0">0</option> {/* 0の選択肢を追加 */}
            {[...Array(29).keys()].map(n => (
              <option key={n} value={n + 1}>{n + 1}</option>
            ))}
            <option value="30+">30以上</option>
          </Form.Select>
          {hasItemCountError && <Form.Control.Feedback type="invalid">商品点数を選択してください。</Form.Control.Feedback>}
        </div>
      </Row>

      {/* 電話番号の入力フィールド */}
      <Row className='mb-4'>
        <Form.Group className="mb-2">
          <Form.Label className="fw-bold">◆電話番号（ハイフン不要、電話査定の場合必須）</Form.Label>
          <Form.Control
            type="tel"
            placeholder="090XXXXXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            isInvalid={hasPhoneNumberError} // エラー状態の適用
          />
          {hasPhoneNumberError && <Form.Control.Feedback type="invalid">電話番号を入力してください。</Form.Control.Feedback>}
        </Form.Group>
      </Row>

      {/* 既存顧客の場合の追加入力フィールド（会員番号）
      {customerType === 'existing' && (
        <input
          type="text"
          placeholder="会員番号（任意）MBXXXXXXX"
          value={memberNumber}
          onChange={(e) => setMemberNumber(e.target.value)}
        />
      )} */}

      {/* 仮査定の選択 */}
      <Row className='mb-4'>
        <p className='mb-2'>◆仮査定</p>
        <ToggleButtonGroup type="radio" name="temporaryAssessment" value={temporaryAssessment} onChange={val => setTemporaryAssessment(val)}>
          <ToggleButton id="tbg-ta-1" value={'no'} variant="outline-primary">
            なし
          </ToggleButton>
          <ToggleButton id="tbg-ta-2" value={'yes'} variant="outline-primary">
            あり
          </ToggleButton>
        </ToggleButtonGroup>
      </Row>

      {/* 仮査定ありの場合の連絡方法の選択 */}
      {temporaryAssessment === 'yes' && (
        <>
          {/* 仮査定手段の選択 */}
          <Row className='mb-4'>
            <Form.Label className="fw-bold">◆仮査定手段を選択（必須）</Form.Label>
            <div className='ps-3'>
              <Form.Select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                isInvalid={hasContactMethodError}
              >
                <option value="">仮査定手段を選択</option>
                <option value="LINE">LINE</option>
                <option value="email">メール</option>
                <option value="phone">電話</option>
              </Form.Select>
              {hasContactMethodError && <Form.Control.Feedback type="invalid">仮査定の手段を選択してください。</Form.Control.Feedback>}
            </div>
          </Row>

          {contactMethod === 'LINE' && (
            <>
              {/* AlertのvariantをqrCheckedの状態に基づいて動的に変更 */}
              <Alert variant={qrChecked ? "success" : "danger"} className="mt-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckQR"
                    checked={qrChecked}
                    onChange={(e) => setQrChecked(e.target.checked)} // スイッチの状態を管理
                  />
                  <label className="form-check-label" htmlFor="flexSwitchCheckQR">
                    来店QRコードを読み取りました。
                  </label>
                </div>
              </Alert>
            </>
          )}



          {/* メールアドレス入力フィールド（メールを選択した場合に表示） */}
          {contactMethod === 'email' && (
            <Row className='mb-4'>
              <Form.Group className="mb-2">
                <Form.Label className="fw-bold">◆メールアドレス（必須）</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="abc@stocklab.co.jp"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  isInvalid={hasEmailError}
                />
                {hasEmailError && <Form.Control.Feedback type="invalid">メールアドレスを入力してください。</Form.Control.Feedback>}
              </Form.Group>
            </Row>
          )}
        </>
      )}

      {/* 入力内容を更新するボタン */}
      <div class="d-block text-center pt-4">
        <div
          className="d-inline-block"  // Bootstrapのクラスでinline-blockを適用
          onClick={(e) => {
            if (temporaryAssessment === 'yes' && contactMethod === 'LINE' && !qrChecked) {
              e.preventDefault(); // ボタンのクリックイベントを防止
              window.alert('QRコードを読み取ったことを確認してください。');
            } else {
              updateSummary(); // QRコード確認済みなら通常の処理を実行
            }
          }}
        >
          <Button
            variant="primary"
            size="lg"
            type="submit"
            onClick={updateSummary}
            disabled={temporaryAssessment === 'yes' && contactMethod === 'LINE' && !qrChecked} // LINEでチェックボックスがオンになるまで無効
          >
            一次請けメッセージを作ってコピーする
          </Button>
        </div>
      </div>

      {/* 入力内容をリセットするボタン */}
      <div class="d-block text-center pt-4">
        <Button variant="secondary" type="submit" onClick={handleReset}>入力内容をリセットする</Button>
      </div>

      {/* コピー成功メッセージ */}
      {copySuccess &&
        <Alert variant="primary mt-3">
          {copySuccess}
        </Alert>
      }

      {/* エラーメッセージ */}
      {errorMessage &&
        <Alert variant="danger mt-3">
          {errorMessage}
        </Alert>
      }

      {/* 入力内容の自動出力 */}
      {/* <p style={{ whiteSpace: 'pre-wrap' }}>{inputSummary}</p> */}

      <Row className='mb-4'>
        <div>{customerLink}</div>
      </Row>

    </Container>
  );

};

export default App;
