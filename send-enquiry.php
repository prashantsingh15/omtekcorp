<?php
// ==============================================================================
// OMTECH CORPORATION - OFFICIAL ENQUIRY INTAKE & DISPATCH HANDLER
// Connects to Hostinger MySQL Database & dispatches proposals to corporate emails
// ==============================================================================

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ------------------------------------------------------------------------------
// DATABASE CONFIGURATION (Hostinger MySQL)
// ------------------------------------------------------------------------------
define('DB_HOST', 'localhost');
define('DB_NAME', 'u970180780_y2jyP');
define('DB_USER', 'u970180780_FXigP');
define('DB_PASS', ''); // Enter your Hostinger MySQL password here if created

function get_db_connection() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_SILENT,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT            => 2,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);

        // Auto-create enquiries table if not exists
        $create_sql = "CREATE TABLE IF NOT EXISTS enquiries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reference_id VARCHAR(50) DEFAULT NULL,
            date VARCHAR(50) DEFAULT NULL,
            name VARCHAR(150) NOT NULL,
            company VARCHAR(150) DEFAULT NULL,
            contact VARCHAR(200) DEFAULT NULL,
            phone VARCHAR(50) DEFAULT NULL,
            email VARCHAR(150) DEFAULT NULL,
            service VARCHAR(150) DEFAULT NULL,
            participant_level VARCHAR(100) DEFAULT NULL,
            batch_size VARCHAR(100) DEFAULT NULL,
            message TEXT DEFAULT NULL,
            notes TEXT DEFAULT NULL,
            status VARCHAR(50) DEFAULT 'New',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $pdo->exec($create_sql);
        return $pdo;
    } catch (Exception $e) {
        return null;
    }
}

// Ensure backup data directory exists
$log_dir = __DIR__ . "/assets/data";
if (!is_dir($log_dir)) {
    @mkdir($log_dir, 0755, true);
}
$log_file = $log_dir . "/leads_backup.json";

// ------------------------------------------------------------------------------
// 1. GET REQUESTS: Fetch Leads for admin.html Dashboard
// ------------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    if ($action === 'get_leads' || $action === 'leads' || $action === '') {
        $pdo = get_db_connection();
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM enquiries ORDER BY id DESC");
                $db_leads = $stmt->fetchAll();
                if ($db_leads && is_array($db_leads) && count($db_leads) > 0) {
                    echo json_encode($db_leads);
                    exit();
                }
            } catch (Exception $e) {
                // Fall back to server JSON log
            }
        }

        if (file_exists($log_file)) {
            echo file_get_contents($log_file);
        } else {
            echo json_encode([]);
        }
        exit();
    }
}

// ------------------------------------------------------------------------------
// 2. POST REQUESTS: Lead Updates & Deletions or New Submissions
// ------------------------------------------------------------------------------
$raw_input = file_get_contents("php://input");
$input = json_decode($raw_input, true);
if (!$input) {
    $input = $_POST;
}

$action = isset($input['action']) ? $input['action'] : (isset($_GET['action']) ? $_GET['action'] : '');

// Handle status updates from Admin Dashboard
if ($action === 'update_status') {
    $lead_id = isset($input['id']) ? $input['id'] : '';
    $new_status = isset($input['status']) ? trim($input['status']) : 'New';

    if ($lead_id) {
        $pdo = get_db_connection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("UPDATE enquiries SET status = ? WHERE id = ? OR reference_id = ?");
                $stmt->execute([$new_status, $lead_id, $lead_id]);
            } catch (Exception $e) {}
        }

        if (file_exists($log_file)) {
            $leads = json_decode(file_get_contents($log_file), true);
            if (is_array($leads)) {
                foreach ($leads as &$l) {
                    if (strval($l['id']) === strval($lead_id) || (isset($l['reference_id']) && $l['reference_id'] === $lead_id)) {
                        $l['status'] = $new_status;
                    }
                }
                @file_put_contents($log_file, json_encode($leads, JSON_PRETTY_PRINT));
            }
        }
        echo json_encode(["status" => "success", "message" => "Lead status updated"]);
        exit();
    }
}

// Handle lead deletion from Admin Dashboard
if ($action === 'delete_lead') {
    $lead_id = isset($input['id']) ? $input['id'] : '';
    if ($lead_id) {
        $pdo = get_db_connection();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("DELETE FROM enquiries WHERE id = ? OR reference_id = ?");
                $stmt->execute([$lead_id, $lead_id]);
            } catch (Exception $e) {}
        }

        if (file_exists($log_file)) {
            $leads = json_decode(file_get_contents($log_file), true);
            if (is_array($leads)) {
                $leads = array_filter($leads, function($l) use ($lead_id) {
                    return strval($l['id']) !== strval($lead_id) && (!isset($l['reference_id']) || $l['reference_id'] !== $lead_id);
                });
                @file_put_contents($log_file, json_encode(array_values($leads), JSON_PRETTY_PRINT));
            }
        }
        echo json_encode(["status" => "success", "message" => "Lead deleted"]);
        exit();
    }
}

