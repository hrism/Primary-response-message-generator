import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import stockLogoImage from './images/stock_logo.png'; // 画像のパス

const App = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerType, setCustomerType] = useState(''); // 顧客区分
  const [phoneNumber, setPhoneNumber] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [temporaryAssessment, setTemporaryAssessment] = useState(''); // 仮査定有無
  const [contactMethod, setContactMethod] = useState(''); // 'LINE', 'email', 'phone'
  const [itemCount, setItemCount] = useState('0');
  const [inputSummary, setInputSummary] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState(''); // メールまたは電話の入力用
  const [copySuccess, setCopySuccess] = useState('');
  const [customerLink, setCustomerLink] = useState(null);
  const [qrChecked, setQrChecked] = useState(false); // QRコード確認用
  const [alertVariant, setAlertVariant] = useState('info'); // Alertのクラスを管理するステート
  const [phoneNumberError, setPhoneNumberError] = useState(''); // 電話番号のエラーステート
  const [emailError, setEmailError] = useState(''); // メールアドレスのエラーステート
  const [contactMethodError, setContactMethodError] = useState(''); // 仮査定手段のエラーステート

  // エラーメッセージの管理
  const [customerNameError, setCustomerNameError] = useState(''); // 顧客名のエラー
  const [customerTypeError, setCustomerTypeError] = useState(''); // 顧客区分のエラー
  const [temporaryAssessmentError, setTemporaryAssessmentError] = useState(''); // 仮査定有無のエラー
  const [itemCountError, setItemCountError] = useState(''); // 商品点数エラー

  const containerStyle = {
    maxWidth: '640px',
  };

  const logoStyle = {
    width: '160px',
  };

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

  useEffect(() => {
    // 電話番号をハイフンなしの半角に変換
    const cleanedPhoneNumber = phoneNumber
      .replace(/-/g, '') // ハイフンを削除
      .replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)); // 全角を半角に変換
    setPhoneNumber(cleanedPhoneNumber);
  }, [phoneNumber]);

  const updateSummary = () => {
    let hasError = false;

    // 仮査定手段が未選択の場合はエラーを表示
    if (temporaryAssessment === 'yes' && !contactMethod) {
      setContactMethodError('仮査定の手段を選択してください。');
      hasError = true;
    } else {
      setContactMethodError(''); // エラーなし
    }

    // 仮査定手段がメールで、メールアドレスが空白の場合はエラーを表示
    if (temporaryAssessment === 'yes' && contactMethod === 'email' && !emailOrPhone.trim()) {
      setEmailError('仮査定手段がメールの場合、メールアドレスを入力してください。');
      hasError = true;
    } else {
      setEmailError(''); // エラーなし
    }

    // 既存顧客で電話番号が空白の場合はエラーを表示
    if (customerType === 'existing' && !phoneNumber.trim()) {
      setPhoneNumberError('「電話番号」を入力してください。');
      hasError = true;
    }
    // 仮査定手段が電話で、電話番号が空白の場合はエラーを表示
    else if (temporaryAssessment === 'yes' && contactMethod === 'phone' && !phoneNumber.trim()) {
      setPhoneNumberError('仮査定手段が電話の場合、電話番号を入力してください。');
      hasError = true;
    } else {
      setPhoneNumberError(''); // エラーなし
    }

    // 顧客名が空白の場合はエラーを表示
    if (!customerName.trim()) {
      setCustomerNameError('「顧客名」を入力してください。');
      hasError = true;
    } else {
      setCustomerNameError(''); // エラーなし
    }

    // 顧客区分が未選択の場合はエラーを表示
    if (customerType === '') {
      setCustomerTypeError('「顧客区分」を選択してください。');
      hasError = true;
    } else {
      setCustomerTypeError('');
    }

    // 仮査定有無が未選択の場合はエラーを表示
    if (temporaryAssessment === '') {
      setTemporaryAssessmentError('「仮査定有無」を選択してください。');
      hasError = true;
    } else {
      setTemporaryAssessmentError('');
    }

    // 商品点数が0の場合はエラーを表示
    if (itemCount === '0') {
      setItemCountError('持込商品点数を選択してください。');
      hasError = true;
    } else {
      setItemCountError(''); // エラーなし
    }

    // エラーがある場合は処理を中断
    if (hasError) return;

    // URLの生成と設定
    if (customerType === 'existing' && phoneNumber.trim()) {
      const url = `https://app.recore-pos.com/member/list/?keyword=${encodeURIComponent(phoneNumber)}`;
      setCustomerLink(<a href={url} target="_blank" rel="noopener noreferrer">顧客候補：{url}</a>);
    } else {
      setCustomerLink(null);
    }

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
      `これより写真をお送ります。査定対応お願いします。`,
    ].filter(Boolean).join('\n');
    setInputSummary(summary);

    // コピー処理
    navigator.clipboard.writeText(summary)
      .then(() => {
        console.log('コピー成功'); // コピー成功時のログ
        setCopySuccess('コピーしたのでチャットに送信してください！');
        setTimeout(() => setCopySuccess(''), 10000);
      })
      .catch(err => {
        console.error('コピーに失敗しました: ', err);
        setItemCountError('コピーに失敗しました。');
      });
  };

  return (
    <Container className="py-5 container-sm container" style={containerStyle}>
      <div className="text-center">
        <img src={stockLogoImage} alt="株式会社ストックラボのロゴ" style={logoStyle} />
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
            isInvalid={!!customerNameError} // エラー状態の適用
          />
          <Form.Text className="text-muted">
            漢字がわからない場合はカタカナでも可
          </Form.Text>
          {customerNameError && <Form.Control.Feedback type="invalid">{customerNameError}</Form.Control.Feedback>}
        </Form.Group>
      </Row>

      {/* 顧客区分の選択 */}
      <Row className='mb-4'>
        <Form.Label className="fw-bold">◆顧客区分（必須）</Form.Label>
        <div className='ps-3'>
          <Form.Select
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value)}
            isInvalid={!!customerTypeError}
          >
            <option value="">選択してください</option>
            <option value="new">新規顧客</option>
            <option value="existing">既存顧客</option>
          </Form.Select>
          {customerTypeError && <Form.Control.Feedback type="invalid">{customerTypeError}</Form.Control.Feedback>}
        </div>
      </Row>

      {/* 電話番号の入力フィールド */}
      <Row className='mb-4'>
        <Form.Group className="mb-2">
          <Form.Label className="fw-bold">◆電話番号（ハイフン不要、既存顧客or新規で電話査定ありの場合必須）</Form.Label>
          <Form.Control
            type="tel"
            placeholder="090XXXXXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            isInvalid={!!phoneNumberError} // エラーがあれば表示
          />
          {phoneNumberError && <Form.Control.Feedback type="invalid">{phoneNumberError}</Form.Control.Feedback>}
        </Form.Group>
      </Row>


      {/* 持込商品点数（必須） */}
      <Row className='mb-4'>
        <Form.Label className="fw-bold">◆持込商品点数（必須）</Form.Label>
        <div className='ps-3'>
          <Form.Select
            value={itemCount}
            onChange={(e) => setItemCount(e.target.value)}
            isInvalid={!!itemCountError}
          >
            <option value="0">0</option>
            {[...Array(29).keys()].map(n => (
              <option key={n} value={n + 1}>{n + 1}</option>
            ))}
            <option value="30+">30以上</option>
          </Form.Select>
          {itemCountError && <Form.Control.Feedback type="invalid">{itemCountError}</Form.Control.Feedback>}
        </div>
      </Row>

      {/* 仮査定有無の選択 */}
      <Row className='mb-4'>
        <Form.Label className="fw-bold">◆仮査定有無（必須）</Form.Label>
        <div className='ps-3'>
          <Form.Select
            value={temporaryAssessment}
            onChange={(e) => setTemporaryAssessment(e.target.value)}
            isInvalid={!!temporaryAssessmentError}
          >
            <option value="">選択してください</option>
            <option value="yes">あり</option>
            <option value="no">なし</option>
          </Form.Select>
          {temporaryAssessmentError && <Form.Control.Feedback type="invalid">{temporaryAssessmentError}</Form.Control.Feedback>}
        </div>
      </Row>


      {/* 仮査定手段の選択 */}
      {temporaryAssessment === 'yes' && (
        <>
          <Row className='mb-4'>
            <Form.Label className="fw-bold">◆仮査定手段を選択（必須）</Form.Label>
            <div className='ps-3'>
              <Form.Select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                isInvalid={!!contactMethodError} // contactMethodが未選択の場合にエラーを表示
              >
                <option value="">仮査定手段を選択</option>
                <option value="LINE">LINE</option>
                <option value="email">メール</option>
                <option value="phone">電話</option>
              </Form.Select>
              {contactMethodError && <Form.Control.Feedback type="invalid">{contactMethodError}</Form.Control.Feedback>}
            </div>
          </Row>

          {contactMethod === 'LINE' && (
            <>
              <Alert variant={qrChecked ? "success" : "danger"} className="mt-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckQR"
                    checked={qrChecked}
                    onChange={handleQrCheck}
                  />
                  <label className="form-check-label" htmlFor="flexSwitchCheckQR">
                    来店QRコードを読み取りました。
                  </label>
                </div>
              </Alert>
            </>
          )}

          {contactMethod === 'email' && (
            <Row className='mb-4'>
              <Form.Group className="mb-2">
                <Form.Label className="fw-bold">◆メールアドレス（必須）</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="abc@stocklab.co.jp"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  isInvalid={!!emailError} // エラーがあれば表示
                />
                {emailError && <Form.Control.Feedback type="invalid">{emailError}</Form.Control.Feedback>}
              </Form.Group>
            </Row>
          )}
        </>
      )}

      {/* 入力内容を更新するボタン */}
      <div className="d-block text-center pt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleButtonClick}
          disabled={temporaryAssessment === 'yes' && contactMethod === 'LINE' && !qrChecked}
        >
          一次請けメッセージを作ってコピーする
        </Button>
      </div>

      {/* コピー成功メッセージ */}
      {copySuccess &&
        <Alert variant="primary mt-3">
          {copySuccess}
        </Alert>
      }

      {/* <Row className='mb-4'>
        <div>{customerLink}</div>
      </Row> */}
    </Container>
  );
};

export default App;
