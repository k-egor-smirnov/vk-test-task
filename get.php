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
    $response = $api->request("friends.search", array(
        'access_token' => $api->access_token,
        'v' => '5.78',
        'offset' => $offset,
        'count' => 20,
        'order' => 'hints',
        'fields' => 'contacts,photo_100,education,online,online_mobile',
    ));

    if (isset($response->error)) {
        echo $response->error->error_msg;
    }

    if (!isset($response)) {
        die('[]');
    }

    $friends = $response->response->items;
    $total = $response->response->count;

    if (count($friends) <= 0) {
        die('[]');
    }

    $mutual = getMutual($api, $offset, $friends);
    $result = concatFriends($friends, $mutual, $total);

    return $result;
}

function search($api, $offset, $q)
{
    $response = $api->request("friends.search", array(
        'access_token' => $api->access_token,
        'v' => '5.78',
        'offset' => $offset,
        'count' => 20,
        'fields' => 'contacts,photo_100,education,online,online_mobile',
        'order' => 'hints',
        'q' => $q,
        'from_list' => 'friends',
    ));

    if (isset($response->error)) {
        echo $response->error->error_msg;
    }

    if (!isset($response)) {
        die('[]');
    }

    $friends = $response->response->items;
    $total = $response->response->count;

    if (count($friends) <= 0) {
        die('[]');
    }

    $mutual = getMutual($api, $offset, $friends);
    $result = concatFriends($friends, $mutual, $total);

    return $result;

}

function getMutual($api, $offset, $friends)
{
    $ids = '';
    $mutual = array();

    foreach ($friends as $person) {
        if (!isset($person->deactivated)) {
            $ids = $ids . $person->id . ',';
        } else {
            array_push($mutual, (object) array("common_count" => 0, "id" => $person->id));
        }
    }

    if (strlen($ids) <= 0) {
        return $mutual;
    }

    $response = $api->request('friends.getMutual', array(
        'access_token' => $api->access_token,
        'v' => '5.78',
        'target_uids' => $ids,
        'count' => 0,
        'offset' => 1,
    ));

    $mutual = array_merge($response->response, $mutual);

    return $mutual;
}

/**
 * Объединяет массив друзей со списком общих друзей каждого
 */
function concatFriends($friends, $mutual, $total)
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

        if (isset($friends[$i]->online_mobile)) {
            $person['online_mobile'] = $friends[$i]->online_mobile;
        }

        array_push($result, $person);
    }

    return array('count' => $total, 'items' => $result);

}