// Handle New Proposal Enquiry Submission
$name      = isset($input['name']) && trim($input['name']) !== '' ? trim(strip_tags($input['name'])) : 'Client';
$email     = isset($input['email']) ? trim(filter_var($input['email'], FILTER_SANITIZE_EMAIL)) : '';
$phone     = isset($input['phone']) ? trim(strip_tags($input['phone'])) : '';
$company   = isset($input['company']) && trim($input['company']) !== '' && trim($input['company']) !== 'Not Specified' && trim($input['company']) !== 'Modal Lead' ? trim(strip_tags($input['company'])) : 'Direct Engagement';
$service   = isset($input['service']) && trim($input['service']) !== '' ? trim(strip_tags($input['service'])) : 'Technical & HSE Advisory';
$p_level   = isset($input['participantLevel']) ? trim(strip_tags($input['participantLevel'])) : '';
$b_size    = isset($input['batchSize']) ? trim(strip_tags($input['batchSize'])) : '';
$message   = isset($input['message']) ? trim(strip_tags($input['message'])) : '';
$ref_id    = isset($input['referenceId']) ? trim(strip_tags($input['referenceId'])) : ('OTC-' . date('Ym') . '-' . rand(1000, 9999));

// Prevent duplicate submissions with identical reference ID
$pdo = get_db_connection();
if ($pdo && !empty($ref_id)) {
    try {
        $dup_stmt = $pdo->prepare("SELECT id FROM enquiries WHERE reference_id = ? LIMIT 1");
        $dup_stmt->execute([$ref_id]);
        if ($dup_stmt->fetch()) {
            echo json_encode([
                "status" => "success",
                "reference_id" => $ref_id,
                "message" => "Enquiry already registered; duplicate ignored."
            ]);
            exit();
        }
    } catch (Exception $e) {}
}

if (file_exists($log_file) && !empty($ref_id)) {
    $existing_leads = json_decode(@file_get_contents($log_file), true);
    if (is_array($existing_leads)) {
        foreach ($existing_leads as $el) {
            if (isset($el['reference_id']) && $el['reference_id'] === $ref_id) {
                echo json_encode([
                    "status" => "success",
                    "reference_id" => $ref_id,
                    "message" => "Enquiry already registered; duplicate ignored."
                ]);
                exit();
            }
        }
    }
}

if (empty($name) || (empty($email) && empty($phone))) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Name and at least one contact method (email or phone) are required."]);
    exit();
}

// Routing inboxes
$primary_to = "omtechcorp2402@gmail.com";
$corp_to    = "safehands@omtechcorporation.com";
$cc         = "kkamleshmishra2@gmail.com";
$subject    = ($company !== 'Direct Engagement')
    ? "⚡ [Omtech Proposal #{$ref_id}] {$service} — {$company}"
    : "⚡ [Omtech Proposal #{$ref_id}] {$service} — {$name}";

// Professional HTML Email Template
$safe_name    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safe_company = htmlspecialchars($company, ENT_QUOTES, 'UTF-8');
$safe_email   = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safe_phone   = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$safe_service = htmlspecialchars($service, ENT_QUOTES, 'UTF-8');
$safe_ref     = htmlspecialchars($ref_id, ENT_QUOTES, 'UTF-8');
$safe_level   = htmlspecialchars($p_level ? $p_level : 'Not Specified', ENT_QUOTES, 'UTF-8');
$safe_batch   = htmlspecialchars($b_size ? $b_size : 'Not Specified', ENT_QUOTES, 'UTF-8');
$safe_message = nl2br(htmlspecialchars($message ? $message : "No specific notes provided.", ENT_QUOTES, 'UTF-8'));
$current_time = date("d M Y, h:i A T");

