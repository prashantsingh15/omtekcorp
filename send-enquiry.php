<?php
// ==============================================================================
// OMTECH CORPORATION - OFFICIAL ENQUIRY INTAKE & DISPATCH HANDLER
// Routes proposals and technical training RFQs directly to safehands@omtechcorporation.com
// ==============================================================================

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed. POST required."]);
    exit();
}

// Read raw JSON input
$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    $input = $_POST;
}

$name    = isset($input['name']) && trim($input['name']) !== '' ? trim(strip_tags($input['name'])) : 'Client';
$email   = isset($input['email']) ? trim(filter_var($input['email'], FILTER_SANITIZE_EMAIL)) : '';
$phone   = isset($input['phone']) ? trim(strip_tags($input['phone'])) : '';
$company = isset($input['company']) && trim($input['company']) !== '' && trim($input['company']) !== 'Not Specified' && trim($input['company']) !== 'Modal Lead' ? trim(strip_tags($input['company'])) : 'Direct Engagement';
$service = isset($input['service']) && trim($input['service']) !== '' ? trim(strip_tags($input['service'])) : 'Technical & HSE Advisory';
$message = isset($input['message']) ? trim(strip_tags($input['message'])) : '';

if (empty($name) || (empty($email) && empty($phone))) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Name and at least one contact method (email or phone) are required."]);
    exit();
}

// Destination and routing (Primary Gmail + Corporate Inbox + CC)
$primary_to = "omtechcorp2402@gmail.com";
$corp_to    = "safehands@omtechcorporation.com";
$cc         = "kkamleshmishra2@gmail.com";
$subject = ($company !== 'Direct Engagement') 
    ? "⚡ [Omtech Proposal] " . $service . " — " . $company
    : "⚡ [Omtech Proposal] " . $service . " — " . $name;

// Professional Executive HTML Email Template
$safe_name    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safe_company = htmlspecialchars($company, ENT_QUOTES, 'UTF-8');
$safe_email   = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safe_phone   = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$safe_service = htmlspecialchars($service, ENT_QUOTES, 'UTF-8');
$safe_message = nl2br(htmlspecialchars($message ? $message : "No specific notes provided.", ENT_QUOTES, 'UTF-8'));
$current_time = date("d M Y, h:i A T");

$email_body = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Proposal Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 620px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #001a38 0%, #002d62 100%); padding: 28px 32px; text-align: left; border-bottom: 4px solid #c99732;">
              <table width="100%">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #c99732; display: block; margin-bottom: 4px;">OFFICIAL INQUIRY INTAKE</span>
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">OMTECH CORPORATION</h1>
                    <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">ISO 9001:2015 Certified Technical & HSE Advisory</p>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background: rgba(201, 151, 50, 0.15); border: 1px solid #c99732; color: #f6d28b; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">New Proposal</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Summary Highlight Box -->
          <tr>
            <td style="padding: 24px 32px 16px;">
              <div style="background-color: #f8fafc; border-left: 4px solid #002d62; border-radius: 6px; padding: 14px 18px;">
                <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Requested Service / Division</p>
                <p style="margin: 4px 0 0; font-size: 17px; color: #002d62; font-weight: 700;">{$safe_service}</p>
              </div>
            </td>
          </tr>

          <!-- Client Details Table -->
          <tr>
            <td style="padding: 8px 32px 20px;">
              <h3 style="margin: 0 0 14px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #002d62; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Client Information</h3>
              
              <table width="100%" cellspacing="0" cellpadding="8" style="font-size: 14px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td width="36%" style="color: #64748b; font-weight: 600; padding: 10px 0;">Client / Contact Person</td>
                  <td width="64%" style="color: #0f172a; font-weight: 600; padding: 10px 0;">{$safe_name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="color: #64748b; font-weight: 600; padding: 10px 0;">Company / Facility</td>
                  <td style="color: #0f172a; font-weight: 600; padding: 10px 0;">{$safe_company}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="color: #64748b; font-weight: 600; padding: 10px 0;">Phone / Mobile</td>
                  <td style="color: #002d62; font-weight: 700; padding: 10px 0;">
                    <a href="tel:{$safe_phone}" style="color: #002d62; text-decoration: none;">{$safe_phone}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="color: #64748b; font-weight: 600; padding: 10px 0;">Email Address</td>
                  <td style="color: #002d62; font-weight: 600; padding: 10px 0;">
                    <a href="mailto:{$safe_email}" style="color: #0284c7; text-decoration: none;">{$safe_email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600; padding: 10px 0;">Submission Time</td>
                  <td style="color: #475569; padding: 10px 0;">{$current_time}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Scope / Requirements Section -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h3 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #002d62; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Scope & Project Requirements</h3>
              <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; color: #334155;">
                {$safe_message}
              </div>
            </td>
          </tr>

          <!-- Quick Action Buttons -->
          <tr>
            <td style="padding: 0 32px 28px; text-align: center;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-right: 8px;">
                    <a href="tel:{$safe_phone}" style="display: inline-block; width: 85%; background-color: #002d62; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 6px; font-weight: 600; font-size: 14px; text-align: center; box-shadow: 0 2px 6px rgba(0,45,98,0.2);">
                      📞 Call Client Now
                    </a>
                  </td>
                  <td align="center" style="padding-left: 8px;">
                    <a href="mailto:{$safe_email}?subject=RE:%20Omtech%20Proposal%20-%20{$safe_service}" style="display: inline-block; width: 85%; background-color: #c99732; color: #001a38; text-decoration: none; padding: 12px 18px; border-radius: 6px; font-weight: 700; font-size: 14px; text-align: center; box-shadow: 0 2px 6px rgba(201,151,50,0.2);">
                      ✉️ Reply by Email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #001226; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 6px; color: #cbd5e1; font-weight: 600;">OMTECH CORPORATION</p>
              <p style="margin: 0 0 6px;">502, Ajaydeep CHS, Plot No. 19, Sector 19, Kharghar, Navi Mumbai – 410210</p>
              <p style="margin: 0; font-size: 11px; color: #64748b;">This is an automated dispatch from the official Omtech Corporation web portal.</p>
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
$headers .= "Cc: " . $cc . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

// Attempt to send email independently to primary Gmail and corporate inbox
$mail_sent1 = @mail($primary_to, $subject, $email_body, $headers);
$mail_sent2 = @mail($corp_to, $subject, $email_body, $headers);
$mail_sent  = $mail_sent1 || $mail_sent2;

// Also log lead to local JSON storage for backup redundancy
$log_dir = __DIR__ . "/assets/data";
if (!is_dir($log_dir)) {
    @mkdir($log_dir, 0755, true);
}
$log_file = $log_dir . "/leads_backup.json";
$existing_leads = file_exists($log_file) ? json_decode(file_get_contents($log_file), true) : [];
if (!is_array($existing_leads)) $existing_leads = [];

$new_lead = [
    "id"      => time(),
    "date"    => date("Y-m-d H:i"),
    "name"    => $name,
    "company" => $company,
    "contact" => trim($email . " / " . $phone, " / "),
    "service" => $service,
    "message" => $message,
    "status"  => "New"
];

array_unshift($existing_leads, $new_lead);
@file_put_contents($log_file, json_encode($existing_leads, JSON_PRETTY_PRINT));

echo json_encode([
    "status"    => "success",
    "message"   => "Proposal request received and dispatched to safehands@omtechcorporation.com",
    "mail_sent" => $mail_sent,
    "lead_id"   => $new_lead["id"]
]);
