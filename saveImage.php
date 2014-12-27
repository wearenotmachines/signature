<?php
$data = $_REQUEST['imgData'];
$data = substr($data,strpos($data,",")+1);
$data = str_replace(" ", "+", $data);
file_put_contents(getcwd()."/images/test/".uniqid().".png", base64_decode($data));