$email_body = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Proposal Request #{$safe_ref}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #001a38 0%, #002d62 100%); padding: 28px 32px; text-align: left; border-bottom: 4px solid #ea580c;">
              <table width="100%">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #ea580c; display: block; margin-bottom: 4px;">OFFICIAL INQUIRY INTAKE</span>
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">OMTECH CORPORATION</h1>
                    <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">Industrial Consulting | Corporate Training | Leadership Development | Safety &amp; Reliability</p>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background: rgba(234, 88, 12, 0.15); border: 1px solid #ea580c; color: #fed7aa; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Ref: {$safe_ref}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px 16px;">
              <div style="background-color: #f8fafc; border-left: 4px solid #ea580c; border-radius: 6px; padding: 14px 18px;">
                <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Requested Service / Pathway</p>
                <p style="margin: 4px 0 0; font-size: 17px; color: #002d62; font-weight: 700;">{$safe_service}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 32px 20px;">
              <h3 style="margin: 0 0 14px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #002d62; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Client Information</h3>
              <table width="100%" cellspacing="0" cellpadding="8" style="font-size: 14px; border-collapse: collapse;">
                <tr><td width="35%" style="color: #64748b; font-weight: 600;">Client Name:</td><td style="color: #0f172a; font-weight: 700;">{$safe_name}</td></tr>
                <tr><td style="color: #64748b; font-weight: 600;">Company / Plant:</td><td style="color: #0f172a;">{$safe_company}</td></tr>
                <tr><td style="color: #64748b; font-weight: 600;">Work Email:</td><td><a href="mailto:{$safe_email}" style="color: #ea580c; text-decoration: none;">{$safe_email}</a></td></tr>
                <tr><td style="color: #64748b; font-weight: 600;">Phone / WhatsApp:</td><td><a href="tel:{$safe_phone}" style="color: #002d62; text-decoration: none; font-weight: 600;">{$safe_phone}</a></td></tr>
                <tr><td style="color: #64748b; font-weight: 600;">Target Audience:</td><td style="color: #0f172a;">{$safe_level}</td></tr>
                <tr><td style="color: #64748b; font-weight: 600;">Batch Size &amp; Mode:</td><td style="color: #0f172a;">{$safe_batch}</td></tr>
                <tr><td style="color: #64748b; font-weight: 600;">Received Time:</td><td style="color: #64748b;">{$current_time}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 24px;">
              <h3 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #002d62; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Scope &amp; Requirements</h3>
              <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; color: #334155;">
                {$safe_message}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 28px; text-align: center;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-right: 8px;">
                    <a href="tel:{$safe_phone}" style="display: inline-block; width: 85%; background-color: #002d62; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 6px; font-weight: 600; font-size: 14px; text-align: center;">📞 Call Client</a>
                  </td>
                  <td align="center" style="padding-left: 8px;">
                    <a href="mailto:{$safe_email}?subject=RE:%20Omtech%20Proposal%20[{$safe_ref}]%20-%20{$safe_service}" style="display: inline-block; width: 85%; background-color: #ea580c; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 6px; font-weight: 700; font-size: 14px; text-align: center;">✉️ Reply by Email</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #001226; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 6px; color: #cbd5e1; font-weight: 600;">OMTECH CORPORATION</p>
              <p style="margin: 0 0 6px;">502, Ajaydeep CHS, Plot No. 19, Sector 19, Kharghar, Navi Mumbai – 410210</p>
              <p style="margin: 0; font-size: 11px; color: #64748b;">Automated dispatch from Omtech Corporation Portal.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

$headers  = "From: Omtech Portal <safehands@omtechcorporation.com>\r\n";
if (!empty($email)) {
    $headers .= "Reply-To: " . $name . " <" . $email . ">\r\n";
}
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$mail_sent1 = @mail($primary_to, $subject, $email_body, $headers, "-fsafehands@omtechcorporation.com");
if (!$mail_sent1) {
    $mail_sent1 = @mail($primary_to, $subject, $email_body, $headers);
}
$mail_sent2 = @mail($corp_to, $subject, $email_body, $headers, "-fsafehands@omtechcorporation.com");
if (!$mail_sent2) {
    $mail_sent2 = @mail($corp_to, $subject, $email_body, $headers);
}
@mail($cc, $subject, $email_body, $headers);
$mail_sent = $mail_sent1 || $mail_sent2;

// Construct Lead Record
$new_lead = [
    "id"                => (string)time() . rand(100, 999),
    "reference_id"      => $ref_id,
    "date"              => date("Y-m-d H:i"),
    "name"              => $name,
    "company"           => $company,
    "contact"           => trim(($email ? $email : "") . ($phone ? (" | " . $phone) : ""), " | "),
    "phone"             => $phone,
    "email"             => $email,
    "service"           => $service,
    "participant_level" => $p_level,
    "batch_size"        => $b_size,
    "message"           => $message,
    "notes"             => $message,
    "status"            => "New"
];

// Save to MySQL database if available
$pdo = get_db_connection();
if ($pdo) {
    try {
        $stmt = $pdo->prepare("INSERT INTO enquiries (reference_id, date, name, company, contact, phone, email, service, participant_level, batch_size, message, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')");
        $stmt->execute([
            $ref_id,
            $new_lead['date'],
            $name,
            $company,
            $new_lead['contact'],
            $phone,
            $email,
            $service,
            $p_level,
            $b_size,
            $message,
            $message
        ]);
        $new_lead['db_saved'] = true;
    } catch (Exception $e) {}
}

// Always persist to server JSON log
$existing_leads = file_exists($log_file) ? json_decode(file_get_contents($log_file), true) : [];
if (!is_array($existing_leads)) $existing_leads = [];
array_unshift($existing_leads, $new_lead);
@file_put_contents($log_file, json_encode($existing_leads, JSON_PRETTY_PRINT));

echo json_encode([
    "status"       => "success",
    "message"      => "Proposal request received and logged.",
    "reference_id" => $ref_id,
    "mail_sent"    => $mail_sent,
    "lead_id"      => $new_lead["id"]
]);
