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
        $querystring = http_build_query($params);
        $key = md5("https://api.vk.com/method/$method?" . $querystring);

        if ($this->mc->get($key)) {
            return $this->mc->get($key);
        }

        $response = @file_get_contents("https://api.vk.com/method/$method?" . $querystring);

        $this->mc->set($key, json_decode($response), 10);
        return json_decode($response);
    }
}
