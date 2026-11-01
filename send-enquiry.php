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

$name    = isset($input['name']) ? trim(strip_tags($input['name'])) : 'Prospective Client';
$email   = isset($input['email']) ? trim(filter_var($input['email'], FILTER_SANITIZE_EMAIL)) : '';
$phone   = isset($input['phone']) ? trim(strip_tags($input['phone'])) : '';
$company = isset($input['company']) ? trim(strip_tags($input['company'])) : 'Not Specified';
$service = isset($input['service']) ? trim(strip_tags($input['service'])) : 'General Technical Advisory';
$message = isset($input['message']) ? trim(strip_tags($input['message'])) : '';

if (empty($name) || (empty($email) && empty($phone))) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Name and at least one contact method (email or phone) are required."]);
    exit();
}

// Destination and routing (Corporate Inbox + Direct Gmail Forward)
$to = "safehands@omtechcorporation.com, omtechcorp2402@gmail.com";
$cc = "kkamleshmishra2@gmail.com";
$subject = "New Proposal Request: " . $service . " — " . $company;

$email_body  = "========================================================\r\n";
$email_body .= "OMTECH CORPORATION - PROPOSAL & RFQ INTAKE\r\n";
$email_body .= "========================================================\r\n\r\n";
$email_body .= "Client Name:   " . $name . "\r\n";
$email_body .= "Company/Plant: " . $company . "\r\n";
$email_body .= "Email:         " . $email . "\r\n";
$email_body .= "Phone/Mobile:  " . $phone . "\r\n";
$email_body .= "Service/Scope: " . $service . "\r\n";
$email_body .= "Date & Time:   " . date("Y-m-d H:i:s T") . "\r\n\r\n";
$email_body .= "--------------------------------------------------------\r\n";
$email_body .= "PROJECT SCOPE & REQUIREMENTS:\r\n";
$email_body .= "--------------------------------------------------------\r\n";
$email_body .= ($message ? $message : "No specific notes provided.") . "\r\n\r\n";
$email_body .= "========================================================\r\n";
$email_body .= "This enquiry was submitted through the official Omtech Corporation website.\r\n";

$headers  = "From: Omtech Website <safehands@omtechcorporation.com>\r\n";
if (!empty($email)) {
    $headers .= "Reply-To: " . $name . " <" . $email . ">\r\n";
}
$headers .= "Cc: " . $cc . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Attempt to send email
$mail_sent = @mail($to, $subject, $email_body, $headers);

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
