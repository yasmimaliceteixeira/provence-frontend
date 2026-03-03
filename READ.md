# Provence - Sistema de Agendamento de Consultas

## Visão Geral

Provence é uma plataforma de agendamento de consultas voltada para pacientes e psicólogos. Permite que pacientes encontrem profissionais, agendem consultas, realizem pagamentos, e acompanhem suas sessões online. Os profissionais definem seus horários, atendem os pacientes e recebem pelos atendimentos confirmados.

## Tecnologias Utilizadas

* PHP (com PDO para conexão ao MySQL)
* MySQL (charset utf8mb4)
* API Mercado Pago (simulação via QR Code)

---

## Tipos de Usuário

O sistema possui três tipos distintos de usuários:

* **Paciente**: pode agendar consultas e acessar links de sessões.
* **Profissional (Psicólogo)**: define horários, atende pacientes e recebe pagamentos.
* **Administrador (Admin)**: gerencia aprovação de profissionais e acessa recursos restritos.

A tabela `usuarios` possui um campo `tipo` com os valores: `paciente`, `profissional`, `admin`.

### Controle de Acesso Seguro

#### Login

* A API de login retorna o tipo de usuário após autenticação.
* O front-end redireciona para o dashboard correspondente:

  * Paciente: `/paciente/dashboard`
  * Profissional: `/profissional/dashboard`
  * Admin: `/admin/dashboard`

#### Proteção de Rotas (Front-End)

* Cada rota verifica o tipo de usuário para permitir o acesso.
* Exemplo (React/Next.js):

```ts
if (usuario.tipo !== 'admin') {
  router.push('/login');
}
```

#### Proteção no Back-End

* Todas as APIs restritas (ex: `aprovar_profissional.php`) verificam se `$_SESSION['tipo'] === 'admin'`.

```php
session_start();
if ($_SESSION['tipo'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['erro' => 'Acesso negado']);
    exit;
}
```

#### Segurança Adicional

* Criar conta admin manualmente via banco de dados.
* Opcional: autenticação com dois fatores (2FA) e IPs restritos.

---

## Fluxo do Usuário

### Cadastro

* O usuário escolhe entre **Paciente** ou **Profissional (Psicólogo)**
* Preenche os campos obrigatórios
* Confirma os Termos de Uso
* Psicólogos aguardam aprovação do admin para acessar

### Login

* O sistema identifica o tipo de conta e redireciona para o dashboard correto

### Aprovação de Profissionais

* Admin acessa a lista de cadastros pendentes
* Pode **aprovar** ou **recusar**

---

## Funcionalidades

### Paciente

* Visualiza profissionais
* Agenda consulta (escolhe profissional, data/hora)
* Realiza pagamento via QR Code (Mercado Pago)
* Recebe link da sessão e insere código de confirmação

### Profissional

* Define horários de atendimento
* Bloqueia datas
* Recebe agendamentos
* Anexa link de sessão
* Gera código de confirmação da sessão
* Libera recebimento após confirmação

---

## Estrutura do Banco de Dados

**Banco:** `Provence`

**Tabelas:**

* `usuarios`
* `profissionais`
* `pacientes`
* `consultas`
* `horarios_trabalho`
* `dias_bloqueados`

---

## APIs PHP

### Autenticação

* `login_usuario.php`
* `cadastrar_usuario.php`
* `redefinir_senha.php`

### Perfil

* `get_perfil.php`
* `atualizar_perfil.php`

### Admin

* `listar_profissionais_pendentes.php`
* `aprovar_profissional.php`
* `recusar_profissional.php`

### Consultas

* `listar_consultas_paciente.php`
* `listar_consultas_profissional.php`
* `disponibilidade_profissional.php`
* `agendar_consulta.php`
* `anexar_link_sessao.php`
* `confirmar_sessao_realizada.php`
* `validar_codigo_confirmacao.php`
* `solicitar_reembolso.php`

### Profissionais

* `definir_horarios.php`
* `listar_horarios.php`
* `bloquear_data.php`
* `listar_dias_bloqueados.php`

### Pagamentos

* `gerar_qrcode.php`
* `webhook_pagamento.php`
* `liberar_pagamento_profissional.php`

---

## Observações

* Apenas consultas confirmadas liberam pagamento
* Reembolsos são ativados após o vencimento do prazo sem confirmação
* 20% do valor das consultas é retido pela plataforma

---

## Configuração

* `config/db.php` deve conter a conexão PDO com o banco `Provence`

```php
<?php
$pdo = new PDO("mysql:host=localhost;dbname=Provence;charset=utf8mb4", "usuario", "senha");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
?>
```

---

## Requisitos

* PHP 7.4 ou superior
* MySQL 5.7 ou superior
* Servidor com suporte a requisições HTTP e JSON

---

## Licença

Este projeto é de uso restrito da equipe Provence para fins educacionais ou institucionais.
