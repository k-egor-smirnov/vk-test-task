<?php
$client_id = 6495253;
$client_secret = "Z5PRMKXEv0NqXL95APCO";

$redirect_url = "http://$_SERVER[HTTP_HOST]/login.php";
$auth_url = "https://oauth.vk.com/authorize?client_id=$client_id&display=page&redirect_uri=$redirect_url&scope=friends,offline&response_type=code&v=5.78";

if (!isset($_GET['code'])) {
    header("Location: $auth_url");
} else {
    $response = @file_get_contents("https://oauth.vk.com/access_token?client_id=$client_id&client_secret=$client_secret&redirect_uri=$redirect_url&code=" . $_GET['code']);

    if ($response === false) {
        echo "request error";
    } else {
        $data = json_decode($response);

        setcookie('access_token', $data->access_token);
        header("Location: /");
    }
}
