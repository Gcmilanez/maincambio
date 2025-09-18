<?php
// require_once garante que o arquivo seja incluído apenas uma vez.
require_once 'config.php';

// Verifica se o formulário foi enviado usando o método POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // --- COLETA E LIMPEZA DOS DADOS ---
    $nome = filter_var(trim($_POST["name"]), FILTER_SANITIZE_STRING);
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $telefone = filter_var(trim($_POST["phone"]), FILTER_SANITIZE_STRING);
    $mensagem = filter_var(trim($_POST["message"]), FILTER_SANITIZE_STRING);

    // --- VALIDAÇÃO BÁSICA ---
    if (empty($nome) || empty($email) || empty($mensagem)) {
        http_response_code(400); // Bad Request
        echo "Por favor, preencha todos os campos obrigatórios.";
        exit;
    }

    // --- CONFIGURAÇÃO DO E-MAIL ---
    $destinatario = EMAIL_DESTINATARIO;
    $assunto = "Nova mensagem do site MainCâmbio de: $nome";

    // Corpo do e-mail
    $corpo_email = "Você recebeu uma nova mensagem do formulário de contato do site.\n\n";
    $corpo_email .= "Nome: " . $nome . "\n";
    $corpo_email .= "Email: " . $email . "\n";
    $corpo_email .= "Telefone: " . $telefone . "\n\n";
    $corpo_email .= "Mensagem:\n" . $mensagem . "\n";

    // Cabeçalhos do e-mail
    $headers = "From: " . EMAIL_REMETENTE . "\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // --- ENVIO DO E-MAIL ---
    if (mail($destinatario, $assunto, $corpo_email, $headers)) {
        http_response_code(200);
        echo "Mensagem enviada com sucesso! Agradecemos o seu contato.";
    } else {
        http_response_code(500);
        echo "Ocorreu um erro no servidor ao tentar enviar a mensagem. Tente novamente mais tarde.";
    }

} else {
    http_response_code(403);
    echo "Acesso proibido.";
}
?>