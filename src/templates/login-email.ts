interface LoginEmailProps {
  code: string;
  loginUrl: string;
  validMinutes: number;
}

export function generateLoginEmailHtml({ code, loginUrl, validMinutes }: LoginEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Acesso - Goldtype</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #FFD700;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 14px;
        }
        .code-section {
            background-color: #f8f9fa;
            border: 2px dashed #FFD700;
            border-radius: 8px;
            padding: 25px;
            text-align: center;
            margin: 25px 0;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #333;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
        }
        .button {
            background-color: #FFD700;
            color: #333;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏆 Goldtype</div>
            <div class="subtitle">Vila Real, Portugal</div>
        </div>
        
        <h2>Olá! 👋</h2>
        
        <p>Recebeste este email porque solicitaste acesso à tua conta Goldtype.</p>
        
        <div class="code-section">
            <p><strong>O teu código de acesso é:</strong></p>
            <div class="code">${code}</div>
            <p style="margin: 10px 0; color: #666;">Válido por ${validMinutes} minutos</p>
        </div>
        
        <p style="text-align: center;">
            <strong>Ou clica no botão abaixo para acesso directo:</strong><br>
            <a href="${loginUrl}" class="button">🚀 Entrar na Goldtype</a>
        </p>
        
        <div class="warning">
            <strong>⚠️ Importante:</strong> Este código é para uso único e expira em ${validMinutes} minutos. 
            Se não solicitaste este acesso, podes ignorar este email.
        </div>
        
        <p>Se tiveres alguma dúvida, não hesites em contactar-nos.</p>
        
        <div class="footer">
            <p>
                <strong>Goldtype</strong><br>
                Vila Real, Portugal<br>
                Este é um email automático, por favor não respondas.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

export function generateLoginEmailSubject(): string {
  return "🔑 O teu código de acesso à Goldtype";
}
