<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode OTP BaktiNusantara</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 24px;
            color: #1e293b;
        }
        .container {
            max-width: 520px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        .header {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            padding: 28px 24px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .content {
            padding: 32px 28px;
            text-align: center;
        }
        .title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #0f172a;
        }
        .text {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 24px;
        }
        .otp-box {
            display: inline-block;
            background: #f1f5f9;
            border: 2px dashed #3b82f6;
            border-radius: 8px;
            padding: 14px 28px;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #1e3a8a;
            margin-bottom: 24px;
        }
        .warning {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 16px;
            line-height: 1.5;
        }
        .footer {
            background: #f8fafc;
            padding: 16px 24px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🇮🇩 BaktiNusantara</h1>
        </div>
        <div class="content">
            <div class="title">
                @if($purpose === 'forgot_password')
                    Permintaan Reset Kata Sandi
                @elseif($purpose === 'forgot_email')
                    Informasi Akun Anda
                @else
                    Verifikasi Akun Baru
                @endif
            </div>
            <p class="text">
                Gunakan kode OTP (One-Time Password) di bawah ini untuk melanjutkan proses Anda. Kode ini berlaku selama <strong>{{ $expiresInMinutes }} menit</strong>.
            </p>
            <div class="otp-box">
                {{ $otp }}
            </div>
            <p class="warning">
                ⚠️ <strong>JANGAN PERNAH</strong> membagikan kode OTP ini kepada siapapun, termasuk pihak yang mengaku sebagai admin BaktiNusantara.
            </p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} BaktiNusantara Platform KKN Terpadu Indonesia.
        </div>
    </div>
</body>
</html>
