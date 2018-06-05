<?php

class API
{
    public function __construct($access_token, $mc)
    {
        $this->mc = $mc;
        $this->access_token = $access_token;
    }

    public function request($method, $params)
    {
        $key = md5("https://api.vk.com/method/$method?" . serialize($params));

        if ($this->mc->get($key)) {
            return $this->mc->get($key);
        }

        $options = array(
            'http' => array(
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => 'POST',
                'content' => http_build_query($params),
            ),
        );
        $context = stream_context_create($options);

        $response = @file_get_contents("https://api.vk.com/method/$method", false, $context);

        $this->mc->set($key, json_decode($response), 10);
        return json_decode($response);
    }
}
