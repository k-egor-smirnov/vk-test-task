<?php
include_once './API.php';

if (!isset($_GET['offset'])) {
    die("please provide offset parameter");
}

$offset = $_GET['offset'];
$access_token = $_COOKIE['access_token'];

if (isset($_GET['q'])) {
    $result = search($access_token, $offset, $_GET['q']);

} else {
    $result = get($access_token, $offset);
}

$json = json_encode($result);
$json = mb_convert_encoding($json, 'utf-8');
echo $json;

function get($access_token, $offset)
{
    $querystring = http_build_query(array(
        'access_token' => $access_token,
        'v' => '5.78',
        'offset' => $offset,
        'order' => 'hints',
        'count' => 20,
        'fields' => 'contacts,photo_100,education,online',
    ));

    $response = @file_get_contents("https://api.vk.com/method/friends.get?" . $querystring);
    $friends = json_decode($response)->response->items;

    if (count($friends) <= 0) {
        die('[]');
    }

    $mutual = getMutual($access_token, $offset, $friends);
    $result = concatFriends($friends, $mutual);

    return $result;
}

function search($access_token, $offset, $q)
{
    $querystring = http_build_query(array(
        'access_token' => $access_token,
        'v' => '5.78',
        'offset' => $offset,
        'count' => 20,
        'fields' => 'contacts,photo_100,education,online',
        'q' => $q,
    ));

    $response = @file_get_contents("https://api.vk.com/method/friends.search?" . $querystring);
    $friends = json_decode($response)->response->items;

    if (count($friends) <= 0) {
        die('[]');
    }

    $mutual = getMutual($access_token, $offset, $friends);
    $result = concatFriends($friends, $mutual);

    return $result;

}

function getMutual($access_token, $offset, $friends)
{
    $ids = '';
    foreach ($friends as $person) {
        $ids = $ids . $person->id . ',';
    }

    $querystring = http_build_query(array(
        'access_token' => $access_token,
        'v' => '5.78',
        'target_uids' => $ids,
    ));

    try {
        $response = @file_get_contents("https://api.vk.com/method/friends.getMutual?" . $querystring);
        $mutual = json_decode($response)->response;
    } catch (Exception $e) {
        die('[]');
    }

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
