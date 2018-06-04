<?php
include_once './API.php';

$mc = new Memcached();
$mc->addServer('localhost', 8000);

if (!isset($_GET['offset'])) {
    die("please provide offset parameter");
}

$offset = $_GET['offset'];
$access_token = $_COOKIE['access_token'];

$api = new API($access_token, $mc);

if (isset($_GET['q'])) {
    $result = search($api, $offset, $_GET['q']);

} else {
    $result = get($api, $offset);
}

$json = json_encode($result);
$json = mb_convert_encoding($json, 'utf-8');

echo $json;

function get($api, $offset)
{
    $response = $api->request("friends.get", array(
        'access_token' => $api->access_token,
        'v' => '5.78',
        'offset' => $offset,
        'order' => 'hints',
        'count' => 20,
        'fields' => 'contacts,photo_100,education,online',
    ));

    if (isset($response->error)) {
        echo $response->error->error_msg;
    }

    $friends = $response->response->items;

    if (count($friends) <= 0) {
        die('[]');
    }

    $mutual = getMutual($api, $offset, $friends);
    $result = concatFriends($friends, $mutual);

    return $result;
}

function search($access_token, $offset, $q)
{

    $response = $api->request("friends.search", array(
        'access_token' => $api->access_token,
        'v' => '5.78',
        'offset' => $offset,
        'count' => 20,
        'fields' => 'contacts,photo_100,education,online',
        'q' => $q,
    ));

    if (isset($response->error)) {
        echo $response->error->error_msg;
    }

    $friends = $response->response->items;

    if (count($friends) <= 0) {
        die('[]');
    }

    $mutual = getMutual($api, $offset, $friends);
    $result = concatFriends($friends, $mutual);

    return $result;

}

function getMutual($api, $offset, $friends)
{
    $ids = '';
    foreach ($friends as $person) {
        $ids = $ids . $person->id . ',';
    }

    $response = $api->request('friends.getMutual', array(
        'access_token' => $api->access_token,
        'v' => '5.78',
        'target_uids' => $ids,
    ));

    $mutual = $response->response;

    return $mutual;
}

/**
 * Объединяет массив друзей со списком общих друзей каждого
 */
function concatFriends($friends, $mutual)
{
    $result = array();
    for ($i = 0; $i < count($mutual); $i++) {
        $person = array(
            'id' => $friends[$i]->id,
            'mutual' => $mutual[$i]->common_count,
            'first_name' => $friends[$i]->first_name,
            'last_name' => $friends[$i]->last_name,
            'online' => $friends[$i]->online,
            'photo_100' => $friends[$i]->photo_100,
        );

        if (isset($friends[$i]->university_name)) {
            $person['university_name'] = $friends[$i]->university_name;

        }

        array_push($result, $person);
    }

    return $result;

}
