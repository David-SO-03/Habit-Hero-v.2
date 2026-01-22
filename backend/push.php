$auth = [
    'VAPID' => [
        'subject' => $_ENV['VAPID_SUBJECT'],
        'publicKey' => $_ENV['VAPID_PUBLIC_KEY'],
        'privateKey' => $_ENV['VAPID_PRIVATE_KEY'],
    ],
];
